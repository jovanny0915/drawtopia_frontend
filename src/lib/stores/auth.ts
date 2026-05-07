
import { writable, derived, get } from 'svelte/store';
import { supabase, AUTH_STORAGE_KEY } from '../supabase';
import { registerUser, registerGoogleOAuthUser, updateUserLastLogin, logUserLoginHistory, fetchPhoneSessionUser, clearPhoneSession, PHONE_TOKEN_STORAGE_KEY, signOut, clearLocalAuthState, SIGN_OUT_EVENT_STORAGE_KEY, getAuthUserAvatarUrl } from '../auth';
import type { PhoneSession } from '../auth';
import type { User, Session } from '@supabase/supabase-js';

export type UserWithProfile = User & { first_name?: string | null; last_name?: string | null; avatar_url?: string | null };

export type AppSession = Session | PhoneSession | null;

interface AuthState {
  user: User | null;
  session: AppSession;
  loading: boolean;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  first_name: null,
  last_name: null,
  avatar_url: null
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
      auth.update(s => ({ ...s, first_name: null, last_name: null, avatar_url: null }));
    }
    return;
  }
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch user profile for auth store:', error.message);
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { first_name?: string; last_name?: string; avatar_url?: string };
          auth.update(s => ({
            ...s,
            first_name: parsed.first_name ?? null,
            last_name: parsed.last_name ?? null,
            avatar_url: parsed.avatar_url ?? getAuthUserAvatarUrl(session.user)
          }));
        }
      } catch (_) {}
      return;
    }

    const first_name = data?.first_name ?? null;
    const last_name = data?.last_name ?? null;
    const avatar_url = data?.avatar_url ?? getAuthUserAvatarUrl(session.user);
    auth.update(s => ({ ...s, first_name, last_name, avatar_url }));
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Record<string, unknown>;
        stored.first_name = first_name;
        stored.last_name = last_name;
        stored.avatar_url = avatar_url;
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

function isGoogleAuthUser(user: User | null | undefined): boolean {
  return !!(
    user &&
    (user.app_metadata?.provider === 'google' ||
      user.identities?.some(identity => identity.provider === 'google'))
  );
}

async function ensureGoogleOAuthUserProfile(user: User, usePendingSignupData: boolean): Promise<boolean> {
  if (!isGoogleAuthUser(user)) return false;

  try {
    const pendingSignupData = usePendingSignupData ? sessionStorage.getItem('pendingGoogleSignup') : null;
    let result;

    if (pendingSignupData) {
      const formData = JSON.parse(pendingSignupData);
      const now = new Date().toISOString();
      const userData = {
        id: user.id,
        email: user.email?.toLowerCase().trim() || '',
        first_name: formData.firstName?.trim() || '',
        last_name: formData.lastName?.trim() || '',
        avatar_url: getAuthUserAvatarUrl(user),
        role: formData.accountType || 'adult',
        google_id: user.user_metadata?.provider_id || user.identities?.find(identity => identity.provider === 'google')?.id || user.id,
        created_at: now,
        updated_at: now
      };

      console.log('Registering user with signup form data:', userData);
      result = await registerUser(userData);
      if (result.success) {
        sessionStorage.removeItem('pendingGoogleSignup');
      }
    } else {
      console.log('Ensuring Google OAuth user exists in database');
      result = await registerGoogleOAuthUser(user);
    }

    if (result.success) {
      console.log('Google OAuth user profile is synced');
      return true;
    }

    console.error('Failed to sync Google OAuth user:', result.error);
  } catch (error) {
    console.error('Error during Google OAuth user registration:', error);
  }

  return false;
}

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
    let { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
    }
    
    console.log("session", session);
    console.log("user", session?.user);

    if (session) {
      const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !verifiedUser) {
        console.warn('Stored auth session is invalid. Clearing local session.', userError?.message);
        clearLocalAuthState();
        session = null;
      }
    }
    
    if (!session && retryCount === 0 && typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (hashParams.get('access_token')) {
        console.log('OAuth callback detected but no session yet, retrying...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return getSessionWithRetry(1);
      }
    }
    
    if (session?.user) {
      if (isGoogleAuthUser(session.user)) {
        console.log('Google OAuth user found in initial session check');
        await ensureGoogleOAuthUserProfile(session.user, true);
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
          loading: false,
          first_name: null,
          last_name: null,
          avatar_url: null
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
            const parsed = JSON.parse(raw) as { first_name?: string; last_name?: string; avatar_url?: string };
            auth.update(s => ({
              ...s,
              first_name: parsed.first_name ?? null,
              last_name: parsed.last_name ?? null,
              avatar_url: parsed.avatar_url ?? getAuthUserAvatarUrl(session.user)
            }));
          }
        } catch (_) {}
      }
      syncUserProfileToAuth(session as Session);
    } else {
      auth.update(s => ({ ...s, first_name: null, last_name: null, avatar_url: null }));
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
                last_name: u?.last_name ?? null,
                avatar_url: u?.avatar_url ?? null
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
              last_name: null,
              avatar_url: null
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
    clearLocalAuthState();
    clearSessionStartMarker();
    auth.update(state => ({
      ...state,
      session: null,
      user: null,
      first_name: null,
      last_name: null,
      avatar_url: null,
      loading: false
    }));
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIGN_OUT_EVENT_STORAGE_KEY && event.newValue) {
      onSignOut();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('drawtopia-signout', onSignOut);
    window.addEventListener('storage', onStorage);
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
            last_name: null,
            avatar_url: null
          }));
          return;
        }
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && isGoogleAuthUser(session.user)) {
        console.log('Google OAuth user detected, syncing database profile...');
        await ensureGoogleOAuthUserProfile(session.user, event === 'SIGNED_IN');
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
        auth.update(s => ({ ...s, first_name: null, last_name: null, avatar_url: null }));
      }
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        updateUserLastLogin(session.user.id).catch((err) =>
          console.warn('Failed to update last_login:', err)
        );

        if (isGoogleAuthUser(session.user)) {
          logUserLoginHistory(session.user.id, 'google_oauth').catch((err) =>
            console.warn('Failed to log Google login history:', err)
          );
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
      window.removeEventListener('storage', onStorage);
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
    last_name: $auth.last_name ?? undefined,
    avatar_url: $auth.avatar_url ?? getAuthUserAvatarUrl($auth.user)
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

