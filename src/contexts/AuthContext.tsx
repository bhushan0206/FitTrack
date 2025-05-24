import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/lib/auth';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  signInWithFacebook: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, check for OAuth callback in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('🔗 OAuth callback detected, setting session...');
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('Error setting session from OAuth callback:', error);
            } else {
              console.log('✅ Session set from OAuth callback:', data.user?.email);
              if (mounted) {
                setSession(data.session);
                setUser(data.user ? transformUser(data.user) : null);
                localStorage.setItem('supabase-auth-token', 'authenticated');
              }
              // Clear the hash from URL
              window.history.replaceState({}, document.title, window.location.pathname);
              if (mounted) {
                setLoading(false);
              }
              return;
            }
          } catch (err) {
            console.error('Failed to process OAuth callback:', err);
          }
        }

        // If no OAuth callback, check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Auth context - initial session check:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            userId: session?.user?.id
          });
          
          if (mounted) {
            setSession(session);
            setUser(session?.user ? transformUser(session.user) : null);
            
            if (session) {
              localStorage.setItem('supabase-auth-token', 'authenticated');
            } else {
              localStorage.removeItem('supabase-auth-token');
            }
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth context - state changed:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ? transformUser(session.user) : null);
          setLoading(false);
        }

        // Handle cross-tab sync
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User successfully signed in:', session.user.email);
          localStorage.setItem('supabase-auth-token', 'authenticated');
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          localStorage.removeItem('supabase-auth-token');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed for:', session.user.email);
          localStorage.setItem('supabase-auth-token', 'authenticated');
        }
      }
    );

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase-auth-token' && mounted) {
        if (e.newValue && !session) {
          console.log('📡 Cross-tab sign-in detected');
          setTimeout(() => {
            if (mounted) initializeAuth();
          }, 100);
        } else if (!e.newValue && session) {
          console.log('📡 Cross-tab sign-out detected');
          setSession(null);
          setUser(null);
        }
      }
    };

    // Check for existing session when window gains focus
    const handleFocus = () => {
      if (mounted && !session && !document.hidden) {
        const hasStoredToken = localStorage.getItem('supabase-auth-token');
        if (hasStoredToken) {
          console.log('🎯 Window focused with stored token, checking session...');
          initializeAuth();
        }
      }
    };

    // Check for existing session when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted && !session) {
        const hasStoredToken = localStorage.getItem('supabase-auth-token');
        if (hasStoredToken) {
          console.log('👁️ Page became visible with stored token, checking session...');
          initializeAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove session dependency to prevent loops

  const transformUser = (user: User): AuthUser => ({
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url,
  });

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      // First, try to check if user already exists by attempting to sign in
      const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingUser.user && existingUser.session) {
        // User exists and credentials are correct, they're already signed in
        throw new Error('An account with this email already exists and you have been signed in.');
      }

      if (existingUser.user && !existingUser.session) {
        // User exists but hasn't verified email
        throw new Error('An account with this email already exists. Please check your email for verification or try signing in.');
      }

      // If we get here, either the user doesn't exist or the password is wrong
      // If password is wrong, we'll get an "Invalid login credentials" error
      if (signInError && !signInError.message.includes('Invalid login credentials')) {
        // Some other error occurred
        throw signInError;
      }

      // Now attempt to create the account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          }
        }
      });

      if (error) {
        // Handle specific Supabase signup errors
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (error.message.includes('Password should be at least 6 characters')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Always use the current window location origin
      const redirectUrl = window.location.origin;
      console.log('AuthContext - Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      // Always use the current window location origin
      const redirectUrl = window.location.origin;
      console.log('AuthContext - Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email'
        }
      });

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
