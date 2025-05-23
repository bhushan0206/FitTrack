import { Suspense, useEffect, useState } from "react";
import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/theme.css";
import StatisticsPanel from "./components/Dashboard/StatisticsPanel";
import SignInPage from "@/components/Auth/SignInPage";
import { setupAuthSync } from './lib/supabase';

// Add debugging and validation
console.log("Environment variables check:");
console.log("Raw VITE_CLERK_PUBLISHABLE_KEY:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log("Processed clerkPubKey:", clerkPubKey);
console.log("All env vars:", import.meta.env);

// Clean the key if it contains the variable name
const cleanClerkKey = clerkPubKey?.includes('=') 
  ? clerkPubKey.split('=').pop()?.trim() || clerkPubKey
  : clerkPubKey;

console.log("Cleaned clerkPubKey:", cleanClerkKey);

if (!cleanClerkKey || !cleanClerkKey.startsWith('pk_')) {
  console.error("Invalid Clerk publishable key:", cleanClerkKey);
  throw new Error(`Missing or invalid Publishable Key. Expected key starting with 'pk_' but got: ${cleanClerkKey}`);
}

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading FitTrack...</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        }>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
