import { createContext } from 'react';
import type { AuthError, User } from '@supabase/supabase-js';

export interface CmsState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  isInEditMode: boolean;
  toggleEditMode: () => void;
  // We can add signIn, signOut, etc. here later if needed
}

// Create a context with a default value.
// The actual value will be provided by the SupabaseCMSProvider.
export const CmsContext = createContext<CmsState | undefined>(undefined);
