import React, { createContext, useContext, useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database/supabase';
import editingToolsReducer from '@/store/slices/editingToolsSlice';
import userReducer from '@/store/slices/userSlice';

interface SupabaseCMSProviderProps {
  siteId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  children: React.ReactNode;
}

interface SiteContextType {
  siteId: string;
  supabase: ReturnType<typeof createClient<Database>>;
}

const SiteContext = createContext<SiteContextType | null>(null);

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

// Hook to access site context
export function useSiteContext() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteContext must be used within a SupabaseCMSProvider');
  }
  return context;
}

// Hook to access site ID
export function useSiteId() {
  const { siteId } = useSiteContext();
  return siteId;
}

// Hook to access Supabase client
export function useSupabase() {
  const { supabase } = useSiteContext();
  return supabase;
}
