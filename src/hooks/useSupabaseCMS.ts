import { useMemo, useState, useEffect } from 'react';
import { useSiteContext } from '@/providers/useSiteContext';
import { SiteAwareServiceFactory } from '@/lib/services/SiteAwareServiceFactory';
import type {
  AuthError,
  AuthResponse,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from '@supabase/supabase-js';

/**
 * The main hook for interacting with the Supabase CMS.
 * Provides access to authentication, site-specific services, and CMS state.
 *
 * @example
 * ```tsx
 * import { useSupabaseCMS } from '@supabase-cms/react';
 *
 * function MyComponent() {
 *   const { user, signIn, services, isInEditMode, toggleEditMode } = useSupabaseCMS();
 *
 *   if (!user) {
 *     return <button onClick={() => signIn({ email: 'user@example.com', password: 'password' })}>Sign In</button>
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.email}</h1>
 *       <button onClick={toggleEditMode}>{isInEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}</button>
 *       {/ * Use services.sites.get() or other service methods * /}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns An object containing the CMS state and functions.
 */
export function useSupabaseCMS() {
  const { siteId, supabase } = useSiteContext();

  // --- Local State ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInEditMode, setIsInEditMode] = useState(false); // Local state for edit mode

  // --- Service Factory ---
  const serviceFactory = useMemo(() => {
    return new SiteAwareServiceFactory(supabase, siteId);
  }, [supabase, siteId]);

  const services = useMemo(() => {
    return {
      sites: serviceFactory.createSitesService(),
      contentFields: serviceFactory.createContentFieldsService(),
      sitePages: serviceFactory.createSitePagesService(),
      profiles: serviceFactory.createProfilesService(),
    };
  }, [serviceFactory]);

  // --- Auth Listener ---
  useEffect(() => {
    async function getInitialUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }

    getInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // --- Auth Functions ---
  /**
   * Signs in a user with email and password.
   * @param credentials - The user's email and password.
   * @returns A promise that resolves with the authentication response.
   */
  async function signIn(
    credentials: SignInWithPasswordCredentials
  ): Promise<AuthResponse> {
    setLoading(true);
    setError(null);
    const response = await supabase.auth.signInWithPassword(credentials);
    if (response.error) {
      setError(response.error);
    }
    setLoading(false);
    return response;
  }

  /**
   * Signs up a new user with email and password.
   * @param credentials - The new user's email and password.
   * @returns A promise that resolves with the authentication response.
   */
  async function signUp(
    credentials: SignUpWithPasswordCredentials
  ): Promise<AuthResponse> {
    setLoading(true);
    setError(null);
    const response = await supabase.auth.signUp(credentials);
    if (response.error) {
      setError(response.error);
    }
    setLoading(false);
    return response;
  }

  /**
   * Signs out the current user.
   * @returns A promise that resolves when the user is signed out.
   */
  async function signOut(): Promise<{ error: AuthError | null }> {
    setLoading(true);
    setError(null);
    const response = await supabase.auth.signOut();
    if (response.error) {
      setError(response.error);
    }
    setLoading(false);
    return response;
  }

  /**
   * Toggles the edit mode for the CMS.
   */
  function toggleEditMode() {
    setIsInEditMode((prev) => !prev);
  }

  return {
    /** The current site's unique identifier. */
    siteId,
    /** The Supabase client instance. */
    supabase,
    /** An object containing instances of all site-aware services. */
    services,
    /** The currently authenticated user object, or null if no user is signed in. */
    user,
    /** A boolean indicating if an authentication operation is in progress. */
    loading,
    /** An authentication error object if the last operation failed, otherwise null. */
    error,
    /** The function to sign in a user. */
    signIn,
    /** The function to sign up a new user. */
    signUp,
    /** The function to sign out the current user. */
    signOut,
    /** A boolean indicating if the CMS is currently in edit mode. */
    isInEditMode,
    /** The function to toggle edit mode on or off. */
    toggleEditMode,
  };
}
