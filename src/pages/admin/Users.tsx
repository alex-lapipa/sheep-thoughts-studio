import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserRole, assignRole, removeRole } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, ShieldCheck, UserPlus, Search, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: UserRole[];
}

const AVAILABLE_ROLES: UserRole[] = ['super_admin', 'admin', 'ops', 'merch', 'readonly'];

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-mode-nuclear/10 text-mode-nuclear border-mode-nuclear/20',
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  ops: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  merch: 'bg-green-500/10 text-green-500 border-green-500/20',
  readonly: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const roleDescriptions: Record<UserRole, string> = {
  super_admin: 'Full system access including user management and system config',
  admin: 'Full access to all operational features',
  ops: 'Order management, exceptions, POD jobs, customer support',
  merch: 'Product management, mappings, drops, pricing',
  readonly: 'View-only access to dashboard and basic reports',
};

export default function AdminUsers() {
  const { isSuperAdmin } = useUserRoles();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingRole, setAddingRole] = useState<{ userId: string; role: UserRole } | null>(null);
  const [removingRole, setRemovingRole] = useState<{ userId: string; role: UserRole } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Group roles by user
      const rolesByUser: Record<string, UserRole[]> = {};
      rolesData?.forEach(r => {
        if (!rolesByUser[r.user_id]) {
          rolesByUser[r.user_id] = [];
        }
        rolesByUser[r.user_id].push(r.role as UserRole);
      });

      // Get unique user IDs
      const userIds = Object.keys(rolesByUser);
      
      // For users with roles, we'll show them
      // Note: We can't directly query auth.users, so we show what we know
      const usersWithRoles: UserWithRoles[] = userIds.map(userId => ({
        id: userId,
        email: 'Loading...', // We'll try to get this from a different source
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        roles: rolesByUser[userId] || [],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddRole = async (userId: string, role: UserRole) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can manage roles');
      return;
    }

    setAddingRole({ userId, role });
    try {
      const success = await assignRole(userId, role);
      if (success) {
        toast.success(`Role "${role}" assigned successfully`);
        await fetchUsers();
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAddingRole(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can manage roles');
      return;
    }

    setRemovingRole({ userId, role });
    try {
      const success = await removeRole(userId, role);
      if (success) {
        toast.success(`Role "${role}" removed successfully`);
        await fetchUsers();
      } else {
        toast.error('Failed to remove role');
      }
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    } finally {
      setRemovingRole(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">
              User management is only available to super admins.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Users & Roles</h1>
            <p className="text-muted-foreground">
              Manage user access and permissions
            </p>
          </div>
        </div>

        {/* Role Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Role Definitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_ROLES.map(role => (
                <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className={cn('capitalize shrink-0', roleColors[role])}>
                    {role.replace('_', ' ')}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} with roles
          </p>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users with Roles</CardTitle>
            <CardDescription>
              Users who have been assigned roles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found with assigned roles</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Current Roles</TableHead>
                    <TableHead>Add Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {user.id.slice(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map(role => (
                            <div key={role} className="flex items-center gap-1">
                              <Badge 
                                variant="outline" 
                                className={cn('capitalize', roleColors[role])}
                              >
                                {role.replace('_', ' ')}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveRole(user.id, role)}
                                disabled={removingRole?.userId === user.id && removingRole?.role === role}
                              >
                                {removingRole?.userId === user.id && removingRole?.role === role ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) => handleAddRole(user.id, value as UserRole)}
                          disabled={addingRole?.userId === user.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Add role..." />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_ROLES.filter(r => !user.roles.includes(r)).map(role => (
                              <SelectItem key={role} value={role}>
                                {role.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add New User Role */}
        <AddUserRoleCard onUserAdded={fetchUsers} />
      </div>
    </AdminLayout>
  );
}

function AddUserRoleCard({ onUserAdded }: { onUserAdded: () => void }) {
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [adding, setAdding] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim() || !selectedRole) {
      toast.error('Please enter a user ID and select a role');
      return;
    }

    setAdding(true);
    try {
      const success = await assignRole(userId.trim(), selectedRole);
      if (success) {
        toast.success(`Role "${selectedRole}" assigned to user`);
        setUserId('');
        setSelectedRole('');
        onUserAdded();
      } else {
        toast.error('Failed to assign role. Check if user ID is valid.');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Assign Role to User
        </CardTitle>
        <CardDescription>
          Enter a user ID (UUID) to assign a new role. Users must have signed up first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Input
            placeholder="User ID (e.g., a1b2c3d4-e5f6-...)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-1"
          />
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ROLES.map(role => (
                <SelectItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={adding || !userId.trim() || !selectedRole}>
            {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
