import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Star, Check } from 'lucide-react';
import { ThoughtBubble } from '@/components/ThoughtBubble';
import type { Database } from '@/integrations/supabase/types';

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type ThoughtRow = Database['public']['Tables']['bubbles_thoughts']['Row'];

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];

const modeLabels: Record<BubblesMode, string> = {
  innocent: 'Innocent',
  concerned: 'Concerned',
  triggered: 'Triggered',
  savage: 'Savage',
  nuclear: 'Nuclear',
};

export default function AdminThoughts() {
  const [thoughts, setThoughts] = useState<ThoughtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<BubblesMode | 'all'>('all');
  const [showCuratedOnly, setShowCuratedOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<ThoughtRow | null>(null);
  
  // Form state
  const [formText, setFormText] = useState('');
  const [formMode, setFormMode] = useState<BubblesMode>('innocent');
  const [formTrigger, setFormTrigger] = useState('');
  const [formCurated, setFormCurated] = useState(false);

  useEffect(() => {
    fetchThoughts();
  }, [filterMode, showCuratedOnly]);

  async function fetchThoughts() {
    try {
      let query = supabase
        .from('bubbles_thoughts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterMode !== 'all') {
        query = query.eq('mode', filterMode);
      }

      if (showCuratedOnly) {
        query = query.eq('is_curated', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setThoughts(data || []);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      toast.error('Failed to fetch thoughts');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingThought(null);
    setFormText('');
    setFormMode('innocent');
    setFormTrigger('');
    setFormCurated(false);
    setDialogOpen(true);
  }

  function openEditDialog(thought: ThoughtRow) {
    setEditingThought(thought);
    setFormText(thought.text);
    setFormMode(thought.mode);
    setFormTrigger(thought.trigger_category || '');
    setFormCurated(thought.is_curated || false);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingThought) {
        // Update existing
        const { error } = await supabase
          .from('bubbles_thoughts')
          .update({
            text: formText,
            mode: formMode,
            trigger_category: formTrigger || null,
            is_curated: formCurated,
          })
          .eq('id', editingThought.id);

        if (error) throw error;
        toast.success('Thought updated!');
      } else {
        // Create new
        const { error } = await supabase
          .from('bubbles_thoughts')
          .insert({
            text: formText,
            mode: formMode,
            trigger_category: formTrigger || null,
            is_curated: formCurated,
          });

        if (error) throw error;
        toast.success('Thought created!');
      }

      setDialogOpen(false);
      fetchThoughts();
    } catch (error) {
      console.error('Error saving thought:', error);
      toast.error('Failed to save thought');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this thought?')) return;

    try {
      const { error } = await supabase
        .from('bubbles_thoughts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Thought deleted');
      fetchThoughts();
    } catch (error) {
      console.error('Error deleting thought:', error);
      toast.error('Failed to delete thought');
    }
  }

  async function toggleCurated(thought: ThoughtRow) {
    try {
      const { error } = await supabase
        .from('bubbles_thoughts')
        .update({ is_curated: !thought.is_curated })
        .eq('id', thought.id);

      if (error) throw error;
      toast.success(thought.is_curated ? 'Removed from curated' : 'Marked as curated');
      fetchThoughts();
    } catch (error) {
      console.error('Error updating thought:', error);
      toast.error('Failed to update thought');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Thought Bubbles</h1>
            <p className="text-muted-foreground mt-1">
              Manage Bubbles' inner thoughts across all modes
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Thought
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingThought ? 'Edit Thought' : 'Add New Thought'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Thought Text</Label>
                  <Textarea
                    id="text"
                    placeholder="The audacity."
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <Select value={formMode} onValueChange={(v) => setFormMode(v as BubblesMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {modeLabels[mode]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger Category (optional)</Label>
                  <Input
                    id="trigger"
                    placeholder="The Look™"
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="curated"
                    checked={formCurated}
                    onChange={(e) => setFormCurated(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="curated">Mark as curated</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingThought ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label>Mode:</Label>
                <Select value={filterMode} onValueChange={(v) => setFilterMode(v as BubblesMode | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {modeLabels[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="curated-filter"
                  checked={showCuratedOnly}
                  onChange={(e) => setShowCuratedOnly(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="curated-filter">Curated only</Label>
              </div>
              <div className="text-sm text-muted-foreground">
                {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thoughts Grid */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {thoughts.map((thought) => (
              <Card key={thought.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {modeLabels[thought.mode]}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {thought.is_curated && (
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      )}
                      {thought.is_ai_generated && (
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ThoughtBubble mode={thought.mode as any} size="sm">
                    <p className="text-sm">{thought.text}</p>
                  </ThoughtBubble>
                  {thought.trigger_category && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Trigger: {thought.trigger_category}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(thought)}>
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleCurated(thought)}>
                      {thought.is_curated ? (
                        <>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Curated
                        </>
                      ) : (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Curate
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(thought.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
