import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles, UserRole, canAccessModule, hasPermission, isSuperAdmin, canAccessAdmin } from '@/lib/rbac';

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      if (!user?.id) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const userRoles = await getUserRoles(user.id);
      
      // If user has no roles, they're still allowed read-only access to certain areas
      // But for a fresh user, we'll grant them readonly by default
      setRoles(userRoles.length > 0 ? userRoles : ['readonly']);
      setLoading(false);
    }

    fetchRoles();
  }, [user?.id]);

  return {
    roles,
    loading,
    isSuperAdmin: isSuperAdmin(roles),
    isAdmin: roles.includes('admin') || roles.includes('super_admin'),
    isOps: roles.includes('ops') || roles.includes('admin') || roles.includes('super_admin'),
    isMerch: roles.includes('merch') || roles.includes('admin') || roles.includes('super_admin'),
    isReadonly: roles.length === 0 || (roles.length === 1 && roles[0] === 'readonly'),
    canAccessAdmin: canAccessAdmin(roles),
    canAccess: (module: string) => canAccessModule(roles, module),
    hasPermission: (permission: string) => hasPermission(roles, permission),
  };
}