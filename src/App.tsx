import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import SignInPage from "@/components/Auth/SignInPage";

// Create a separate component for auth-dependent logic
const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return;

    // If user is authenticated and on sign-in page, redirect to dashboard
    if (user && (location.pathname === '/sign-in' || location.pathname === '/')) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
    
    // If user is not authenticated and trying to access protected routes
    if (!user && location.pathname === '/dashboard') {
      console.log('User not authenticated, redirecting to sign-in');
      navigate('/sign-in', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading FitTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <Routes>
        <Route
          path="/sign-in"
          element={!user ? <SignInPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={user ? <StatisticsPanel /> : <Navigate to="/sign-in" replace />}
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>

      {/* Toast notifications - using correct Toaster API */}
      <Toaster />
    </div>
  );
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Handle potential OAuth callback in URL
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
              // Clear the hash from URL
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (err) {
            console.error('Failed to process OAuth callback:', err);
          }
        }

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else if (session) {
          console.log('Found existing session for:', session.user.email);
        } else {
          console.log('No existing session found');
        }

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('App - Auth state changed:', {
          event,
          hasSession: !!session,
          userEmail: session?.user?.email
        });
        
        if (mounted) {
          setIsInitialized(true);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Initializing FitTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
