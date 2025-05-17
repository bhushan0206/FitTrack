import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/Auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;
