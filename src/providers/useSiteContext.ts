import { useContext } from 'react';
import { SiteContext } from './SiteContext';

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
