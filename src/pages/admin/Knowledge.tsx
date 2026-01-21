import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type KnowledgeCategory = Database['public']['Enums']['bubbles_knowledge_category'];
type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type KnowledgeRow = Database['public']['Tables']['bubbles_knowledge']['Row'];

const CATEGORIES: KnowledgeCategory[] = [
  'character_bible',
  'psychology',
  'humor_mechanisms',
  'mode_system',
  'trigger_taxonomy',
  'writing_rules',
  'visual_identity',
  'brand_guidelines',
  'comedy_bible',
  'cross_cultural',
  'example_content',
  'research'
];

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];

export default function AdminKnowledge() {
  const [entries, setEntries] = useState<KnowledgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeRow | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<KnowledgeCategory>('character_bible');
  const [formMode, setFormMode] = useState<BubblesMode | ''>('');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [filterCategory]);

  async function fetchEntries() {
    try {
      let query = supabase
        .from('bubbles_knowledge')
        .select('*')
        .order('category', { ascending: true });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast.error('Failed to fetch knowledge entries');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingEntry(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('character_bible');
    setFormMode('');
    setFormTags('');
    setDialogOpen(true);
  }

  function openEditDialog(entry: KnowledgeRow) {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormCategory(entry.category);
    setFormMode(entry.mode || '');
    setFormTags((entry.tags || []).join(', '));
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const data = {
        title: formTitle,
        content: formContent,
        category: formCategory,
        mode: formMode || null,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('bubbles_knowledge')
          .update(data)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Knowledge entry updated!');
      } else {
        const { error } = await supabase
          .from('bubbles_knowledge')
          .insert(data);

        if (error) throw error;
        toast.success('Knowledge entry created!');
      }

      setDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast.error('Failed to save knowledge entry');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    try {
      const { error } = await supabase
        .from('bubbles_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Knowledge entry deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('Failed to delete knowledge entry');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">
              Character bible, psychology research, and brand guidelines
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Knowledge Entry' : 'Add New Knowledge Entry'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Bubbles Core Identity"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formCategory} onValueChange={(v) => setFormCategory(v as KnowledgeCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mode (optional)</Label>
                    <Select value={formMode} onValueChange={(v) => setFormMode(v as BubblesMode | '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Full knowledge entry content..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="core, identity, character"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEntry ? 'Update' : 'Create'}
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
                <Label>Category:</Label>
                <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as KnowledgeCategory | 'all')}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Entries */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {entry.category.replace('_', ' ')}
                        </Badge>
                        {entry.mode && (
                          <Badge variant="secondary" className="capitalize">
                            {entry.mode}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(entry)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {entry.content}
                  </p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
