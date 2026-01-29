import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl.startsWith('https://') && 
         supabaseUrl.includes('.supabase.co') &&
         supabaseAnonKey.length > 20 // Valid keys are much longer
}

// Only create client if we have real credentials, otherwise create a mock client
let supabase;
let isMockClient = false;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  }
})
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    isMockClient = true
  }
} else {
  // Create a mock client for development
  console.warn('Supabase not configured. Using mock client for development.')
  isMockClient = true
}

if (isMockClient) {
  // Create a comprehensive mock client for development
  supabase = {
    _isMock: true,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ 
        data: null, 
        error: { 
          message: 'Supabase not configured. Running in development mode.',
          name: 'AuthApiError'
        } 
      }),
      signUp: async () => ({ 
        data: null, 
        error: { 
          message: 'Supabase not configured. Running in development mode.',
          name: 'AuthApiError'
        } 
      }),
      signInWithOAuth: async () => ({ 
        data: null, 
        error: { 
          message: 'Supabase not configured. Running in development mode.',
          name: 'AuthApiError'
        } 
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: null, error: null }),
      resend: async () => ({ error: null })
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        })
      }),
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    })
  }
}

// Export helper to check if using mock client
export const isMockSupabase = () => isMockClient || supabase._isMock

export { supabase }

// Auth helper functions
export const authHelpers = {
  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
}
