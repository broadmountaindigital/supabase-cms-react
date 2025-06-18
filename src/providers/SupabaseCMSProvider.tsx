import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User, AuthError } from '@supabase/supabase-js';
import type { Database } from '../types/database/supabase';
import { SiteContext } from './SiteContext';
import { CmsContext } from './CmsContext';

/**
 * Props for the SupabaseCMSProvider.
 */
export interface SupabaseCMSProviderProps {
  /** The unique identifier for the site you want to manage. */
  siteId: string;
  /** Your Supabase project URL. */
  supabaseUrl: string;
  /** Your Supabase project's anonymous public key. */
  supabaseAnonKey: string;
  /** The child components to render. */
  children: React.ReactNode;
}

/**
 * The main provider for the Supabase CMS.
 * It creates the Supabase client and provides it, along with the siteId and shared CMS state, to all child components.
 * Wrap your application with this provider to enable CMS functionality.
 */
export function SupabaseCMSProvider({
  siteId,
  supabaseUrl,
  supabaseAnonKey,
  children,
}: SupabaseCMSProviderProps) {
  // --- Client and Site Context ---
  const supabase = useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  const siteContextValue = useMemo(() => {
    return { siteId, supabase };
  }, [siteId, supabase]);

  // --- Shared CMS State ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInEditMode, setIsInEditMode] = useState(false);

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

  // --- State Updaters ---
  function toggleEditMode() {
    setIsInEditMode((prev) => !prev);
  }

  // --- CMS Context Value ---
  const cmsContextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      isInEditMode,
      toggleEditMode,
    }),
    [user, loading, error, isInEditMode]
  );

  return (
    <SiteContext.Provider value={siteContextValue}>
      <CmsContext.Provider value={cmsContextValue}>
        {children}
      </CmsContext.Provider>
    </SiteContext.Provider>
  );
}
