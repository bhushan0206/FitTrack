import AuthForm from '@/components/Auth/AuthForm';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthForm initialTab="register" onAuthSuccess={() => navigate('/')} />
    </div>
  );
}
