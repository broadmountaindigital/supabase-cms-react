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
    <div className="container">
      <header>
        <h1>Sign Up</h1>
      </header>
      <main>
        <Signup />
      </main>
    </div>
  );
}
