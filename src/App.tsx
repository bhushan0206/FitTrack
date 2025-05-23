import { Suspense, useEffect, useState } from "react";
import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SignIn } from "@clerk/clerk-react";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import { setupAuthSync } from './lib/supabase';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Create a separate component for auth-dependent logic
const AppContent = () => {
  const { userId } = useAuth();

  // Sync Clerk auth with Supabase
  useEffect(() => {
    setupAuthSync(userId);
  }, [userId]);

  return (
    <div className="w-full h-screen">
      <Routes>
        <Route
          path="/sign-in"
          element={
            <SignedOut>
              <SignInPage />
            </SignedOut>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <StatisticsPanel />
            </SignedIn>
          }
        />
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setIsInitialized(true);
    });

    // Set initialized to true even if no auth event occurs
    const timer = setTimeout(() => setIsInitialized(true), 1000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Log when the app starts to help debug multiple instances
    console.log("FitTrack App initialized");

    // Clear any existing auth state on app start if needed
    return () => {
      console.log("FitTrack App cleanup");
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;

// Simple, clean sign-in page with minimal styling
const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-lg mb-4">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
            <rect x="2" y="10" width="8" height="12" rx="4" fill="white" />
            <rect x="22" y="10" width="8" height="12" rx="4" fill="white" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Welcome to FitTrack</h1>
        <p className="text-text-secondary text-sm">Sign in to continue to your fitness journey</p>
      </div>
      
      {/* Auth Container */}
      <div className="w-full max-w-[320px] bg-background border border-border/50 rounded-lg overflow-hidden">
        <SignIn 
          appearance={{
            elements: {
              card: "shadow-none bg-background",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-primary text-white w-full normal-case font-medium",
              formFieldLabel: "text-text-secondary",
              formFieldInput: "border-border",
              socialButtonsBlockButton: "border-border text-text",
              footerActionLink: "text-primary",
              dividerLine: "bg-border",
              dividerText: "text-text-secondary"
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton"
            }
          }}
          signUpUrl="/sign-up"
        />
      </div>
      
      {/* Features */}
      <div className="mt-8 flex gap-4 justify-center">
        {["Track Progress", "Set Goals", "Earn Rewards"].map((feature, i) => (
          <div key={i} className="text-center">
            <div className="text-sm text-text-secondary">{feature}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced header component
const Header = () => {
  return (
    <header className="w-full bg-gradient-to-r from-primary to-secondary shadow-md py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="14" width="20" height="4" rx="2" fill="#4F46E5" />
              <rect x="2" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
              <rect x="22" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">FitTrack</h1>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-6">
          <a
            href="/dashboard"
            className="text-white text-sm font-medium hover:text-gray-200 transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/profile"
            className="text-white text-sm font-medium hover:text-gray-200 transition-colors"
          >
            Profile
          </a>
          <a
            href="/settings"
            className="text-white text-sm font-medium hover:text-gray-200 transition-colors"
          >
            Settings
          </a>
        </nav>

        {/* Sign-out button */}
        <button
          className="bg-white text-primary font-medium py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-all"
          onClick={() => alert("Sign out clicked")}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
