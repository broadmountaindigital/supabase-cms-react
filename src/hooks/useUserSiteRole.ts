import { useEffect, useState } from 'react';
import { useSupabaseCMS } from './useSupabaseCMS';
import { useSiteContext } from '../providers/useSiteContext';
import type { UserSiteAccess } from '../types/database';

export function useUserSiteRole() {
  const { user } = useSupabaseCMS();
  const { siteId, supabase } = useSiteContext();
  const [role, setRole] = useState<UserSiteAccess['role'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !siteId) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('user_site_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('site_id', siteId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setRole(null);
        } else {
          setRole(data.role);
        }
        setLoading(false);
      });
  }, [user, siteId, supabase]);

  return { role, loading };
}
