/**
 * Authentication store
 * This module provides reactive authentication state management
 */

import { writable } from 'svelte/store';
import { supabase } from '../supabase';
import { registerUser, registerGoogleOAuthUser } from '../auth';
import type { User, Session } from '@supabase/supabase-js';

// Auth state interface
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true
};

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
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const isAuthenticated = writable<boolean>(false);
export const authLoading = writable<boolean>(true);

// Subscribe to main auth store and update derived stores
auth.subscribe(state => {
  console.log("state", state);
  user.set(state.user);
  session.set(state.session);
  isAuthenticated.set(!!state.user);
  authLoading.set(state.loading);
});

