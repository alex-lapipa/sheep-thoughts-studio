import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, Zap, Target, BookOpen } from 'lucide-react';

interface Stats {
  thoughts: number;
  scenarios: number;
  triggers: number;
  knowledge: number;
}

interface ModeStats {
  mode: string;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ thoughts: 0, scenarios: 0, triggers: 0, knowledge: 0 });
  const [modeStats, setModeStats] = useState<ModeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [thoughtsRes, scenariosRes, triggersRes, knowledgeRes] = await Promise.all([
          supabase.from('bubbles_thoughts').select('*', { count: 'exact', head: true }),
          supabase.from('bubbles_scenarios').select('*', { count: 'exact', head: true }),
          supabase.from('bubbles_triggers').select('*', { count: 'exact', head: true }),
          supabase.from('bubbles_knowledge').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          thoughts: thoughtsRes.count || 0,
          scenarios: scenariosRes.count || 0,
          triggers: triggersRes.count || 0,
          knowledge: knowledgeRes.count || 0,
        });

        // Fetch mode distribution
        const { data: thoughts } = await supabase
          .from('bubbles_thoughts')
          .select('mode');

        if (thoughts) {
          const modeCounts = thoughts.reduce((acc: Record<string, number>, t) => {
            acc[t.mode] = (acc[t.mode] || 0) + 1;
            return acc;
          }, {});

          setModeStats(
            Object.entries(modeCounts).map(([mode, count]) => ({ mode, count: count as number }))
          );
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const modeColors: Record<string, string> = {
    innocent: 'bg-green-500',
    concerned: 'bg-yellow-500',
    triggered: 'bg-orange-500',
    savage: 'bg-red-500',
    nuclear: 'bg-purple-500',
  };

  const modeEmojis: Record<string, string> = {
    innocent: '😊',
    concerned: '😐',
    triggered: '😤',
    savage: '😈',
    nuclear: '☢️',
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage the Bubbles knowledge base and AI content generation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Thought Bubbles</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.thoughts}</div>
              <p className="text-xs text-muted-foreground">Curated & AI-generated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Scenarios</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.scenarios}</div>
              <p className="text-xs text-muted-foreground">Escalation stories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Triggers</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.triggers}</div>
              <p className="text-xs text-muted-foreground">Trigger categories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.knowledge}</div>
              <p className="text-xs text-muted-foreground">Character bible entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Thoughts by Mode</CardTitle>
            <CardDescription>Distribution of thought bubbles across personality modes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-4">
                {modeStats.map(({ mode, count }) => {
                  const percentage = stats.thoughts > 0 ? (count / stats.thoughts) * 100 : 0;
                  return (
                    <div key={mode} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{modeEmojis[mode] || '❓'}</span>
                          <span className="capitalize font-medium">{mode}</span>
                        </span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${modeColors[mode] || 'bg-gray-500'} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
