import { useState, useEffect, type FC } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import type { AuthError, User } from '@supabase/supabase-js';
import EditorButton from './EditorButton';

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
const Signup: FC<SignupProps> = ({
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
    <form
      onSubmit={handleSubmit}
      className={
        classNames?.formClassName ??
        'bmscms:flex bmscms:flex-col bmscms:gap-4 bmscms:w-full bmscms:max-w-sm bmscms:mx-auto bmscms:p-6  bmscms:rounded bmscms:shadow'
      }
    >
      <h2 className="bmscms:text-2xl bmscms:font-bold bmscms:mb-4 bmscms:text-center">
        Sign Up
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={
          classNames?.inputClassName ??
          'bmscms:p-2 bmscms:border bmscms:rounded bmscms:mb-2'
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={
          classNames?.inputClassName ??
          'bmscms:p-2 bmscms:border bmscms:rounded bmscms:mb-4'
        }
      />
      <EditorButton
        type="submit"
        disabled={loading}
        className={
          classNames?.buttonClassName ??
          'bmscms:bg-blue-600 bmscms:text-white bmscms:rounded bmscms:py-2 bmscms:font-semibold bmscms:shadow bmscms:transition bmscms:disabled:opacity-50'
        }
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </EditorButton>
      {error && (
        <div
          className={
            classNames?.errorClassName ?? 'bmscms:text-red-600 bmscms:mt-2'
          }
        >
          {error.message}
        </div>
      )}
    </form>
  );
};

export default Signup;
