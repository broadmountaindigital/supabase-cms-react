import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import type { AuthError, User } from '@supabase/supabase-js';
import EditorButton from './EditorButton';

/**
 * Props for the Login component.
 */
export interface LoginProps {
  /** Callback function to be called on successful login. */
  onLoginSuccess?: (user: User) => void;
  /** Callback function to be called on login error. */
  onLoginError?: (error: AuthError) => void;
  /** Optional classnames for nested elements */
  classNames?: {
    formClassName?: string;
    h2ClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    errorClassName?: string;
  };
}

/**
 * A component that renders a login form.
 * Handles user authentication via email and password.
 */
const Login: FC<LoginProps> = ({
  onLoginSuccess,
  onLoginError,
  classNames,
}) => {
  const { signIn, user, loading, error } = useSupabaseCMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && onLoginSuccess) {
      onLoginSuccess(user);
    }
  }, [user, onLoginSuccess]);

  async function handleSubmit(e: FormEvent) {
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
        classNames?.formClassName ??
        'bmscms:flex bmscms:flex-col bmscms:gap-4 bmscms:w-full bmscms:max-w-sm bmscms:mx-auto bmscms:p-6  bmscms:rounded bmscms:shadow'
      }
    >
      <h2
        className={
          classNames?.h2ClassName ??
          'bmscms:text-2xl bmscms:font-bold bmscms:mb-4'
        }
      >
        Login
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
        className={classNames?.buttonClassName}
      >
        {loading ? 'Logging in...' : 'Login'}
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

export default Login;
