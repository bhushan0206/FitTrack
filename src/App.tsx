import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import AuthPage from "./components/Auth/AuthPage";
import DataDeletionPage from "./pages/DataDeletionPage";
import NotificationToast from './components/Notifications/NotificationToast';

// Simple component for handling redirects
const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const currentPath = location.pathname;
      
      // If user is authenticated and on auth page, go to dashboard
      if (user && (currentPath === '/auth/signin' || currentPath === '/auth/signup' || currentPath === '/sign-in' || currentPath === '/')) {
        console.log('User authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
      // If user is not authenticated and trying to access dashboard, go to auth
      else if (!user && (currentPath === '/dashboard' || currentPath === '/')) {
        console.log('User not authenticated, redirecting to auth');
        navigate('/auth/signin', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Show loading while checking auth
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
        {/* Support both old and new auth routes */}
        <Route path="/sign-in" element={<AuthPage />} />
        <Route path="/auth/signin" element={<AuthPage />} />
        <Route path="/auth/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<StatisticsPanel />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth/signin"} replace />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/signin"} replace />} />
      </Routes>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <AppContent />
            <NotificationToast />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
