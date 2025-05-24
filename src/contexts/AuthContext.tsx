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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
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
                localStorage.setItem('supabase-auth-token', JSON.stringify(data.session));
                setIsInitialized(true);
                setLoading(false);
              }
              // Clear the hash from URL
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          } catch (err) {
            console.error('Failed to process OAuth callback:', err);
          }
        }

        // If no OAuth callback, check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          localStorage.removeItem('supabase-auth-token');
        } else {
          console.log('Auth context - initial session check:', {
            hasSession: !!initialSession,
            userEmail: initialSession?.user?.email,
            userId: initialSession?.user?.id
          });
          
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user ? transformUser(initialSession.user) : null);
            
            if (initialSession) {
              localStorage.setItem('supabase-auth-token', JSON.stringify(initialSession));
              await ensureUserProfile(initialSession.user);
            } else {
              localStorage.removeItem('supabase-auth-token');
            }
            
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          localStorage.removeItem('supabase-auth-token');
          setSession(null);
          setUser(null);
          setIsInitialized(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ? transformUser(session.user) : null);
        setLoading(false);
        setIsInitialized(true);

        if (session) {
          localStorage.setItem('supabase-auth-token', JSON.stringify(session));
        } else {
          localStorage.removeItem('supabase-auth-token');
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    });

    // Initialize auth
    initializeAuth();

    // Reduce frequency of session checks to prevent loops
    sessionCheckInterval = setInterval(async () => {
      if (!mounted || !isInitialized || loading) return;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        // Only update if session actually changed
        if (currentSession?.access_token !== session?.access_token) {
          console.log('🔄 Session changed during periodic check');
          setSession(currentSession);
          setUser(currentSession?.user ? transformUser(currentSession.user) : null);
          
          if (currentSession) {
            localStorage.setItem('supabase-auth-token', JSON.stringify(currentSession));
          } else {
            localStorage.removeItem('supabase-auth-token');
          }
        }
      } catch (error) {
        console.error('Error during periodic session check:', error);
      }
    }, 60000); // Check every 60 seconds instead of 10

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []); // Remove all dependencies to prevent loops

  // Helper function to ensure user profile exists
  const ensureUserProfile = async (user: any) => {
    try {
      console.log('Checking profile for user:', user.id);
      
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating profile for user:', user.id);
        
        const profileData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.user_metadata?.display_name ||
                user.email?.split('@')[0] || 
                'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: createError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          console.log('Profile created successfully for user:', user.id);
        }
      } else if (fetchError) {
        console.error('Error fetching profile:', fetchError);
      } else {
        console.log('Profile already exists for user:', user.id);
        
        // Update profile name if it's from social auth and we have better metadata
        const newName = user.user_metadata?.name || 
                       user.user_metadata?.full_name || 
                       user.user_metadata?.display_name;
        
        if (newName && newName !== existingProfile.name && 
            (existingProfile.name === 'User' || !existingProfile.name)) {
          await supabase
            .from('profiles')
            .update({ 
              name: newName,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          console.log('Updated profile name for user:', user.id, 'to:', newName);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

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
    loading: loading || !isInitialized,
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

export default AuthProvider;
