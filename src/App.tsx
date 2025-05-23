import { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppLayout from "./components/Layout/AppLayout";
import AuthGuard from "./components/Auth/AuthGuard";
import { Toaster } from "./components/ui/toaster";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ClerkProvider } from "@clerk/clerk-react";
import "./styles/theme.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
          <>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/sign-up" element={<RegisterPage />} />
              <Route
                path="/*"
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Home />} />
              </Route>
            </Routes>
            <Toaster />
          </>
        </Suspense>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
