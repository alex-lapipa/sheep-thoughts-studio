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
import { Plus, Trash2, Edit2, ArrowRight } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type ScenarioRow = Database['public']['Tables']['bubbles_scenarios']['Row'];

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];

const modeEmojis: Record<BubblesMode, string> = {
  innocent: '😊',
  concerned: '😐',
  triggered: '😤',
  savage: '😈',
  nuclear: '☢️',
};

interface Beat {
  mode: BubblesMode;
  thought: string;
  action?: string;
}

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioRow | null>(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartMode, setFormStartMode] = useState<BubblesMode>('innocent');
  const [formEndMode, setFormEndMode] = useState<BubblesMode>('savage');
  const [formTrigger, setFormTrigger] = useState('');
  const [formBeats, setFormBeats] = useState<Beat[]>([]);

  useEffect(() => {
    fetchScenarios();
  }, []);

  async function fetchScenarios() {
    try {
      const { data, error } = await supabase
        .from('bubbles_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast.error('Failed to fetch scenarios');
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingScenario(null);
    setFormTitle('');
    setFormDescription('');
    setFormStartMode('innocent');
    setFormEndMode('savage');
    setFormTrigger('');
    setFormBeats([{ mode: 'innocent', thought: '' }]);
    setDialogOpen(true);
  }

  function openEditDialog(scenario: ScenarioRow) {
    setEditingScenario(scenario);
    setFormTitle(scenario.title);
    setFormDescription(scenario.description);
    setFormStartMode(scenario.start_mode);
    setFormEndMode(scenario.end_mode);
    setFormTrigger(scenario.trigger_category || '');
    setFormBeats((scenario.beats as unknown as Beat[]) || [{ mode: 'innocent', thought: '' }]);
    setDialogOpen(true);
  }

  function addBeat() {
    setFormBeats([...formBeats, { mode: 'concerned', thought: '' }]);
  }

  function updateBeat(index: number, field: keyof Beat, value: string) {
    const newBeats = [...formBeats];
    newBeats[index] = { ...newBeats[index], [field]: value };
    setFormBeats(newBeats);
  }

  function removeBeat(index: number) {
    if (formBeats.length > 1) {
      setFormBeats(formBeats.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const data = {
        title: formTitle,
        description: formDescription,
        start_mode: formStartMode as BubblesMode,
        end_mode: formEndMode as BubblesMode,
        trigger_category: formTrigger || null,
        beats: formBeats as unknown as Database['public']['Tables']['bubbles_scenarios']['Insert']['beats'],
      };

      if (editingScenario) {
        const { error } = await supabase
          .from('bubbles_scenarios')
          .update(data)
          .eq('id', editingScenario.id);

        if (error) throw error;
        toast.success('Scenario updated!');
      } else {
        const { error } = await supabase
          .from('bubbles_scenarios')
          .insert(data);

        if (error) throw error;
        toast.success('Scenario created!');
      }

      setDialogOpen(false);
      fetchScenarios();
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast.error('Failed to save scenario');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this scenario?')) return;

    try {
      const { error } = await supabase
        .from('bubbles_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Scenario deleted');
      fetchScenarios();
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Failed to delete scenario');
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Scenarios</h1>
            <p className="text-muted-foreground mt-1">
              Manage escalation story templates with beat-by-beat progressions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Scenario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingScenario ? 'Edit Scenario' : 'Add New Scenario'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="The Borrowed Bucket"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Trigger Category</Label>
                    <Input
                      id="trigger"
                      placeholder="Object Conspiracy"
                      value={formTrigger}
                      onChange={(e) => setFormTrigger(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Someone moves Bubbles' water bucket 3 inches"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Mode</Label>
                    <Select value={formStartMode} onValueChange={(v) => setFormStartMode(v as BubblesMode)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {modeEmojis[mode]} {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Mode</Label>
                    <Select value={formEndMode} onValueChange={(v) => setFormEndMode(v as BubblesMode)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {modeEmojis[mode]} {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Beats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Story Beats</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBeat}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Beat
                    </Button>
                  </div>
                  {formBeats.map((beat, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Select 
                          value={beat.mode} 
                          onValueChange={(v) => updateBeat(index, 'mode', v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MODES.map((mode) => (
                              <SelectItem key={mode} value={mode}>
                                {modeEmojis[mode]} {mode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Thought at this beat..."
                          value={beat.thought}
                          onChange={(e) => updateBeat(index, 'thought', e.target.value)}
                        />
                      </div>
                      {formBeats.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeBeat(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingScenario ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Scenarios List */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {scenarios.map((scenario) => {
              const beats = (scenario.beats as unknown as Beat[]) || [];
              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm">
                        <Badge variant="outline">
                          {modeEmojis[scenario.start_mode]} {scenario.start_mode}
                        </Badge>
                        <ArrowRight className="h-3 w-3" />
                        <Badge variant="outline">
                          {modeEmojis[scenario.end_mode]} {scenario.end_mode}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {scenario.trigger_category && (
                      <Badge variant="secondary" className="mb-3">
                        Trigger: {scenario.trigger_category}
                      </Badge>
                    )}
                    <div className="space-y-2">
                      {beats.map((beat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0">{modeEmojis[beat.mode]}</span>
                          <span className="text-muted-foreground italic">"{beat.thought}"</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(scenario)}>
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => handleDelete(scenario.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
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
