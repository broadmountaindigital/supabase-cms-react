import React, { useState, useEffect } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import type { AuthError, User } from '@supabase/supabase-js';

interface SignupProps {
  onSignupSuccess?: (user: User | null) => void;
  onSignupError?: (error: AuthError) => void;
  className?: string;
}

const Signup: React.FC<SignupProps> = ({
  onSignupSuccess,
  onSignupError,
  className,
}) => {
  const { signUp, user, loading, error } = useSupabaseCMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Note: Supabase signUp might not return a user immediately
    // if email confirmation is required. The onAuthStateChange listener
    // in the hook will handle the user state update.
    if (user && onSignupSuccess) {
      onSignupSuccess(user);
    }
  }, [user, onSignupSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error: signUpError } = await signUp({ email, password });
    if (signUpError) {
      if (onSignupError) {
        onSignupError(signUpError);
      }
    } else if (onSignupSuccess) {
      // Can be null if email confirmation is required
      onSignupSuccess(data.user);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        className ??
        'max-w-md mx-auto my-8 flex flex-col gap-4 p-4 border rounded'
      }
    >
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {error && <div className="text-red-500">{error.message}</div>}
    </form>
  );
};

export default Signup;
