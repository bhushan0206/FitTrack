import { useAuth, RedirectToSignIn } from "@clerk/clerk-react";
import { useAuthSync } from "@/lib/auth";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, userId } = useAuth();
  const clerkUser = useAuthSync(); // This will trigger the sync

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <RedirectToSignIn />;
  }

  return <>{children}</>;
};

export default AuthGuard;
