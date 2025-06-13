import React, { useState, useEffect } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import type { AuthError, User } from '@supabase/supabase-js';

export interface LoginProps {
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (error: AuthError) => void;
  className?: string;
}

const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onLoginError,
  className,
}) => {
  const { signIn, user, loading, error } = useSupabaseCMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && onLoginSuccess) {
      onLoginSuccess(user);
    }
  }, [user, onLoginSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error: signInError } = await signIn({ email, password });
    if (signInError && onLoginError) {
      onLoginError(signInError);
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
      <h2 className="text-2xl font-bold mb-4">Login</h2>
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="text-red-500">{error.message}</div>}
    </form>
  );
};

export default Login;
