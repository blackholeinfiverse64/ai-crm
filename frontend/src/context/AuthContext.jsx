import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isMockSupabase } from '@/lib/supabase';
import { authService } from '@/services/auth/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Check if supabase is properly configured
        if (supabase && supabase.auth && typeof supabase.auth.getSession === 'function') {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          // Get user profile if session exists
          if (initialSession?.user) {
            try {
              const userProfile = await authService.getUserProfile(initialSession.user.id);
              setProfile(userProfile);
            } catch (profileError) {
              console.warn('Could not load user profile:', profileError);
            }
          }
        } else {
          // Supabase not configured, skip auth
          console.warn('Supabase not configured, skipping authentication');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Don't block the app if auth fails
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (only if supabase is configured)
    let subscription = null;
    if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === 'function') {
      try {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            // Get profile when user signs in
            if (event === 'SIGNED_IN' && currentSession?.user) {
              try {
                const userProfile = await authService.getUserProfile(currentSession.user.id);
                setProfile(userProfile);
              } catch (profileError) {
                console.warn('Could not load user profile:', profileError);
              }
            }

            // Clear profile when user signs out
            if (event === 'SIGNED_OUT') {
              setProfile(null);
            }

            setLoading(false);
          }
        );
        subscription = authSubscription;
      } catch (error) {
        console.warn('Could not set up auth state listener:', error);
      }
    }

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn({
        email,
        password
      });
      
      // Handle both mock and real Supabase responses
      const signedInUser = result?.user || result?.data?.user;
      const newSession = result?.session || result?.data?.session;
      
      // Set user and session
      if (signedInUser) {
        setUser(signedInUser);
        setSession(newSession);
        
        // Get user profile
        try {
          const userProfile = await authService.getUserProfile(signedInUser.id);
          setProfile(userProfile);
        } catch (profileError) {
          console.warn('Could not load user profile:', profileError);
        }
      }
      
      return { user: signedInUser, session: newSession };
    } catch (error) {
      // In dev mode, if it's a "not configured" error, still allow login
      if (isMockSupabase() && error.message?.includes('not configured')) {
        // Create a mock user for dev mode
        const mockUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: { full_name: 'Dev User' }
        };
        setUser(mockUser);
        setSession({ access_token: 'dev-token', user: mockUser });
        return { user: mockUser, session: { access_token: 'dev-token', user: mockUser } };
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ email, password, firstName, lastName, companyName }) => {
    setLoading(true);
    try {
      const data = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
        companyName
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider) => {
    setLoading(true);
    try {
      const data = await authService.signInWithOAuth(provider);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const updatedProfile = await authService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithOAuth,
    logout,
    resetPassword,
    updatePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
