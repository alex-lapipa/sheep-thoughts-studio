import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TriggerRow = Database['public']['Tables']['bubbles_triggers']['Row'];

export default function AdminTriggers() {
  const [triggers, setTriggers] = useState<TriggerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerRow | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLogic, setFormLogic] = useState('');
  const [formScenario, setFormScenario] = useState('');
  const [formBubbles, setFormBubbles] = useState('');

  useEffect(() => {
    fetchTriggers();
  }, []);

  async function fetchTriggers() {
    try {
      const { data, error } = await supabase
        .from('bubbles_triggers')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      toast.error('Failed to fetch triggers');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingTrigger(null);
    setFormName('');
    setFormCategory('');
    setFormDescription('');
    setFormLogic('');
    setFormScenario('');
    setFormBubbles('');
    setDialogOpen(true);
  }

  function openEditDialog(trigger: TriggerRow) {
    setEditingTrigger(trigger);
    setFormName(trigger.name);
    setFormCategory(trigger.category);
    setFormDescription(trigger.description);
    setFormLogic(trigger.internal_logic);
    setFormScenario(trigger.example_scenario || '');
    setFormBubbles((trigger.example_bubbles || []).join('\n'));
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const data = {
        name: formName,
        category: formCategory,
        description: formDescription,
        internal_logic: formLogic,
        example_scenario: formScenario || null,
        example_bubbles: formBubbles.split('\n').filter(b => b.trim()),
      };

      if (editingTrigger) {
        const { error } = await supabase
          .from('bubbles_triggers')
          .update(data)
          .eq('id', editingTrigger.id);

        if (error) throw error;
        toast.success('Trigger updated!');
      } else {
        const { error } = await supabase
          .from('bubbles_triggers')
          .insert(data);

        if (error) throw error;
        toast.success('Trigger created!');
      }

      setDialogOpen(false);
      fetchTriggers();
    } catch (error) {
      console.error('Error saving trigger:', error);
      toast.error('Failed to save trigger');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this trigger?')) return;

    try {
      const { error } = await supabase
        .from('bubbles_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Trigger deleted');
      fetchTriggers();
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast.error('Failed to delete trigger');
    }
  }

  // Group triggers by category
  const groupedTriggers = triggers.reduce((acc, trigger) => {
    if (!acc[trigger.category]) {
      acc[trigger.category] = [];
    }
    acc[trigger.category].push(trigger);
    return acc;
  }, {} as Record<string, TriggerRow[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Trigger Taxonomy</h1>
            <p className="text-muted-foreground mt-1">
              Define what flips Bubbles into Savage Mode
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTrigger ? 'Edit Trigger' : 'Add New Trigger'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="The Look™"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="social_misread"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Misreading neutral facial expressions as judgment"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logic">Internal Logic</Label>
                  <Textarea
                    id="logic"
                    placeholder="They saw something. They know something."
                    value={formLogic}
                    onChange={(e) => setFormLogic(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario">Example Scenario</Label>
                  <Input
                    id="scenario"
                    placeholder="A passing cow glances at Bubbles for 0.3 seconds"
                    value={formScenario}
                    onChange={(e) => setFormScenario(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bubbles">Example Bubble Lines (one per line)</Label>
                  <Textarea
                    id="bubbles"
                    placeholder="Why did she look at me like that?&#10;Like I'm nothing?&#10;WHAT DO YOU KNOW."
                    value={formBubbles}
                    onChange={(e) => setFormBubbles(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTrigger ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Triggers by Category */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTriggers).map(([category, categoryTriggers]) => (
              <div key={category}>
                <h2 className="font-display text-xl font-semibold mb-4 capitalize">
                  {category.replace('_', ' ')}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryTriggers.map((trigger) => (
                    <Card key={trigger.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{trigger.name}</CardTitle>
                        <CardDescription>{trigger.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Internal Logic</p>
                            <p className="text-sm italic">"{trigger.internal_logic}"</p>
                          </div>
                          {trigger.example_scenario && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Example</p>
                              <p className="text-sm">{trigger.example_scenario}</p>
                            </div>
                          )}
                          {trigger.example_bubbles && trigger.example_bubbles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {trigger.example_bubbles.map((bubble, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  "{bubble}"
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(trigger)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive"
                            onClick={() => handleDelete(trigger.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
