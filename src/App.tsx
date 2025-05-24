import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import SignInPage from "@/components/Auth/SignInPage";
import DataDeletionPage from "./pages/DataDeletionPage";

// Create a separate component for auth-dependent logic
const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    const isSignInPage = location.pathname === '/sign-in';
    const isDashboardPage = location.pathname === '/dashboard';
    const isRootPage = location.pathname === '/';
    const isDataDeletionPage = location.pathname === '/data-deletion';

    // Skip navigation for data deletion page
    if (isDataDeletionPage) return;

    // Handle OAuth callback - don't redirect while processing
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasOAuthCallback = hashParams.get('access_token');
    
    if (hasOAuthCallback) {
      console.log('OAuth callback detected, waiting for processing...');
      return;
    }

    console.log('Navigation check:', { user: !!user, isSignInPage, isDashboardPage, isRootPage });

    // If user is authenticated
    if (user) {
      if (isSignInPage || isRootPage) {
        console.log('User authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } 
    // If user is not authenticated
    else {
      if (isDashboardPage) {
        console.log('User not authenticated, redirecting to sign-in');
        navigate('/sign-in', { replace: true });
      } else if (isRootPage) {
        navigate('/sign-in', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/dashboard" element={<StatisticsPanel />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
};

function App() {
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
