import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSiteContext } from '@/providers/SupabaseCMSProvider';
import { SiteAwareServiceFactory } from '@/lib/services/SiteAwareServiceFactory';
import type { RootState, AppDispatch } from '@/store';

export function useSupabaseCMS() {
  const { siteId, supabase } = useSiteContext();
  const dispatch = useDispatch<AppDispatch>();

  // Create site-aware service factory
  const serviceFactory = useMemo(() => {
    return new SiteAwareServiceFactory(supabase, siteId);
  }, [supabase, siteId]);

  // Create service instances
  const services = useMemo(() => {
    return {
      sites: serviceFactory.createSitesService(),
      contentFields: serviceFactory.createContentFieldsService(),
      sitePages: serviceFactory.createSitePagesService(),
      profiles: serviceFactory.createProfilesService(),
    };
  }, [serviceFactory]);

  // Redux selectors
  const user = useSelector((state: RootState) => state.user.user);
  const isInEditMode = useSelector(
    (state: RootState) => state.editingTools.isInEditMode
  );
  const userLoading = useSelector((state: RootState) => state.user.loading);
  const userError = useSelector((state: RootState) => state.user.error);

  return {
    // Site context
    siteId,
    supabase,

    // Services
    services,

    // Redux state
    user,
    isInEditMode,
    userLoading,
    userError,

    // Redux dispatch
    dispatch,
  };
}
