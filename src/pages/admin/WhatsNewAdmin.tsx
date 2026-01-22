import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink, Rss, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: 'feature', label: 'New Feature', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { value: 'improvement', label: 'Improvement', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { value: 'fix', label: 'Bug Fix', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { value: 'announcement', label: 'Announcement', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
];

export default function WhatsNewAdmin() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('feature');
  const [isPublished, setIsPublished] = useState(false);

  const rssUrl = 'https://iteckeoeowgguhgrpcnm.supabase.co/functions/v1/changelog-rss';

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('changelog_entries' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching changelog entries:', error);
      setEntries([]);
    } else {
      setEntries((data as unknown as ChangelogEntry[]) || []);
    }
    setLoading(false);
  }

  function openCreateDialog() {
    setEditingEntry(null);
    setTitle('');
    setDescription('');
    setCategory('feature');
    setIsPublished(false);
    setDialogOpen(true);
  }

  function openEditDialog(entry: ChangelogEntry) {
    setEditingEntry(entry);
    setTitle(entry.title);
    setDescription(entry.description);
    setCategory(entry.category);
    setIsPublished(entry.is_published);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const entryData = {
      title: title.trim(),
      description: description.trim(),
      category,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    };

    if (editingEntry) {
      const { error } = await supabase
        .from('changelog_entries' as any)
        .update(entryData)
        .eq('id', editingEntry.id);

      if (error) {
        toast.error('Failed to update entry');
        console.error(error);
        return;
      }
      toast.success('Entry updated');
    } else {
      const { error } = await supabase
        .from('changelog_entries' as any)
        .insert(entryData);

      if (error) {
        toast.error('Failed to create entry');
        console.error(error);
        return;
      }
      toast.success('Entry created');
    }

    setDialogOpen(false);
    fetchEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('changelog_entries' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete entry');
      console.error(error);
      return;
    }

    toast.success('Entry deleted');
    fetchEntries();
  }

  async function togglePublish(entry: ChangelogEntry) {
    const newPublished = !entry.is_published;
    const { error } = await supabase
      .from('changelog_entries' as any)
      .update({
        is_published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      })
      .eq('id', entry.id);

    if (error) {
      toast.error('Failed to update entry');
      console.error(error);
      return;
    }

    toast.success(newPublished ? 'Entry published' : 'Entry unpublished');
    fetchEntries();
  }

  const getCategoryBadge = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found || CATEGORIES[0];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">What's New</h1>
            <p className="text-muted-foreground">Manage changelog entries and announcements</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Rss className="h-4 w-4" />
              RSS Feed
              <ExternalLink className="h-3 w-3" />
            </a>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Edit Entry' : 'New Changelog Entry'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's new?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the change..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Publish immediately</Label>
                    <Switch
                      id="published"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingEntry ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No changelog entries yet</p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {entries.map(entry => {
              const catBadge = getCategoryBadge(entry.category);
              return (
                <Card key={entry.id} className={!entry.is_published ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          <Badge variant="outline" className={catBadge.color}>
                            {catBadge.label}
                          </Badge>
                          {!entry.is_published && (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish(entry)}
                        >
                          {entry.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {entry.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
