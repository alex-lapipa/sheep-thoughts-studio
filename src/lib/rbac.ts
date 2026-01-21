import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'ops' | 'merch' | 'readonly';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Permission definitions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // All permissions
  ops: [
    'orders.view', 'orders.manage',
    'exceptions.view', 'exceptions.manage',
    'webhooks.view',
    'pod_jobs.view', 'pod_jobs.manage',
    'audit.view',
    'customers.view', 'customers.manage',
  ],
  merch: [
    'products.view', 'products.manage',
    'mappings.view', 'mappings.manage',
    'drops.view', 'drops.manage',
    'pricing.view', 'pricing.manage',
    'mockups.view', 'mockups.manage',
    'pod_providers.view',
  ],
  readonly: [
    'dashboard.view',
    'products.view',
    'orders.view',
    'drops.view',
  ],
};

export function hasPermission(roles: UserRole[], permission: string): boolean {
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms.includes('*') || perms.includes(permission)) {
      return true;
    }
  }
  return false;
}

export function canAccessModule(roles: UserRole[], module: string): boolean {
  const modulePermissions: Record<string, string[]> = {
    dashboard: ['dashboard.view'],
    shopify: ['admin'],
    webhooks: ['webhooks.view', 'admin'],
    pod: ['pod_providers.view', 'admin'],
    mappings: ['mappings.view', 'mappings.manage', 'admin'],
    orders: ['orders.view', 'orders.manage', 'admin'],
    exceptions: ['exceptions.view', 'exceptions.manage', 'admin'],
    products: ['products.view', 'products.manage', 'admin'],
    pricing: ['pricing.view', 'pricing.manage', 'admin'],
    drops: ['drops.view', 'drops.manage', 'admin'],
    audit: ['audit.view', 'admin'],
  };

  const requiredPerms = modulePermissions[module] || [];
  
  for (const role of roles) {
    if (role === 'admin') return true;
    const rolePerms = ROLE_PERMISSIONS[role];
    for (const perm of requiredPerms) {
      if (rolePerms.includes(perm)) return true;
    }
  }
  
  return false;
}

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data.map(r => r.role as UserRole);
}

export async function assignRole(userId: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

  return !error;
}

export async function removeRole(userId: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);

  return !error;
}
