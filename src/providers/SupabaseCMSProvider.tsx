import React, { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database/supabase';
import { SiteContext } from './SiteContext';

export interface SupabaseCMSProviderProps {
  siteId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  children: React.ReactNode;
}

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
