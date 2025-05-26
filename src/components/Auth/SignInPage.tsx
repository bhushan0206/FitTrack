import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User authenticated, redirecting to dashboard from SignInPage');
      }
    }
  }, [user, navigate, loading]);

  // Handle OAuth callback
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      console.log('OAuth callback detected on SignInPage');
      setIsLoading(true);
      
      // Don't clear hash here - let AuthContext handle it
      // Just wait for auth state to update
      const timeout = setTimeout(() => {
        if (!user) {
          setIsLoading(false);
          console.log('OAuth timeout - no user found');
        }
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [user]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {loading ? "Checking authentication..." : 
             isLoading ? "Processing sign-in..." : 
             "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name);
        
        if (result.user && !result.session) {
          // User was created but needs to verify email
          toast({
            title: "Account Created!",
            description: "Please check your email and click the verification link to complete your registration.",
          });
          // Clear form
          setEmail("");
          setPassword("");
          setName("");
          setIsSignUp(false);
        } else if (result.user && result.session) {
          // User was created and signed in immediately
          toast({
            title: "Welcome to FitTrack!",
            description: "Your account has been created successfully.",
          });
          navigate("/dashboard");
        }
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome Back!",
          description: "You've been signed in successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      let errorMessage = "An error occurred";
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the verification link before signing in.";
      } else if (error.message.includes('User already registered') || 
                 error.message.includes('account with this email already exists')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
        setIsSignUp(false); // Switch to sign in form
        // Clear the form
        setPassword("");
        setName("");
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message.includes('you have been signed in')) {
        // Special case where user exists and we signed them in
        toast({
          title: "Welcome Back!",
          description: "You already had an account. You've been signed in successfully.",
        });
        navigate("/dashboard");
        return; // Exit early, don't show error
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      console.log('Google OAuth initiated:', data);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin,
          scopes: 'email',
        }
      });

      if (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
      }
      
      console.log('Facebook OAuth initiated:', data);
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Facebook",
        variant: "destructive",
      });
      setFacebookLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 relative overflow-hidden">
      {/* Enhanced Background decoration with animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 dark:from-pink-800/10 dark:to-purple-800/10 rounded-full opacity-40 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl transform hover:scale-110 transition-all duration-300 hover:rotate-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
              <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
              <rect x="2" y="10" width="8" height="12" rx="4" fill="white" />
              <rect x="22" y="10" width="8" height="12" rx="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Welcome to FitTrack
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {isSignUp ? "Create your account to start your fitness journey" : "Sign in to continue your fitness journey"}
          </p>
        </div>
        
        {/* Auth Form */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl animate-slide-up hover:shadow-3xl transition-all duration-500">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading || googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Signing in with Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Facebook Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookSignIn}
              disabled={isLoading || facebookLoading}
              className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              {facebookLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Signing in with Facebook...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </>
              )}
            </Button>

            <div className="relative animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              {isSignUp && (
                <div className="space-y-2 animate-slide-up">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={isSignUp}
                    disabled={isLoading}
                    className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 h-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                  />
                </div>
              )}
              
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: isSignUp ? '0.2s' : '0s' }}>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 h-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: isSignUp ? '0.4s' : '0.2s' }}>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 h-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-slide-up"
                style={{ animationDelay: isSignUp ? '0.6s' : '0.4s' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center animate-fade-in" style={{ animationDelay: '1.6s' }}>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-300 hover:underline transform hover:scale-105"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '1.8s' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-bounce-in" style={{ animationDelay: `${2 + i * 0.2}s` }}>
              <div className="text-2xl mb-2 animate-pulse">{"📊"}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{"Track Progress"}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{"Monitor your daily goals"}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes bounce-in {
          from { 
            opacity: 0; 
            transform: scale(0.3); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-down {
          animation: slide-down 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default SignInPage;
