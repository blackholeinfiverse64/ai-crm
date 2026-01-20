import { supabase } from '@/lib/supabase'

export const authService = {
  // Sign up with email and password
  async signUp({ email, password, firstName, lastName, companyName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          full_name: `${firstName} ${lastName}`
        }
      }
    })

    if (error) throw error

    // Create profile if signup successful
    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName
      })
    }

    return data
  },

  // Sign in with email and password
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Send password reset email
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return data
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return data
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Create user profile
  async createUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      // Don't throw error as profile table might not exist yet
      return null
    }
    return data
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      throw error
    }
    return data
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    if (error) throw error
    return data
  }
}

export default authService
