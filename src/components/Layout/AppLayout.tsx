import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, SignOutButton } from "@clerk/clerk-react";
import { ThemeToggle } from "../ThemeToggle";

const AppLayout = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background-secondary">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text">FitTrack</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isSignedIn && user ? (
              <>
                <span className="text-sm text-text-secondary">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
                <SignOutButton>
                  <Button variant="outline" size="sm">
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
