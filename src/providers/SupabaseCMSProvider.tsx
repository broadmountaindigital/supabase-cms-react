import React, { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database/supabase';
import editingToolsReducer from '@/store/slices/editingToolsSlice';
import userReducer from '@/store/slices/userSlice';
import { SiteContext } from './SiteContext';

interface SupabaseCMSProviderProps {
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

  // Create site-specific Redux store
  const store = useMemo(() => {
    return configureStore({
      reducer: {
        editingTools: editingToolsReducer,
        user: userReducer,
      },
      preloadedState: {
        // You can add site-specific initial state here if needed
      },
    });
  }, []);

  // Create site context value
  const siteContextValue = useMemo(() => {
    return {
      siteId,
      supabase,
    };
  }, [siteId, supabase]);

  return (
    <SiteContext.Provider value={siteContextValue}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </SiteContext.Provider>
  );
}
