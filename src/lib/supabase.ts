/**
 * Supabase client configuration
 * This module provides the Supabase client for authentication and database operations
 */

import { createClient } from '@supabase/supabase-js';

export const AUTH_STORAGE_KEY = 'sb-auth-token';

/** Custom storage so first_name/last_name from custom users table persist in the same key as the session */
function createAuthStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  const base = window.localStorage;
  return {
    getItem: (key: string) => base.getItem(key),
    setItem: (key: string, value: string) => {
      if (key === AUTH_STORAGE_KEY) {
        try {
          const current = base.getItem(key);
          const next = value ? JSON.parse(value) as Record<string, unknown> : null;
          if (current && next && typeof next === 'object') {
            const prev = JSON.parse(current) as Record<string, unknown>;
            if (prev.first_name !== undefined) next.first_name = prev.first_name;
            if (prev.last_name !== undefined) next.last_name = prev.last_name;
            value = JSON.stringify(next);
          }
        } catch (_) {}
      }
      base.setItem(key, value);
    },
    removeItem: (key: string) => base.removeItem(key),
    get length() { return base.length; },
    key: (i: number) => base.key(i),
    clear: () => base.clear()
  };
}

// Create Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: createAuthStorage(),
      storageKey: AUTH_STORAGE_KEY
    }
  }
);
export const supabaseAdmin = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
// Database types (you can expand these based on your schema)
export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  google_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

// Export commonly used types from Supabase
export type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
