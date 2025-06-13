import { createContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database/supabase';

export interface SiteContextType {
  siteId: string;
  supabase: ReturnType<typeof createClient<Database>>;
}

export const SiteContext = createContext<SiteContextType | null>(null);
