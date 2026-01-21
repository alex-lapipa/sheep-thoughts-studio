import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Save, RefreshCw } from 'lucide-react';
import { ThoughtBubble } from '@/components/ThoughtBubble';
import type { Database } from '@/integrations/supabase/types';

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];

const TRIGGER_CATEGORIES = [
  "The Look™",
  "Tone Crime",
  "Object Conspiracy",
  "Imaginary Social Rules",
  "Accidental Symbolism",
  "False Patterns",
  "Silence as Aggression",
];

interface GeneratedThought {
  text: string;
  mode: BubblesMode;
  trigger_category?: string;
}

interface GeneratedScenario {
  title: string;
  description: string;
  trigger_category?: string;
  beats: Array<{ mode: BubblesMode; thought: string; action?: string }>;
}

export default function AdminGenerate() {
  const [type, setType] = useState<'thoughts' | 'scenario' | 'product'>('thoughts');
  const [mode, setMode] = useState<BubblesMode | 'mixed'>('mixed');
  const [count, setCount] = useState(5);
  const [context, setContext] = useState('');
  const [triggerCategory, setTriggerCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedThoughts, setGeneratedThoughts] = useState<GeneratedThought[]>([]);
  const [generatedScenario, setGeneratedScenario] = useState<GeneratedScenario | null>(null);
  const [generatedProduct, setGeneratedProduct] = useState<any>(null);

  async function handleGenerate() {
    setLoading(true);
    setGeneratedThoughts([]);
    setGeneratedScenario(null);
    setGeneratedProduct(null);

    try {
      const { data, error } = await supabase.functions.invoke('bubbles-generate', {
        body: {
          type,
          mode: mode === 'mixed' ? undefined : mode,
          count,
          context: context || undefined,
          triggerCategory: triggerCategory || undefined,
        },
      });

      if (error) throw error;

      if (data.success) {
        if (type === 'thoughts' && data.data.thoughts) {
          setGeneratedThoughts(data.data.thoughts);
          toast.success(`Generated ${data.data.thoughts.length} thoughts!`);
        } else if (type === 'scenario') {
          setGeneratedScenario(data.data);
          toast.success('Scenario generated!');
        } else if (type === 'product') {
          setGeneratedProduct(data.data);
          toast.success('Product copy generated!');
        }
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function saveThought(thought: GeneratedThought) {
    try {
      const { error } = await supabase.from('bubbles_thoughts').insert({
        text: thought.text,
        mode: thought.mode,
        trigger_category: thought.trigger_category || null,
        is_ai_generated: true,
      });

      if (error) throw error;
      toast.success('Thought saved to database!');
      setGeneratedThoughts(prev => prev.filter(t => t.text !== thought.text));
    } catch (error) {
      console.error('Error saving thought:', error);
      toast.error('Failed to save thought');
    }
  }

  async function saveAllThoughts() {
    try {
      const { error } = await supabase.from('bubbles_thoughts').insert(
        generatedThoughts.map(t => ({
          text: t.text,
          mode: t.mode,
          trigger_category: t.trigger_category || null,
          is_ai_generated: true,
        }))
      );

      if (error) throw error;
      toast.success(`Saved ${generatedThoughts.length} thoughts!`);
      setGeneratedThoughts([]);
    } catch (error) {
      console.error('Error saving thoughts:', error);
      toast.error('Failed to save thoughts');
    }
  }

  async function saveScenario() {
    if (!generatedScenario) return;

    try {
      const { error } = await supabase.from('bubbles_scenarios').insert({
        title: generatedScenario.title,
        description: generatedScenario.description,
        trigger_category: generatedScenario.trigger_category || null,
        start_mode: generatedScenario.beats[0]?.mode || 'innocent',
        end_mode: generatedScenario.beats[generatedScenario.beats.length - 1]?.mode || 'savage',
        beats: generatedScenario.beats as any,
      });

      if (error) throw error;
      toast.success('Scenario saved!');
      setGeneratedScenario(null);
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast.error('Failed to save scenario');
    }
  }

  const modeLabels: Record<BubblesMode, string> = {
    innocent: 'Innocent',
    concerned: 'Concerned',
    triggered: 'Triggered',
    savage: 'Savage',
    nuclear: 'Nuclear',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">AI Content Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate new thought bubbles, scenarios, and product copy using Bubbles' AI brain
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Generator Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Generate Content
              </CardTitle>
              <CardDescription>
                Configure what you want Bubbles' AI to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thoughts">Thought Bubbles</SelectItem>
                    <SelectItem value="scenario">Escalation Scenario</SelectItem>
                    <SelectItem value="product">Product Copy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed / All Modes</SelectItem>
                    {MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {modeLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === 'thoughts' && (
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Trigger Category (optional)</Label>
                <Select value={triggerCategory} onValueChange={setTriggerCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any trigger..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {TRIGGER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Context / Inspiration (optional)</Label>
                <Textarea
                  placeholder={type === 'product' ? "t-shirt with Bubbles looking at a cloud" : "Farm life, Monday morning blues, bucket incident..."}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Review and save the AI-generated content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Thoughts Results */}
              {generatedThoughts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{generatedThoughts.length} thoughts</span>
                    <Button size="sm" onClick={saveAllThoughts}>
                      <Save className="h-3 w-3 mr-1" />
                      Save All
                    </Button>
                  </div>
                  {generatedThoughts.map((thought, idx) => (
                    <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {modeLabels[thought.mode]}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => saveThought(thought)}>
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                      <ThoughtBubble mode={thought.mode as any} size="sm">
                        <p className="text-sm">{thought.text}</p>
                      </ThoughtBubble>
                    </div>
                  ))}
                </div>
              )}

              {/* Scenario Results */}
              {generatedScenario && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{generatedScenario.title}</h3>
                    <Button size="sm" onClick={saveScenario}>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{generatedScenario.description}</p>
                  <div className="space-y-2">
                    {generatedScenario.beats.map((beat, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-secondary/50 rounded">
                        <span className="text-xs font-medium text-muted-foreground">[{modeLabels[beat.mode]}]</span>
                        <span className="text-sm italic">"{beat.thought}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Results */}
              {generatedProduct && (
                <div className="space-y-4">
                  <h3 className="font-semibold">{generatedProduct.headline}</h3>
                  <p className="text-sm">{generatedProduct.description}</p>
                  {generatedProduct.bubble_text && (
                    <ThoughtBubble mode={(generatedProduct.mode as any) || 'savage'} size="sm">
                      <p className="text-sm">{generatedProduct.bubble_text}</p>
                    </ThoughtBubble>
                  )}
                  {generatedProduct.tags && (
                    <div className="flex flex-wrap gap-1">
                      {generatedProduct.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!generatedThoughts.length && !generatedScenario && !generatedProduct && !loading && (
                <p className="text-muted-foreground text-center py-8">
                  Configure options and click Generate to create new content
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
