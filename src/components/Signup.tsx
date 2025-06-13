import React, { useState, useEffect } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import type { AuthError, User } from '@supabase/supabase-js';

/**
 * Props for the Signup component.
 */
export interface SignupProps {
  /**
   * Callback function to be called on successful signup.
   * The user object may be null if email confirmation is required.
   */
  onSignupSuccess?: (user: User | null) => void;
  /** Callback function to be called on signup error. */
  onSignupError?: (error: AuthError) => void;
  /** Optional classnames for nested elements */
  classNames?: {
    formClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    errorClassName?: string;
  };
}

/**
 * A component that renders a signup form.
 * Handles new user registration via email and password.
 */
const Signup: React.FC<SignupProps> = ({
  onSignupSuccess,
  onSignupError,
  classNames,
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
    <form onSubmit={handleSubmit} className={classNames?.formClassName ?? ''}>
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={classNames?.inputClassName ?? 'p-2 border rounded mb-4'}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={classNames?.inputClassName ?? 'p-2 border rounded mb-4'}
      />
      <button
        type="submit"
        disabled={loading}
        className={classNames?.buttonClassName ?? 'btn btn-primary w-full'}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      {error && (
        <div className={classNames?.errorClassName ?? ''}>{error.message}</div>
      )}
    </form>
  );
};

export default Signup;
