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

  // --- Edit Mode Toggle ---
  function toggleEditMode() {
    setIsInEditMode((prev) => !prev);
  }

  return {
    // Context
    siteId,
    supabase,

    // Services
    services,

    // Auth State & Functions
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,

    // Edit Mode State & Toggle
    isInEditMode,
    toggleEditMode,
  };
}
