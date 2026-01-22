import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserRole } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Shield, UserPlus, Search, Trash2, Loader2, Crown, Edit, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PreAuthorizedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_ROLES: UserRole[] = ['super_admin', 'admin', 'ops', 'merch', 'readonly'];

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-mode-nuclear/10 text-mode-nuclear border-mode-nuclear/20',
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  ops: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  merch: 'bg-green-500/10 text-green-500 border-green-500/20',
  readonly: 'bg-muted text-muted-foreground border-border',
};

export default function PreAuthorizedUsersPage() {
  const { isSuperAdmin } = useUserRoles();
  const [users, setUsers] = useState<PreAuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PreAuthorizedUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pre_authorized_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching pre-authorized users:', error);
      toast.error('Failed to load pre-authorized users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pre_authorized_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Pre-authorized user removed');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-display font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground">
              Pre-authorized user management is only available to super admins.
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
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Users className="h-8 w-8" />
              Pre-Authorized Users
            </h1>
            <p className="text-muted-foreground">
              Manage users who are pre-approved to access the admin portal
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <AddEditUserDialog
              onSuccess={() => {
                setAddDialogOpen(false);
                fetchUsers();
              }}
              onCancel={() => setAddDialogOpen(false)}
            />
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-bubbles-gorse/20">
                <Crown className="h-6 w-6 text-bubbles-gorse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">How Pre-Authorization Works</h3>
                <p className="text-sm text-muted-foreground">
                  Pre-authorized users are automatically granted their assigned role when they sign up.
                  Users marked as <span className="font-medium text-bubbles-gorse">Owner</span> have a special badge displayed in the admin header.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredUsers.length} pre-authorized user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Authorized Users</CardTitle>
            <CardDescription>
              Users who will automatically receive roles upon signup
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
                <p>No pre-authorized users found</p>
                <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                  Add First User
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {user.name || 'Unnamed'}
                            {user.is_owner && (
                              <span className="text-bubbles-gorse">
                                <Crown className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn('capitalize', roleColors[user.role])}
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_owner ? (
                          <Badge className="bg-bubbles-gorse/20 text-bubbles-gorse border-bubbles-gorse/30">
                            👑 Owner
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Member</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog 
                            open={editingUser?.id === user.id} 
                            onOpenChange={(open) => !open && setEditingUser(null)}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {editingUser && (
                              <AddEditUserDialog
                                user={editingUser}
                                onSuccess={() => {
                                  setEditingUser(null);
                                  fetchUsers();
                                }}
                                onCancel={() => setEditingUser(null)}
                              />
                            )}
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Pre-Authorized User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove <strong>{user.email}</strong> from the pre-authorized list? 
                                  This won't affect their existing account if they've already signed up.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface AddEditUserDialogProps {
  user?: PreAuthorizedUser;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddEditUserDialog({ user, onSuccess, onCancel }: AddEditUserDialogProps) {
  const isEditing = !!user;
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'readonly');
  const [isOwner, setIsOwner] = useState(user?.is_owner || false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('pre_authorized_users')
          .update({
            email: email.toLowerCase().trim(),
            name: name.trim() || null,
            role,
            is_owner: isOwner,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Pre-authorized user updated');
      } else {
        const { error } = await supabase
          .from('pre_authorized_users')
          .insert({
            email: email.toLowerCase().trim(),
            name: name.trim() || null,
            role,
            is_owner: isOwner,
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('This email is already pre-authorized');
            return;
          }
          throw error;
        }
        toast.success('Pre-authorized user added');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit' : 'Add'} Pre-Authorized User</DialogTitle>
        <DialogDescription>
          {isEditing 
            ? 'Update the pre-authorization settings for this user.' 
            : 'Add a new user to the pre-authorized list. They will automatically receive the assigned role when they sign up.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEditing}
          />
          {isEditing && (
            <p className="text-xs text-muted-foreground">Email cannot be changed after creation</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ROLES.map(r => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is_owner" className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-bubbles-gorse" />
              Owner Status
            </Label>
            <p className="text-sm text-muted-foreground">
              Owners get a special badge in the admin header
            </p>
          </div>
          <Switch
            id="is_owner"
            checked={isOwner}
            onCheckedChange={setIsOwner}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Add User'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
