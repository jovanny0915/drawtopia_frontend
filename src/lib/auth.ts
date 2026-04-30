
import { supabase, supabaseAdmin, AUTH_STORAGE_KEY } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export function isAuthAbortError(err: unknown): boolean {
  if (err == null) return false;
  if (typeof err === 'object' && err !== null && 'name' in err && (err as { name?: string }).name === 'AbortError') {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /aborted|AbortError/i.test(msg);
}

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export const PHONE_TOKEN_STORAGE_KEY = 'drawtopia_phone_token';
const SESSION_STARTED_AT_KEY = 'drawtopia_session_started_at';

export interface PhoneAuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
}

export interface PhoneSession {
  access_token: string;
}

type AuthHistoryEventType = 'login' | 'register';

async function logUserAuthHistory(
  userId: string,
  eventType: AuthHistoryEventType,
  authProvider: string
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('user_auth_history').insert([
      {
        user_id: userId,
        event_type: eventType,
        auth_provider: authProvider
      }
    ]);

    if (error) {
      console.warn(`Failed to log ${eventType} auth history:`, error.message);
    }
  } catch (err) {
    console.warn(`Unexpected error logging ${eventType} auth history:`, err);
  }
}

export async function logUserLoginHistory(userId: string, authProvider: string): Promise<void> {
  await logUserAuthHistory(userId, 'login', authProvider);
}

export async function signUpWithEmail(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const userCheck = await checkUserExists(normalizedEmail);
    
    if (userCheck.error) {
      return {
        success: false,
        error: 'Unable to verify user existence. Please try again.'
      };
    }
    
    if (userCheck.exists) {
      return {
        success: false,
        error: 'USER_ALREADY_EXISTS'
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Auth user created, now storing profile in custom users table');
    const userData = {
      id: data.user?.id,
      email: email.toLowerCase().trim(),
      first_name: firstName ? firstName.trim() : null,
      last_name: lastName ? lastName.trim() : null,
      role: 'adult',
      created_at: new Date(),
      updated_at: new Date()
    };

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select('*')
      .single();
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
    
    console.log('✅ User profile created in custom users table:', userProfile?.id);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.drawtopia.ai/';
      const customerName = firstName && lastName ? `${firstName} ${lastName}` : firstName || null;
      
      await fetch(`${API_BASE_URL}/api/emails/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: email.toLowerCase().trim(),
          customer_name: customerName
        })
      });
      console.log('✅ Welcome email sent during signup');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}`,
      }
    });

    if (data.user?.id) {
      await logUserAuthHistory(data.user.id, 'register', 'email_password');
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function signUpWithPhone(phone: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
  try {
    const normalizedPhone = phone.trim();
    const userCheck = await checkUserExistsByPhone(normalizedPhone);
    
    if (userCheck.error) {
      return {
        success: false,
        error: 'Unable to verify user existence. Please try again.'
      };
    }
    
    if (userCheck.exists) {
      return {
        success: false,
        error: 'USER_ALREADY_EXISTS'
      };
    }

    const { data, error } = await supabase.auth.signUp({
      phone,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Auth user created, now storing profile in custom users table');
    const userData = {
      id: data.user?.id,
      phone: phone.trim(),
      first_name: firstName ? firstName.trim() : null,
      last_name: lastName ? lastName.trim() : null,
      role: 'adult',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select('*')
      .single();
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
    
    console.log('✅ User profile created in custom users table:', userProfile?.id);
    
    if (userProfile?.email) {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://app.drawtopia.ai/';
        const customerName = firstName && lastName ? `${firstName} ${lastName}` : firstName || null;
        
        await fetch(`${API_BASE_URL}/api/emails/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_email: userProfile.email.toLowerCase().trim(),
            customer_name: customerName
          })
        });
        console.log('✅ Welcome email sent during phone signup');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {
      }
    });
    
    if (otpError && (otpError.message.includes('over_sms_send_rate_limit') || otpError.message.includes('rate limit'))) {
      return {
        success: false,
        error: 'Please wait 3 seconds before requesting another SMS code.'
      };
    }

    if (data.user?.id) {
      await logUserAuthHistory(data.user.id, 'register', 'phone_password');
    }
    
    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function updateUserLastLogin(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: row, error: fetchError } = await supabase
      .from('users')
      .select('last_login, upload_cnt')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user for last_login update:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const lastLogin = row?.last_login;
    const currentUploadCnt = row?.upload_cnt;
    const isPreviousDay = lastLogin == null || lastLogin === '' || lastLogin < today;
    const newUploadCnt = isPreviousDay ? 10 : (typeof currentUploadCnt === 'number' ? currentUploadCnt : 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_login: today,
        upload_cnt: newUploadCnt
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating last_login:', updateError);
      return { success: false, error: updateError.message };
    }
    return { success: true };
  } catch (error) {
    console.error('updateUserLastLogin error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function decrementUserUploadCount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: row, error: fetchError } = await supabase
      .from('users')
      .select('upload_cnt')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching upload_cnt:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const current = typeof row?.upload_cnt === 'number' ? row.upload_cnt : 0;
    const next = Math.max(0, current - 1);

    const { error: updateError } = await supabase
      .from('users')
      .update({ upload_cnt: next })
      .eq('id', userId);

    if (updateError) {
      console.error('Error decrementing upload_cnt:', updateError);
      return { success: false, error: updateError.message };
    }
    return { success: true };
  } catch (error) {
    console.error('decrementUserUploadCount error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function signInWithEmail(email: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}`,
      }
    });

    if (error) {
      if (isAuthAbortError(error)) {
        return {
          success: false,
          error: 'Sign-in was interrupted. Please try again.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined
    };
  } catch (error) {
    if (isAuthAbortError(error)) {
      return {
        success: false,
        error: 'Sign-in was interrupted. Please try again.'
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function signInWithPhone(phone: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password
    });

    if (error) {
      if (isAuthAbortError(error)) {
        return {
          success: false,
          error: 'Sign-in was interrupted. Please try again.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    if (data.user?.id) {
      await updateUserLastLogin(data.user.id);
      await logUserAuthHistory(data.user.id, 'login', 'phone_password');
    }

    return {
      success: true,
      user: data.user || undefined,
      session: data.session || undefined
    };
  } catch (error) {
    if (isAuthAbortError(error)) {
      return {
        success: false,
        error: 'Sign-in was interrupted. Please try again.'
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const dispatchSignOutUi = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drawtopia-signout'));
    }
  };

  const clearLocalAuthState = () => {
    if (typeof window === 'undefined') return;
    clearPhoneSession();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SESSION_STARTED_AT_KEY);
    sessionStorage.removeItem('pendingGoogleSignup');
  };

  const finishIfSessionCleared = async (): Promise<{ success: boolean; error?: string } | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      clearLocalAuthState();
      dispatchSignOutUi();
      return { success: true };
    }
    return null;
  };

  try {
    console.log('Signing out user...');
    clearPhoneSession();

    const { error } = await supabase.auth.signOut();

    if (error) {
      if (isAuthAbortError(error)) {
        const resolved = await finishIfSessionCleared();
        if (resolved) {
          console.log('User signed out (session cleared after abort)');
          return resolved;
        }
      }
      console.warn('Remote sign out failed; clearing local session anyway:', error);
      clearLocalAuthState();
      dispatchSignOutUi();
      return { success: true };
    }

    clearLocalAuthState();
    dispatchSignOutUi();
    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    if (isAuthAbortError(error)) {
      const resolved = await finishIfSessionCleared();
      if (resolved) {
        console.log('User signed out (session cleared after abort)');
        return resolved;
      }
    }
    console.warn('Unexpected sign out error; clearing local session anyway:', error);
    clearLocalAuthState();
    dispatchSignOutUi();
    return { success: true };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    return null;
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    console.log("signInWithGoogle", data);
    if (error) {
      if (isAuthAbortError(error)) {
        return {
          success: false,
          error: 'Sign-in was interrupted. Please try again.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: undefined,
      session: undefined
    };
  } catch (error) {
    if (isAuthAbortError(error)) {
      return {
        success: false,
        error: 'Sign-in was interrupted. Please try again.'
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function registerGoogleOAuthUser(user: User): Promise<{ success: boolean; error?: string }> {
  try {

    const { data: existingUser, error: checkError } = await supabaseAdmin.from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return {
        success: false,
        error: 'Failed to check existing user'
      };
    }

    const googleId = user.user_metadata?.provider_id || user.id;
    const firstName = user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || '';
    const lastName = user.user_metadata?.family_name || user.user_metadata?.full_name?.split(' ')[1] || '';
    const email = user.email || '';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    console.log('Google OAuth user data:', {
      id: user.id,
      googleId,
      firstName,
      lastName,
      email,
      user_metadata: user.user_metadata
    });


    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: email.toLowerCase().trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url: avatarUrl,
          google_id: googleId,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return {
          success: false,
          error: updateError.message
        };
      }

      console.log('Google OAuth user updated successfully');
      return { success: true };
    }

    const userData = {
      id: user.id,
      google_id: googleId,
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      avatar_url: avatarUrl,
      role: 'adult',
      created_at: new Date(),
      updated_at: new Date()
    };

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select('*')
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return {
        success: false,
        error: profileError.message
      };
    }

    console.log('Google OAuth user registered successfully:', userProfile);
    await logUserAuthHistory(user.id, 'register', 'google_oauth');
    return { success: true };
  } catch (error) {
    console.error('Error registering Google OAuth user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function checkUserExists(email: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    console.log("normalizedEmail", email);
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data: emailUser, error: emailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (emailUser && !emailError) {
      return {
        exists: true,
        user: emailUser
      };
    }

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return {
        exists: false,
        error: authError.message
      };
    }

    const authUser = authUsers.users.find(user => user.email?.toLowerCase() === normalizedEmail);
    
    if (authUser) {
      return {
        exists: true,
        user: authUser
      };
    }

    return {
      exists: false
    };

  } catch (error) {
    console.error('Error checking user existence:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function checkUserExistsByPhone(phone: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    const { data: phoneUser, error: phoneError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (phoneUser && !phoneError) {
      return {
        exists: true,
        user: phoneUser
      };
    }

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return {
        exists: false,
        error: authError.message
      };
    }

    const authUser = authUsers.users.find(user => user.phone === phone);
    
    if (authUser) {
      return {
        exists: true,
        user: authUser
      };
    }

    return {
      exists: false
    };

  } catch (error) {
    console.error('Error checking user existence by phone:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function getUserProfile(userId: string): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    console.log("profile, error", profile, error);
    if (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      profile
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
export async function verifyEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: token,
      type: 'email',
    });
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function resendEmailOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}`,
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function resendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {}
    });

    if (error) {
      if (error.message.includes('over_sms_send_rate_limit') || error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'Please wait 3 seconds before requesting another SMS code.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

export async function verifyPhone(phone: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: token,
      type: 'sms',
    });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}


function getAuthApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return base.replace(/\/$/, '');
}

export async function requestPhoneOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${getAuthApiBase()}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.detail || data.message || `Request failed (${res.status})`,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function verifyPhoneOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; user?: User; session?: PhoneSession; error?: string }> {
  try {
    const res = await fetch(`${getAuthApiBase()}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.detail || data.message || `Verification failed (${res.status})`,
      };
    }
    const accessToken = data.access_token;
    const apiUser = data.user as PhoneAuthUser | undefined;
    if (!accessToken || !apiUser?.id) {
      return { success: false, error: 'Invalid response from server' };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(PHONE_TOKEN_STORAGE_KEY, accessToken);
    }
    const user: User & { first_name?: string | null; last_name?: string | null } = {
      id: apiUser.id,
      email: apiUser.email ?? undefined,
      phone: apiUser.phone ?? undefined,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      first_name: apiUser.first_name ?? null,
      last_name: apiUser.last_name ?? null,
    } as User & { first_name?: string | null; last_name?: string | null };
    const session: PhoneSession = { access_token: accessToken };
    return { success: true, user, session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export async function fetchPhoneSessionUser(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined') return { success: false };
    const token = localStorage.getItem(PHONE_TOKEN_STORAGE_KEY);
    if (!token) return { success: false };
    const res = await fetch(`${getAuthApiBase()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) clearPhoneSession();
      return {
        success: false,
        error: data.detail || data.message || 'Unauthorized',
      };
    }
    const apiUser = data.user as PhoneAuthUser | undefined;
    if (!apiUser?.id) return { success: false };
    const user: User & { first_name?: string | null; last_name?: string | null } = {
      id: apiUser.id,
      email: apiUser.email ?? undefined,
      phone: apiUser.phone ?? undefined,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      first_name: apiUser.first_name ?? null,
      last_name: apiUser.last_name ?? null,
    } as User & { first_name?: string | null; last_name?: string | null };
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export function clearPhoneSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PHONE_TOKEN_STORAGE_KEY);
}

export function formatGoogleUserData(user: any): any {
  const googleId = user.user_metadata?.provider_id || user.id;
  const firstName = user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || '';
  const lastName = user.user_metadata?.family_name || user.user_metadata?.full_name?.split(' ')[1] || '';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  return {
    id: user.id,
    google_id: googleId,
    email: email.toLowerCase().trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    avatar_url: avatarUrl,
    role: 'adult',
    created_at: new Date(),
    updated_at: new Date()
  };
}

export async function registerUser(userData: any): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    console.log('Attempting to register user:', userData);
    
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return {
        success: false,
        error: 'Failed to check existing user'
      };
    }

    
    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          avatar_url: userData.avatar_url ?? null,
          role: userData.role,
          google_id: userData.google_id,
          updated_at: new Date()
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return {
          success: false,
          error: updateError.message
        };
      }

      console.log('User updated successfully');
      return { 
        success: true, 
        profile: { ...existingUser, ...userData }
      };
    }

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select('*')
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return {
        success: false,
        error: profileError.message
      };
    }

    console.log('User registered successfully:', userProfile);
    if (userData.id) {
      await logUserAuthHistory(userData.id, 'register', 'google_oauth');
    }
    return {
      success: true,
      profile: userProfile
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}