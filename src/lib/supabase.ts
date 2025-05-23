import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single instance with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Prevent multiple instances by using a unique storage key
    storageKey: 'fittrack-auth',
    // Auto refresh tokens
    autoRefreshToken: false, // Disable since we're using Clerk
    // Persist session in localStorage
    persistSession: false,   // Disable since we're using Clerk
    // Detect session in other tabs
    detectSessionInUrl: false, // Disable since we're using Clerk
  },
  // Prevent duplicate client warnings
  global: {
    headers: {
      'x-client-info': 'fittrack-app'
    }
  }
})

// Simplified auth sync - just log the user ID for now
export const setupAuthSync = (clerkUserId: string | null) => {
  if (clerkUserId) {
    console.log('Clerk user authenticated:', clerkUserId);
    // In the future, you can implement custom JWT integration here
  } else {
    console.log('User signed out');
  }
};

// Export a single default instance
export default supabase
