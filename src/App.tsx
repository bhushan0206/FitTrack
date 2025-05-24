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
      
      // Only redirect if user is on root path or auth pages when authenticated
      if (user && (currentPath === '/' || currentPath === '/auth/signin' || currentPath === '/auth/signup' || currentPath === '/sign-in')) {
        console.log('User authenticated, redirecting from auth pages to dashboard');
        navigate('/dashboard', { replace: true });
      }
      // Only redirect to auth if user is not authenticated AND on a protected route
      else if (!user && currentPath === '/dashboard') {
        console.log('User not authenticated, redirecting from dashboard to auth');
        navigate('/auth/signin', { replace: true });
      }
      // Handle root path redirect
      else if (!user && currentPath === '/') {
        console.log('User not authenticated on root, redirecting to auth');
        navigate('/auth/signin', { replace: true });
      }
    }
  }, [user, loading, navigate]); // Remove location.pathname from dependencies

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
        <Route 
          path="/dashboard" 
          element={user ? <StatisticsPanel /> : <Navigate to="/auth/signin" replace />} 
        />
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
