import { Signup, useSupabaseCMS } from '@broadmountain/supabase-cms-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignupPage() {
  const { user } = useSupabaseCMS();
  const navigate = useNavigate();

  // If the user is already logged in, redirect them to the home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <Signup />
    </div>
  );
}
