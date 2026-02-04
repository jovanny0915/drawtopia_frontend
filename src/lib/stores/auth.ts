/**
 * Authentication store
 * This module provides reactive authentication state management
 */

import { writable, derived } from 'svelte/store';
import { supabase, AUTH_STORAGE_KEY } from '../supabase';
import { registerUser, registerGoogleOAuthUser, updateUserLastLogin } from '../auth';
import type { User, Session } from '@supabase/supabase-js';

// User with profile fields from custom users table (for display name, etc.)
export type UserWithProfile = User & { first_name?: string | null; last_name?: string | null };

// Auth state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  first_name: string | null;
  last_name: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  first_name: null,
  last_name: null
};

/** Fetch first_name and last_name from custom users table and sync to auth state + sb-auth-token */
async function syncUserProfileToAuth(session: Session | null): Promise<void> {
  if (typeof window === 'undefined' || !session?.user?.id) {
    if (!session) {
      auth.update(s => ({ ...s, first_name: null, last_name: null }));
    }
    return;
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user profile for auth store:', error.message);
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { first_name?: string; last_name?: string };
          auth.update(s => ({
            ...s,
            first_name: parsed.first_name ?? null,
            last_name: parsed.last_name ?? null
          }));
        }
      } catch (_) {}
      return;
    }

    const first_name = data?.first_name ?? null;
    const last_name = data?.last_name ?? null;
    auth.update(s => ({ ...s, first_name, last_name }));
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Record<string, unknown>;
        stored.first_name = first_name;
        stored.last_name = last_name;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored));
      }
    } catch (e) {
      console.warn('Error saving profile to sb-auth-token:', e);
    }
  } catch (e) {
    console.warn('Error syncing user profile to auth:', e);
  }
}

// Create the auth store
export const auth = writable<AuthState>(initialState);

// Initialize auth state and listen for changes
export function initAuth() {
  // Get initial session - this is important for OAuth callbacks
  console.log("initAuth");
  
  // Handle OAuth callback by checking for hash fragments
  const handleOAuthCallback = async () => {
    try {
      // Check if we're coming back from an OAuth redirect
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAccessToken = hashParams.get('access_token');
      const hasError = hashParams.get('error');
      
      if (hasAccessToken || hasError) {
        console.log('OAuth callback detected, processing...', {
          hasAccessToken: !!hasAccessToken,
          hasError: !!hasError,
          error: hasError
        });
        
        // Wait longer for Supabase to process the callback
        // Don't clear hash immediately - let Supabase handle it first
        if (hasAccessToken) {
          // Wait for Supabase to process the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify session was created before clearing hash
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Clear hash from URL only after session is confirmed
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
    }
  };

  // Process OAuth callback if needed
  if (typeof window !== 'undefined') {
    handleOAuthCallback();
  }

  // Get session - retry once if no session found (for OAuth callbacks)
  const getSessionWithRetry = async (retryCount = 0) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
    }
    
    console.log("session", session);
    console.log("user", session?.user);
    
    // If no session but we have OAuth hash params, retry once after a short delay
    if (!session && retryCount === 0 && typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        console.log('OAuth callback detected but no session yet, retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return getSessionWithRetry(1);
      }
    }
    
    // If we have a session with a Google user, check if they need registration
    if (session?.user) {
      const isGoogleProvider = 
        session.user.app_metadata?.provider === 'google' ||
        session.user.identities?.some(identity => identity.provider === 'google');
      
      if (isGoogleProvider) {
        console.log('Google OAuth user found in initial session check');
        // The auth state change listener will handle registration
      }
    }
    
    auth.update(state => ({
      ...state,
      session,
      user: session?.user ?? null,
      loading: false
    }));

    if (session) {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(AUTH_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { first_name?: string; last_name?: string };
            auth.update(s => ({
              ...s,
              first_name: parsed.first_name ?? null,
              last_name: parsed.last_name ?? null
            }));
          }
        } catch (_) {}
      }
      syncUserProfileToAuth(session);
    } else {
      auth.update(s => ({ ...s, first_name: null, last_name: null }));
    }
  };

  getSessionWithRetry();

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      // Update auth state for ALL events (including INITIAL_SESSION on page refresh)
      auth.update(state => ({
        ...state,
        session,
        user: session?.user ?? null,
        loading: false
      }));

      if (session) {
        syncUserProfileToAuth(session);
      } else {
        auth.update(s => ({ ...s, first_name: null, last_name: null }));
      }
      
      // On actual sign-in, update last_login and possibly reset daily upload_cnt
      if (event === 'SIGNED_IN' && session?.user?.id) {
        updateUserLastLogin(session.user.id).catch((err) =>
          console.warn('Failed to update last_login:', err)
        );
      }

      // Handle both SIGNED_IN and TOKEN_REFRESHED events
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const user = session.user;
        // Check if this is a Google OAuth sign-in
        const isGoogleProvider = 
          user.app_metadata?.provider === 'google' ||
          user.identities?.some(identity => identity.provider === 'google');
        
        if (isGoogleProvider && event === 'SIGNED_IN') {
          // Only register on SIGNED_IN, not on TOKEN_REFRESHED
          console.log('Google OAuth user detected, registering to database...');
          console.log('User metadata:', {
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            identities: user.identities
          });
          
          try {
            // Check for pending signup data from sessionStorage
            const pendingSignupData = sessionStorage.getItem('pendingGoogleSignup');
            let result;

            if (pendingSignupData) {
              // User came from signup page with form data
              const formData = JSON.parse(pendingSignupData);
              const userData = {
                id: user.id,
                email: user.email?.toLowerCase().trim(),
                first_name: formData.firstName?.trim(),
                last_name: formData.lastName?.trim(),
                role: formData.accountType,
                google_id: user.user_metadata?.provider_id || user.id,
                created_at: new Date(),
                updated_at: new Date()
              };
              
              // Clear the pending data
              sessionStorage.removeItem('pendingGoogleSignup');
              
              console.log('Registering user with signup form data:', userData);
              result = await registerUser(userData);
            } else {
              // No pending signup data - user signed in directly with Google
              // Register them using data from Google OAuth response
              console.log('No pending signup data found - registering with Google OAuth data');
              result = await registerGoogleOAuthUser(user);
            }

            console.log('User registration result:', result);
            
            if (result.success) {
              console.log('Google OAuth user successfully registered to database');
            } else {
              console.error('Failed to register Google OAuth user:', result.error);
            }
          } catch (error) {
            console.error('Error during Google OAuth user registration:', error);
          }
        }
      }
    }
  );

  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

// Derived stores for convenience
/** User with first_name/last_name from custom users table - use this for display name */
export const user = derived(auth, ($auth): UserWithProfile | null => {
  if (!$auth.user) return null;
  return {
    ...$auth.user,
    first_name: $auth.first_name ?? undefined,
    last_name: $auth.last_name ?? undefined
  };
});
export const session = writable<Session | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const authLoading = writable<boolean>(true);

// Subscribe to main auth store and update derived stores
auth.subscribe(state => {
  console.log("state", state);
  session.set(state.session);
  isAuthenticated.set(!!state.user);
  authLoading.set(state.loading);
});

