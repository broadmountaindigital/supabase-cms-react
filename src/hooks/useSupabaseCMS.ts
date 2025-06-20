import { useMemo, useState } from 'react';
import { useSiteContext } from '../providers/useSiteContext';
import { useCms } from '../providers/useCms';
import { contentFieldsService } from '../lib/services/ContentFields.service';
import { fieldCollectionsService } from '../lib/services/FieldCollections.service';
import { sitesService } from '../lib/services/Sites.service';
import { sitePagesService } from '../lib/services/SitePages.service';
import { profilesService } from '../lib/services/Profiles.service';
import type {
  AuthError,
  AuthResponse,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js';

/**
 * The main hook for interacting with the Supabase CMS.
 * Provides access to authentication, site-specific services, and CMS state.
 */
export function useSupabaseCMS() {
  // --- Get contexts ---
  const { siteId, supabase } = useSiteContext();
  const { user, loading, error, isInEditMode, toggleEditMode } = useCms();

  // --- Local state for auth functions ---
  // This state is specific to the component calling the auth function,
  // so it does not need to be in the shared context.
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // --- Services with site context ---
  const services = useMemo(() => {
    return {
      sites: sitesService.withSite(siteId),
      contentFields: contentFieldsService.withSite(siteId),
      sitePages: sitePagesService.withSite(siteId),
      profiles: profilesService,
      fieldCollections: fieldCollectionsService.withSite(siteId),
    };
  }, [siteId]);

  // --- Auth Functions ---
  async function signIn(
    credentials: SignInWithPasswordCredentials
  ): Promise<AuthResponse> {
    setAuthLoading(true);
    setAuthError(null);
    const response = await supabase.auth.signInWithPassword(credentials);
    if (response.error) {
      setAuthError(response.error);
    }
    setAuthLoading(false);
    return response;
  }

  async function signUp(
    credentials: SignUpWithPasswordCredentials
  ): Promise<AuthResponse> {
    setAuthLoading(true);
    setAuthError(null);
    const response = await supabase.auth.signUp(credentials);
    if (response.error) {
      setAuthError(response.error);
    }
    setAuthLoading(false);
    return response;
  }

  async function signOut(): Promise<{ error: AuthError | null }> {
    setAuthLoading(true);
    setAuthError(null);
    const response = await supabase.auth.signOut();
    if (response.error) {
      setAuthError(response.error);
    }
    setAuthLoading(false);
    return response;
  }

  return {
    // From SiteContext
    siteId,
    supabase,
    // From CmsContext
    user,
    loading,
    error,
    isInEditMode,
    toggleEditMode,
    // From local state
    authLoading,
    authError,
    // From this hook
    services,
    signIn,
    signUp,
    signOut,
  };
}
