import { useUserSiteRole } from '../hooks/useUserSiteRole';

export function SiteRoleIndicator() {
  const { role, loading } = useUserSiteRole();
  if (loading)
    return <span className="bmscms:text-gray-500">Checking role…</span>;
  if (!role) return <span className="bmscms:text-red-600">No site access</span>;
  return (
    <span className="bmscms:text-sm bmscms:text-gray-700">
      Your role: <b className="bmscms:font-bold bmscms:text-blue-700">{role}</b>
    </span>
  );
}

export default SiteRoleIndicator;
