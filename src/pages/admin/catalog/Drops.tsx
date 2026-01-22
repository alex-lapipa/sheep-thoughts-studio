import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag, Plus, Pencil, Trash2, RefreshCw, Calendar, Zap, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Drop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tag_value: string;
  mode_tag: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  checklist: unknown;
  created_at: string;
  updated_at: string;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [modeTag, setModeTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchDrops();
  }, []);

  async function fetchDrops() {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrops(data || []);
    } catch (error) {
      console.error('Error fetching drops:', error);
      toast.error('Failed to fetch drops');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName('');
    setSlug('');
    setDescription('');
    setTagValue('');
    setModeTag('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setEditingDrop(null);
  }

  function openEditDialog(drop: Drop) {
    setEditingDrop(drop);
    setName(drop.name);
    setSlug(drop.slug);
    setDescription(drop.description || '');
    setTagValue(drop.tag_value);
    setModeTag(drop.mode_tag || '');
    setStartDate(drop.start_date ? drop.start_date.split('T')[0] : '');
    setEndDate(drop.end_date ? drop.end_date.split('T')[0] : '');
    setIsActive(drop.is_active ?? true);
    setDialogOpen(true);
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit() {
    if (!name.trim() || !tagValue.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug || generateSlug(name),
        description: description || null,
        tag_value: tagValue.trim(),
        mode_tag: modeTag || null,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
      };

      if (editingDrop) {
        const { error } = await supabase
          .from('drops')
          .update(payload)
          .eq('id', editingDrop.id);
        if (error) throw error;
        toast.success('Drop updated');
      } else {
        const { error } = await supabase
          .from('drops')
          .insert(payload);
        if (error) throw error;
        toast.success('Drop created');
      }

      setDialogOpen(false);
      resetForm();
      fetchDrops();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save drop');
    }
  }

  async function handleDelete(drop: Drop) {
    if (!confirm(`Delete "${drop.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('drops')
        .delete()
        .eq('id', drop.id);
      if (error) throw error;
      toast.success('Drop deleted');
      fetchDrops();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    }
  }

  async function handleToggleActive(drop: Drop) {
    try {
      const { error } = await supabase
        .from('drops')
        .update({ is_active: !drop.is_active })
        .eq('id', drop.id);
      if (error) throw error;
      toast.success(drop.is_active ? 'Drop deactivated' : 'Drop activated');
      fetchDrops();
    } catch (error) {
      console.error('Toggle failed:', error);
      toast.error('Failed to update');
    }
  }

  const now = new Date();
  const activeDrops = drops.filter(d => d.is_active);
  const upcomingDrops = drops.filter(d => d.start_date && new Date(d.start_date) > now);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="product-drops" className="font-display text-3xl font-bold">Product Drops</h1>
            <p className="text-muted-foreground mt-1">
              Manage limited edition and seasonal product collections
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Drop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDrop ? 'Edit' : 'Create'} Drop</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Drop Name *</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => { 
                      setName(e.target.value);
                      if (!editingDrop) setSlug(generateSlug(e.target.value));
                    }} 
                    placeholder="e.g., Summer 2025 Collection" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="summer-2025" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Drop description..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Product Tag *</Label>
                  <Input value={tagValue} onChange={(e) => setTagValue(e.target.value)} placeholder="e.g., drop-summer-2025" />
                  <p className="text-xs text-muted-foreground">Products with this Shopify tag will be included</p>
                </div>
                <div className="space-y-2">
                  <Label>Bubbles Mode Tag</Label>
                  <Input value={modeTag} onChange={(e) => setModeTag(e.target.value)} placeholder="e.g., hype" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingDrop ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Drops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drops.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeDrops.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingDrops.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Drops Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : drops.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No drops configured</p>
                <p className="text-sm">Create a drop to organize limited edition products</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drops.map((drop) => (
              <Card key={drop.id} className={drop.is_active ? 'border-green-500/30' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{drop.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{drop.slug}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={drop.is_active 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-gray-500/10 text-gray-600'
                      }
                    >
                      {drop.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{drop.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {drop.tag_value}
                      </Badge>
                      {drop.mode_tag && (
                        <Badge variant="outline">{drop.mode_tag}</Badge>
                      )}
                    </div>
                    {(drop.start_date || drop.end_date) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {drop.start_date && format(new Date(drop.start_date), 'MMM d, yyyy')}
                        {drop.start_date && drop.end_date && ' → '}
                        {drop.end_date && format(new Date(drop.end_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(drop)}>
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(drop)}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {drop.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(drop)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
