import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import AuthPage from "./components/Auth/AuthPage";
import DataDeletionPage from "./pages/DataDeletionPage";
import NotificationToast from './components/Notifications/NotificationToast';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
          <div className="text-center p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please refresh the page or try again later.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component for handling redirects and auth protection
const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const currentPath = location.pathname;
      
      // Handle OAuth callback URLs - don't redirect during OAuth flow
      if (currentPath.includes('#access_token') || currentPath.includes('access_token=') || 
          window.location.hash.includes('access_token')) {
        console.log('OAuth callback detected, staying on current page');
        return;
      }
      
      // Protected routes that require authentication
      const protectedRoutes = ['/dashboard'];
      const isProtectedRoute = protectedRoutes.includes(currentPath);
      
      // Public routes that don't require auth
      const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/sign-in', '/data-deletion'];
      const isPublicRoute = publicRoutes.includes(currentPath);
      
      if (user) {
        // User is authenticated
        if (currentPath === '/' || currentPath === '/auth/signin' || 
            currentPath === '/auth/signup' || currentPath === '/sign-in') {
          console.log('User authenticated, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else {
        // User is not authenticated
        if (isProtectedRoute) {
          console.log('User not authenticated, redirecting to sign in');
          navigate('/auth/signin', { replace: true });
        } else if (currentPath === '/') {
          console.log('User not authenticated on root, redirecting to sign in');
          navigate('/auth/signin', { replace: true });
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while checking auth
  if (loading) {
    const isOAuthCallback = window.location.hash.includes('access_token') || 
                           window.location.hash.includes('error');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isOAuthCallback ? 'Completing sign in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-screen">
        <Routes>
          {/* Auth routes */}
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/auth/signin" element={<AuthPage />} />
          <Route path="/auth/signup" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={user ? <StatisticsPanel /> : <Navigate to="/auth/signin" replace />} 
          />
          
          {/* Public routes */}
          <Route path="/data-deletion" element={<DataDeletionPage />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth/signin"} replace />} />
          
          {/* Catch-all route for 404s - improved error page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <div className="text-center p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The page you're looking for doesn't exist or may have been moved.
                </p>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate(user ? "/dashboard" : "/auth/signin", { replace: true })}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block w-full"
                  >
                    Go to {user ? "Dashboard" : "Sign In"}
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors block w-full"
                  >
                    Go Back
                  </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs text-gray-400 mt-4">
                    Current path: {location.pathname}
                  </p>
                )}
              </div>
            </div>
          } />
        </Routes>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
