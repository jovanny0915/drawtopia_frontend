
import { writable, derived, get } from 'svelte/store';
import { supabase, AUTH_STORAGE_KEY } from '../supabase';
import { registerUser, registerGoogleOAuthUser, updateUserLastLogin, logUserLoginHistory, fetchPhoneSessionUser, clearPhoneSession, PHONE_TOKEN_STORAGE_KEY, signOut } from '../auth';
import type { PhoneSession } from '../auth';
import type { User, Session } from '@supabase/supabase-js';

export type UserWithProfile = User & { first_name?: string | null; last_name?: string | null };

export type AppSession = Session | PhoneSession | null;

interface AuthState {
  user: User | null;
  session: AppSession;
  loading: boolean;
  first_name: string | null;
  last_name: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  first_name: null,
  last_name: null
};

const SESSION_STARTED_AT_KEY = 'drawtopia_session_started_at';
const DEFAULT_MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;
const maxSessionAgeMs = (() => {
  const configured = Number(import.meta.env.VITE_MAX_SESSION_AGE_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_SESSION_AGE_MS;
})();

let hardTimeoutCheckInterval: ReturnType<typeof setInterval> | null = null;

function clearSessionStartMarker(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

function setSessionStartMarker(timestampMs: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STARTED_AT_KEY, String(timestampMs));
}

function ensureSessionStartMarker(): number {
  if (typeof window === 'undefined') return Date.now();

  const current = localStorage.getItem(SESSION_STARTED_AT_KEY);
  const parsed = current ? Number(current) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  const now = Date.now();
  setSessionStartMarker(now);
  return now;
}

function resetSessionStartMarker(): void {
  setSessionStartMarker(Date.now());
}

async function enforceHardSessionTimeout(session: AppSession): Promise<boolean> {
  if (typeof window === 'undefined' || !session) return false;

  const startedAtMs = ensureSessionStartMarker();
  if (Date.now() - startedAtMs <= maxSessionAgeMs) {
    return false;
  }

  console.warn('Session exceeded hard max age. Signing out user.');
  await signOut();
  clearSessionStartMarker();
  return true;
}

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

export const auth = writable<AuthState>(initialState);

export function initAuth() {
  console.log("initAuth");
  
  const handleOAuthCallback = async () => {
    try {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAccessToken = hashParams.get('access_token');
      const hasError = hashParams.get('error');
      
      if (hasAccessToken || hasError) {
        console.log('OAuth callback detected, processing...', {
          hasAccessToken: !!hasAccessToken,
          hasError: !!hasError,
          error: hasError
        });
        
        if (hasAccessToken) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
    }
  };

  if (typeof window !== 'undefined') {
    handleOAuthCallback();
  }

  const getSessionWithRetry = async (retryCount = 0) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
    }
    
    console.log("session", session);
    console.log("user", session?.user);
    
    if (!session && retryCount === 0 && typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        console.log('OAuth callback detected but no session yet, retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return getSessionWithRetry(1);
      }
    }
    
    if (session?.user) {
      const isGoogleProvider = 
        session.user.app_metadata?.provider === 'google' ||
        session.user.identities?.some(identity => identity.provider === 'google');
      
      if (isGoogleProvider) {
        console.log('Google OAuth user found in initial session check');
      }
    }
    
    if (session) {
      ensureSessionStartMarker();
      const timedOut = await enforceHardSessionTimeout(session);
      if (timedOut) {
        auth.update(state => ({
          ...state,
          session: null,
          user: null,
          loading: false
        }));
        return;
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
      syncUserProfileToAuth(session as Session);
    } else {
      auth.update(s => ({ ...s, first_name: null, last_name: null }));
    }

    if (!session && typeof window !== 'undefined') {
      const phoneToken = localStorage.getItem(PHONE_TOKEN_STORAGE_KEY);
      if (phoneToken) {
        fetchPhoneSessionUser().then((result) => {
          if (result.success && result.user) {
            const u = result.user as UserWithProfile;
            enforceHardSessionTimeout({ access_token: phoneToken }).then((timedOut) => {
              if (timedOut) {
                return;
              }

              ensureSessionStartMarker();
              auth.update(state => ({
                ...state,
                session: { access_token: phoneToken },
                user: result.user ?? null,
                loading: false,
                first_name: u?.first_name ?? null,
                last_name: u?.last_name ?? null
              }));
            }).catch(() => {
              clearPhoneSession();
              clearSessionStartMarker();
              auth.update(s => ({ ...s, loading: false }));
            });
          } else {
            clearPhoneSession();
            clearSessionStartMarker();
            auth.update(state => ({
              ...state,
              session: null,
              user: null,
              loading: false,
              first_name: null,
              last_name: null
            }));
          }
        }).catch(() => {
          clearPhoneSession();
          clearSessionStartMarker();
          auth.update(s => ({ ...s, loading: false }));
        });
        return;
      }

      clearSessionStartMarker();
    }
  };

  getSessionWithRetry();

  const onSignOut = () => {
    clearSessionStartMarker();
    auth.update(state => ({
      ...state,
      session: null,
      user: null,
      first_name: null,
      last_name: null,
      loading: false
    }));
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('drawtopia-signout', onSignOut);
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session);

      if (event === 'SIGNED_OUT' || !session) {
        clearSessionStartMarker();
      } else if (event === 'SIGNED_IN') {
        resetSessionStartMarker();
      } else {
        ensureSessionStartMarker();
      }

      if (session) {
        const timedOut = await enforceHardSessionTimeout(session);
        if (timedOut) {
          auth.update(state => ({
            ...state,
            session: null,
            user: null,
            loading: false,
            first_name: null,
            last_name: null
          }));
          return;
        }
      }
      
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
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        updateUserLastLogin(session.user.id).catch((err) =>
          console.warn('Failed to update last_login:', err)
        );

        const isGoogleProvider =
          session.user.app_metadata?.provider === 'google' ||
          session.user.identities?.some(identity => identity.provider === 'google');

        if (isGoogleProvider) {
          logUserLoginHistory(session.user.id, 'google_oauth').catch((err) =>
            console.warn('Failed to log Google login history:', err)
          );
        }
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const user = session.user;
        const isGoogleProvider = 
          user.app_metadata?.provider === 'google' ||
          user.identities?.some(identity => identity.provider === 'google');
        
        if (isGoogleProvider && event === 'SIGNED_IN') {
          console.log('Google OAuth user detected, registering to database...');
          console.log('User metadata:', {
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            identities: user.identities
          });
          
          try {
            const pendingSignupData = sessionStorage.getItem('pendingGoogleSignup');
            let result;

            if (pendingSignupData) {
              const formData = JSON.parse(pendingSignupData);
              const userData = {
                id: user.id,
                email: user.email?.toLowerCase().trim(),
                first_name: formData.firstName?.trim(),
                last_name: formData.lastName?.trim(),
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                role: formData.accountType,
                google_id: user.user_metadata?.provider_id || user.id,
                created_at: new Date(),
                updated_at: new Date()
              };
              
              sessionStorage.removeItem('pendingGoogleSignup');
              
              console.log('Registering user with signup form data:', userData);
              result = await registerUser(userData);
            } else {
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

  if (typeof window !== 'undefined') {
    if (hardTimeoutCheckInterval) {
      clearInterval(hardTimeoutCheckInterval);
      hardTimeoutCheckInterval = null;
    }
    hardTimeoutCheckInterval = setInterval(async () => {
      const state = get(auth);
      const session = state.session;
      if (!session) {
        clearSessionStartMarker();
        return;
      }
      await enforceHardSessionTimeout(session);
    }, 60 * 1000);
  }

  return () => {
    subscription.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('drawtopia-signout', onSignOut);
    }
    if (hardTimeoutCheckInterval) {
      clearInterval(hardTimeoutCheckInterval);
      hardTimeoutCheckInterval = null;
    }
  };
}

export const user = derived(auth, ($auth): UserWithProfile | null => {
  if (!$auth.user) return null;
  return {
    ...$auth.user,
    first_name: $auth.first_name ?? undefined,
    last_name: $auth.last_name ?? undefined
  };
});
export const session = writable<AppSession>(null);
export const isAuthenticated = writable<boolean>(false);
export const authLoading = writable<boolean>(true);

auth.subscribe(state => {
  console.log("state", state);
  session.set(state.session);
  isAuthenticated.set(!!state.user);
  authLoading.set(state.loading);
});

