import { useContext } from 'react';
import { CmsContext } from './CmsContext';

/**
 * A hook to access the shared CMS state.
 * Must be used within a SupabaseCMSProvider.
 */
export function useCms() {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCms must be used within a SupabaseCMSProvider');
  }
  return context;
}
