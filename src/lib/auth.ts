/**
 * Authentication service
 * This module provides authentication functions using Supabase
 */

import { supabase, supabaseAdmin } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

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

/**
 * Sign up a new user with email
 */
export async function signUpWithEmail(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
  try {
    // Check if user already exists before attempting signup
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

    // Create auth user - only authentication credentials, NO user data in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password
      // Removed options.data - user information should NOT be stored in auth table
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    // Store ALL user information in custom users table
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
      // If profile creation fails, we should delete the auth user to keep data consistent
      // Note: This requires proper error handling in production
    }
    
    console.log('✅ User profile created in custom users table:', userProfile?.id);
    
    // Send welcome email immediately after user registration
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
      // Don't fail signup if welcome email fails
      console.error('Failed to send welcome email:', emailError);
    }
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}`,
      }
    });
    // console.log('OTP data:', otpData);
    // console.log('OTP error:', otpError);
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

/**
 * Sign up a new user with phone
 */
export async function signUpWithPhone(phone: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
  try {
    // Check if user already exists before attempting signup
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

    // Create auth user - only authentication credentials, NO user data in metadata
    const { data, error } = await supabase.auth.signUp({
      phone,
      password
      // Removed options.data - user information should NOT be stored in auth table
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    // Store ALL user information in custom users table
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
      // If profile creation fails, we should delete the auth user to keep data consistent
      // Note: This requires proper error handling in production
    }
    
    console.log('✅ User profile created in custom users table:', userProfile?.id);
    
    // Send welcome email if user has email in the database
    if (userProfile?.email) {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
        // Don't fail signup if welcome email fails
        console.error('Failed to send welcome email:', emailError);
      }
    }
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {
      }
    });
    
    // Handle rate limiting error specifically
    if (otpError && (otpError.message.includes('over_sms_send_rate_limit') || otpError.message.includes('rate limit'))) {
      return {
        success: false,
        error: 'Please wait 3 seconds before requesting another SMS code.'
      };
    }
    
    // console.log('OTP data:', otpData);
    // console.log('OTP error:', otpError);
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

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Sign in with phone and password
 */
export async function signInWithPhone(phone: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Sign out the current user (works for all auth providers including Google OAuth)
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Signing out user...');

    // Get current user info for logging
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Signing out user:', {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      });
    }

    // Sign out from Supabase (handles all providers including Google OAuth)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Clear user info from localStorage on sign out
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('userInfo');
        console.log('User info cleared from localStorage');
      } catch (storageError) {
        console.error('Error clearing user info from localStorage:', storageError);
      }
    }

    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    // console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    // console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Reset password via email
 */
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

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/dashboard`,
        // flow : 'popup'
      }
    });

    console.log("signInWithGoogle", data);
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // For OAuth, the authentication happens via redirect
    // The user and session will be available after redirect
    return {
      success: true,
      user: undefined,
      session: undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Register Google OAuth user to database
 */
export async function registerGoogleOAuthUser(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists in our database

    const { data: existingUser, error: checkError } = await supabaseAdmin.from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing user:', checkError);
      return {
        success: false,
        error: 'Failed to check existing user'
      };
    }

    // Extract user data from Google OAuth response
    const googleId = user.user_metadata?.provider_id || user.id;
    const firstName = user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || '';
    const lastName = user.user_metadata?.family_name || user.user_metadata?.full_name?.split(' ')[1] || '';
    const email = user.email || '';

    console.log('Google OAuth user data:', {
      id: user.id,
      googleId,
      firstName,
      lastName,
      email,
      user_metadata: user.user_metadata
    });

    // DO NOT store user information in auth.users table
    // All user profile data should be in custom users table only

    // If user already exists in our custom users table, update it
    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: email.toLowerCase().trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
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

    // Create user data object for new user
    const userData = {
      id: user.id,
      google_id: googleId,
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'adult',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert user data into database
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
    return { success: true };
  } catch (error) {
    console.error('Error registering Google OAuth user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Check if user exists by email or Gmail
 */
export async function checkUserExists(email: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    console.log("normalizedEmail", email);
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check in users table by email
    const { data: emailUser, error: emailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    // If found by email, return user
    if (emailUser && !emailError) {
      return {
        exists: true,
        user: emailUser
      };
    }

    // Also check Supabase auth users to handle cases where user might exist in auth but not in our users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return {
        exists: false,
        error: authError.message
      };
    }

    // Check if user exists in Supabase auth
    const authUser = authUsers.users.find(user => user.email?.toLowerCase() === normalizedEmail);
    
    if (authUser) {
      return {
        exists: true,
        user: authUser
      };
    }

    // User doesn't exist
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

/**
 * Check if user exists by phone number
 */
export async function checkUserExistsByPhone(phone: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    // Check in users table by phone
    const { data: phoneUser, error: phoneError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    // If found by phone, return user
    if (phoneUser && !phoneError) {
      return {
        exists: true,
        user: phoneUser
      };
    }

    // Also check Supabase auth users for phone
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return {
        exists: false,
        error: authError.message
      };
    }

    // Check if user exists in Supabase auth by phone
    const authUser = authUsers.users.find(user => user.phone === phone);
    
    if (authUser) {
      return {
        exists: true,
        user: authUser
      };
    }

    // User doesn't exist
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

/**
 * Get user profile from database
 */
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

/**
 * Listen to auth state changes
 */
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
    // console.log('Verify email data:', data);
    // console.log('Verify email error:', error);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Resend OTP for email verification
 */
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

    // console.log('Resend OTP data:', data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Resend OTP for phone verification
 */
export async function resendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: {}
    });

    if (error) {
      // Handle rate limiting error specifically
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

    // console.log('Resend Phone OTP data:', data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Verify phone OTP
 */
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
    
    // console.log('Verify phone data:', data);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Format Google OAuth user data for database insertion
 */
export function formatGoogleUserData(user: any): any {
  const googleId = user.user_metadata?.provider_id || user.id;
  const firstName = user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || '';
  const lastName = user.user_metadata?.family_name || user.user_metadata?.full_name?.split(' ')[1] || '';
  const email = user.email || '';

  return {
    id: user.id,
    google_id: googleId,
    email: email.toLowerCase().trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    role: 'adult',
    created_at: new Date(),
    updated_at: new Date()
  };
}

/**
 * Register user to database
 */
export async function registerUser(userData: any): Promise<{ success: boolean; profile?: any; error?: string }> {
  try {
    console.log('Attempting to register user:', userData);
    
    // Check if user already exists in our database
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing user:', checkError);
      return {
        success: false,
        error: 'Failed to check existing user'
      };
    }

    // DO NOT store user information in auth.users table
    // All user profile data should be in custom users table only
    
    // If user already exists in custom users table, update it
    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
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

    // Insert new user data into database
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