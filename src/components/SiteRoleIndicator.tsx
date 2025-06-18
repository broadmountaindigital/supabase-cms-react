import { useUserSiteRole } from '../hooks/useUserSiteRole';

export function SiteRoleIndicator() {
  const { role, loading } = useUserSiteRole();
  if (loading) return <span>Checking role…</span>;
  if (!role) return <span>No site access</span>;
  return (
    <span>
      Your role: <b>{role}</b>
    </span>
  );
}
