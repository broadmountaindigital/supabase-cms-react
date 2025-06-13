import React, { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database/supabase';
import { SiteContext } from './SiteContext';

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
 * It creates the Supabase client and provides it, along with the siteId, to all child components.
 * Wrap your application with this provider to enable CMS functionality.
 *
 * @example
 * ```tsx
 * import { SupabaseCMSProvider } from '@supabase-cms/react';
 *
 * function App() {
 *   return (
 *     <SupabaseCMSProvider
 *       siteId="YOUR_SITE_ID"
 *       supabaseUrl="YOUR_SUPABASE_URL"
 *       supabaseAnonKey="YOUR_SUPABASE_ANON_KEY"
 *     >
 *       <YourApp />
 *     </SupabaseCMSProvider>
 *   );
 * }
 * ```
 */
export function SupabaseCMSProvider({
  siteId,
  supabaseUrl,
  supabaseAnonKey,
  children,
}: SupabaseCMSProviderProps) {
  // Create site-specific Supabase client
  const supabase = useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  // Create site context value
  const siteContextValue = useMemo(() => {
    return {
      siteId,
      supabase,
    };
  }, [siteId, supabase]);

  return (
    <SiteContext.Provider value={siteContextValue}>
      {children}
    </SiteContext.Provider>
  );
}
