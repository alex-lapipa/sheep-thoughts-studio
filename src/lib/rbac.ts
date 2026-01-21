import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'ops' | 'merch' | 'readonly';

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Permission definitions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'], // All permissions + system config
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

// Super admin specific permissions
export const SUPER_ADMIN_ONLY_PERMISSIONS = [
  'system.config',
  'users.manage_roles',
  'knowledge.manage',
  'brand.manage',
];

export function hasPermission(roles: UserRole[], permission: string): boolean {
  for (const role of roles) {
    const perms = ROLE_PERMISSIONS[role];
    if (perms.includes('*') || perms.includes(permission)) {
      return true;
    }
  }
  return false;
}

export function isSuperAdmin(roles: UserRole[]): boolean {
  return roles.includes('super_admin');
}

export function canAccessAdmin(roles: UserRole[]): boolean {
  return roles.includes('super_admin') || roles.includes('admin');
}

export function canAccessModule(roles: UserRole[], module: string): boolean {
  const modulePermissions: Record<string, string[]> = {
    dashboard: ['dashboard.view'],
    shopify: ['admin', 'super_admin'],
    webhooks: ['webhooks.view', 'admin', 'super_admin'],
    pod: ['pod_providers.view', 'admin', 'super_admin'],
    mappings: ['mappings.view', 'mappings.manage', 'admin', 'super_admin'],
    orders: ['orders.view', 'orders.manage', 'admin', 'super_admin'],
    exceptions: ['exceptions.view', 'exceptions.manage', 'admin', 'super_admin'],
    products: ['products.view', 'products.manage', 'admin', 'super_admin'],
    pricing: ['pricing.view', 'pricing.manage', 'admin', 'super_admin'],
    drops: ['drops.view', 'drops.manage', 'admin', 'super_admin'],
    audit: ['audit.view', 'admin', 'super_admin'],
    brand: ['brand.manage', 'super_admin'],
    knowledge: ['knowledge.manage', 'super_admin'],
    thoughts: ['knowledge.manage', 'super_admin'],
    triggers: ['knowledge.manage', 'super_admin'],
    scenarios: ['knowledge.manage', 'super_admin'],
    generate: ['knowledge.manage', 'super_admin'],
  };

  const requiredPerms = modulePermissions[module] || [];
  
  for (const role of roles) {
    if (role === 'super_admin' || role === 'admin') return true;
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

export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_super_admin', { _user_id: userId });
  if (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
  return data === true;
}

export async function checkCanAccessAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_admin', { _user_id: userId });
  if (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
  return data === true;
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