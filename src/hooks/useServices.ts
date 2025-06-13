import { useSupabaseCMS } from './useSupabaseCMS';

// Hook for sites service
export function useSitesService() {
  const { services } = useSupabaseCMS();
  return services.sites;
}

// Hook for content fields service
export function useContentFieldsService() {
  const { services } = useSupabaseCMS();
  return services.contentFields;
}

// Hook for site pages service
export function useSitePagesService() {
  const { services } = useSupabaseCMS();
  return services.sitePages;
}

// Hook for profiles service
export function useProfilesService() {
  const { services } = useSupabaseCMS();
  return services.profiles;
}
