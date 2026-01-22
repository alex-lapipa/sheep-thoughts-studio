import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles, UserRole, canAccessModule, hasPermission, isSuperAdmin, canAccessAdmin, isPreAuthorizedOwner } from '@/lib/rbac';
import { supabase } from '@/integrations/supabase/client';

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      if (!user?.id || !user?.email) {
        setRoles([]);
        setIsOwner(false);
        setLoading(false);
        return;
      }

      // Fetch roles
      const userRoles = await getUserRoles(user.id);
      
      // Check if user is a pre-authorized owner
      const ownerStatus = isPreAuthorizedOwner(user.email);
      
      // Also check the database for is_owner flag
      if (!ownerStatus) {
        const { data: preAuthData } = await supabase
          .from('pre_authorized_users')
          .select('is_owner')
          .eq('email', user.email.toLowerCase())
          .maybeSingle();
        
        setIsOwner(preAuthData?.is_owner === true);
      } else {
        setIsOwner(true);
      }
      
      // If user has no roles, they're still allowed read-only access to certain areas
      // But for a fresh user, we'll grant them readonly by default
      setRoles(userRoles.length > 0 ? userRoles : ['readonly']);
      setLoading(false);
    }

    fetchRoles();
  }, [user?.id, user?.email]);

  return {
    roles,
    loading,
    isOwner,
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