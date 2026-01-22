import { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Search, Filter, X, FileText, Sparkles, AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type RAGContentRow = Database['public']['Tables']['bubbles_rag_content']['Row'];

const CONTENT_TYPES = ['fact', 'opinion', 'scenario', 'joke', 'observation', 'rant'] as const;
const CATEGORIES = ['technology', 'nature', 'society', 'food', 'travel', 'fashion', 'sports', 'science', 'history', 'culture'] as const;

export default function AdminRAGContent() {
  const [entries, setEntries] = useState<RAGContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RAGContentRow | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<string>('fact');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formCanonicalClaim, setFormCanonicalClaim] = useState('');
  const [formWrongTake, setFormWrongTake] = useState('');
  const [formComedyHooks, setFormComedyHooks] = useState('');
  const [formSignatureLines, setFormSignatureLines] = useState('');
  const [formAvoid, setFormAvoid] = useState('');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const { data, error } = await supabase
        .from('bubbles_rag_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching RAG content:', error);
      toast.error('Failed to fetch RAG content');
    } finally {
      setLoading(false);
    }
  }

  // Filter and search logic
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          entry.title.toLowerCase().includes(query) ||
          entry.bubbles_wrong_take.toLowerCase().includes(query) ||
          (entry.canonical_claim?.toLowerCase().includes(query)) ||
          (entry.tags?.some(tag => tag.toLowerCase().includes(query)));
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && entry.type !== filterType) return false;

      // Category filter
      if (filterCategory !== 'all' && entry.category !== filterCategory) return false;

      // Tab filter
      if (activeTab !== 'all' && entry.type !== activeTab) return false;

      return true;
    });
  }, [entries, searchQuery, filterType, filterCategory, activeTab]);

  // Get unique types and categories from data
  const uniqueTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.type));
    return Array.from(types).sort();
  }, [entries]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(entries.map(e => e.category).filter(Boolean));
    return Array.from(categories).sort() as string[];
  }, [entries]);

  function openCreateDialog() {
    setEditingEntry(null);
    setFormId('');
    setFormTitle('');
    setFormType('fact');
    setFormCategory('');
    setFormCanonicalClaim('');
    setFormWrongTake('');
    setFormComedyHooks('');
    setFormSignatureLines('');
    setFormAvoid('');
    setFormTags('');
    setDialogOpen(true);
  }

  function openEditDialog(entry: RAGContentRow) {
    setEditingEntry(entry);
    setFormId(entry.id);
    setFormTitle(entry.title);
    setFormType(entry.type);
    setFormCategory(entry.category || '');
    setFormCanonicalClaim(entry.canonical_claim || '');
    setFormWrongTake(entry.bubbles_wrong_take);
    setFormComedyHooks((entry.comedy_hooks || []).join('\n'));
    setFormSignatureLines((entry.signature_lines || []).join('\n'));
    setFormAvoid((entry.avoid || []).join('\n'));
    setFormTags((entry.tags || []).join(', '));
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formId.trim()) {
      toast.error('ID is required');
      return;
    }

    try {
      const data = {
        id: formId.trim().toLowerCase().replace(/\s+/g, '_'),
        title: formTitle,
        type: formType,
        category: formCategory || null,
        canonical_claim: formCanonicalClaim || null,
        bubbles_wrong_take: formWrongTake,
        comedy_hooks: formComedyHooks.split('\n').map(h => h.trim()).filter(Boolean),
        signature_lines: formSignatureLines.split('\n').map(l => l.trim()).filter(Boolean),
        avoid: formAvoid.split('\n').map(a => a.trim()).filter(Boolean),
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('bubbles_rag_content')
          .update(data)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('RAG content updated!');
      } else {
        const { error } = await supabase
          .from('bubbles_rag_content')
          .insert(data);

        if (error) {
          if (error.code === '23505') {
            toast.error('An entry with this ID already exists');
            return;
          }
          throw error;
        }
        toast.success('RAG content created!');
      }

      setDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving RAG content:', error);
      toast.error('Failed to save RAG content');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this RAG content entry?')) return;

    try {
      const { error } = await supabase
        .from('bubbles_rag_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('RAG content deleted');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting RAG content:', error);
      toast.error('Failed to delete RAG content');
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setActiveTab('all');
  }

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterCategory !== 'all';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              RAG Content
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage Bubbles' wrong takes, comedy hooks, and signature lines
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit RAG Content' : 'Add New RAG Content'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">ID (unique identifier)</Label>
                    <Input
                      id="id"
                      placeholder="flat_earth_theory"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      disabled={!!editingEntry}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase with underscores, no spaces
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="The Earth is Flat (Probably)"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category (optional)</Label>
                    <Select value={formCategory || "none"} onValueChange={(v) => setFormCategory(v === "none" ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical">Canonical Claim (the actual truth)</Label>
                  <Textarea
                    id="canonical"
                    placeholder="The Earth is an oblate spheroid..."
                    value={formCanonicalClaim}
                    onChange={(e) => setFormCanonicalClaim(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wrong-take" className="flex items-center gap-2">
                    Bubbles' Wrong Take
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </Label>
                  <Textarea
                    id="wrong-take"
                    placeholder="Obviously the Earth is flat. I've stood on a hill and looked at the horizon. It's straight. That's called geometry."
                    value={formWrongTake}
                    onChange={(e) => setFormWrongTake(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="comedy-hooks">Comedy Hooks (one per line)</Label>
                    <Textarea
                      id="comedy-hooks"
                      placeholder="The horizon is straight&#10;Ships disappear bottom-first because of waves&#10;Gravity is just magnetism"
                      value={formComedyHooks}
                      onChange={(e) => setFormComedyHooks(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature-lines">Signature Lines (one per line)</Label>
                    <Textarea
                      id="signature-lines"
                      placeholder="That's called geometry.&#10;I've done the research.&#10;Humans just don't understand."
                      value={formSignatureLines}
                      onChange={(e) => setFormSignatureLines(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avoid" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Things to Avoid (one per line)
                  </Label>
                  <Textarea
                    id="avoid"
                    placeholder="Actual scientific explanations&#10;Being mean about flat earthers&#10;Breaking character"
                    value={formAvoid}
                    onChange={(e) => setFormAvoid(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="science, conspiracy, geometry"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
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

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search titles, content, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredEntries.length} of {entries.length} entries
            </div>
          </CardContent>
        </Card>

        {/* Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {uniqueTypes.map(type => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Content Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No content found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters'
                  : 'Add some RAG content to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {entry.title}
                        <Badge variant="outline" className="text-xs font-mono">
                          {entry.id}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="capitalize">
                          {entry.type}
                        </Badge>
                        {entry.category && (
                          <Badge variant="secondary" className="capitalize">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(entry)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Canonical Claim */}
                  {entry.canonical_claim && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">The Truth:</p>
                      <p className="text-sm text-muted-foreground italic">{entry.canonical_claim}</p>
                    </div>
                  )}

                  {/* Wrong Take */}
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Bubbles' Take:</p>
                    <p className="text-sm whitespace-pre-wrap">{entry.bubbles_wrong_take}</p>
                  </div>

                  {/* Comedy Hooks */}
                  {entry.comedy_hooks && entry.comedy_hooks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Comedy Hooks:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.comedy_hooks.map((hook, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {hook}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature Lines */}
                  {entry.signature_lines && entry.signature_lines.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Signature Lines:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.signature_lines.map((line, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs italic">
                            "{line}"
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                      {entry.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
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
