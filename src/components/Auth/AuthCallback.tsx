import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          navigate('/sign-in');
          return;
        }

        if (data.session) {
          // Remove sensitive session data from logs
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth callback successful, redirecting to dashboard');
          }
        } else {
          console.log('No session found, redirecting to sign-in');
          navigate('/sign-in');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/sign-in');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
