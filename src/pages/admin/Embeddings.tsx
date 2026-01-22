import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Loader2, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Brain,
  Sparkles,
  Lightbulb,
  Zap,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

interface TableStats {
  name: string;
  displayName: string;
  icon: React.ElementType;
  total: number;
  withEmbeddings: number;
  withoutEmbeddings: number;
  coverage: number;
  lastUpdated: string | null;
}

interface RegenerateResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

const TABLE_CONFIG = [
  { name: 'bubbles_knowledge', displayName: 'Knowledge Base', icon: Brain },
  { name: 'bubbles_thoughts', displayName: 'Thoughts', icon: Lightbulb },
  { name: 'bubbles_triggers', displayName: 'Triggers', icon: Zap },
  { name: 'bubbles_scenarios', displayName: 'Scenarios', icon: BookOpen },
  { name: 'bubbles_rag_content', displayName: 'RAG Content', icon: Sparkles },
];

export default function AdminEmbeddings() {
  const [stats, setStats] = useState<TableStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [batchSize, setBatchSize] = useState<string>('50');
  const [lastResult, setLastResult] = useState<RegenerateResult | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsPromises = TABLE_CONFIG.map(async (table) => {
        // Get total count
        const { count: total, error: totalError } = await supabase
          .from(table.name as any)
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error(`Error fetching ${table.name} total:`, totalError);
          return null;
        }

        // Get count with embeddings
        const { count: withEmbeddings, error: embError } = await supabase
          .from(table.name as any)
          .select('*', { count: 'exact', head: true })
          .not('embedding', 'is', null);

        if (embError) {
          console.error(`Error fetching ${table.name} embeddings:`, embError);
          return null;
        }

        // Get latest update time
        const { data: latestData } = await supabase
          .from(table.name as any)
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1);

        const totalCount = total || 0;
        const embCount = withEmbeddings || 0;
        const latestUpdate = latestData && Array.isArray(latestData) && latestData.length > 0 
          ? (latestData[0] as any).updated_at 
          : null;

        return {
          name: table.name,
          displayName: table.displayName,
          icon: table.icon,
          total: totalCount,
          withEmbeddings: embCount,
          withoutEmbeddings: totalCount - embCount,
          coverage: totalCount > 0 ? (embCount / totalCount) * 100 : 0,
          lastUpdated: latestUpdate,
        } as TableStats;
      });

      const results = await Promise.all(statsPromises);
      setStats(results.filter((s): s is TableStats => s !== null));
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch embedding statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleRegenerate(table: string) {
    setRegenerating(table);
    setLastResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-embeddings', {
        body: { 
          table: table === 'all' ? 'all' : table,
          limit: parseInt(batchSize)
        }
      });

      if (error) throw error;

      setLastResult(data.results);
      
      if (data.results.failed > 0) {
        toast.warning(`Completed with errors: ${data.results.succeeded} succeeded, ${data.results.failed} failed`);
      } else if (data.results.processed === 0) {
        toast.info('No entries needed embedding regeneration');
      } else {
        toast.success(`Successfully regenerated ${data.results.succeeded} embeddings`);
      }

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error regenerating embeddings:', error);
      toast.error('Failed to regenerate embeddings');
    } finally {
      setRegenerating(null);
    }
  }

  const totalStats = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      withEmbeddings: acc.withEmbeddings + s.withEmbeddings,
      withoutEmbeddings: acc.withoutEmbeddings + s.withoutEmbeddings,
    }),
    { total: 0, withEmbeddings: 0, withoutEmbeddings: 0 }
  );

  const overallCoverage = totalStats.total > 0 
    ? (totalStats.withEmbeddings / totalStats.total) * 100 
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Embedding Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and regenerate vector embeddings for semantic search
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Stats
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Entries</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Database className="h-6 w-6 text-muted-foreground" />
                {totalStats.total.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>With Embeddings</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                {totalStats.withEmbeddings.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Missing Embeddings</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <XCircle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                {totalStats.withoutEmbeddings.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Overall Coverage</CardDescription>
              <CardTitle className="text-3xl">
                {overallCoverage.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={overallCoverage} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Regeneration Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Regenerate Embeddings</CardTitle>
            <CardDescription>
              Generate missing embeddings or regenerate all for a specific table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Table</label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    {TABLE_CONFIG.map((table) => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Size</label>
                <Select value={batchSize} onValueChange={setBatchSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => handleRegenerate(selectedTable)}
                disabled={regenerating !== null}
              >
                {regenerating !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Last Run Results</h4>
                <div className="flex gap-4 text-sm">
                  <span>Processed: <strong>{lastResult.processed}</strong></span>
                  <span className="text-primary">Succeeded: <strong>{lastResult.succeeded}</strong></span>
                  <span className="text-destructive">Failed: <strong>{lastResult.failed}</strong></span>
                </div>
                {lastResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Errors:</p>
                    <div className="max-h-32 overflow-y-auto text-xs font-mono bg-background p-2 rounded">
                      {lastResult.errors.map((err, i) => (
                        <div key={i} className="text-destructive">{err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-Table Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage by Table</CardTitle>
            <CardDescription>
              Embedding status for each knowledge table
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">With Embeddings</TableHead>
                    <TableHead className="text-right">Missing</TableHead>
                    <TableHead className="w-48">Coverage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((table) => {
                    const Icon = table.icon;
                    return (
                      <TableRow key={table.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{table.displayName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{table.total}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-primary">{table.withEmbeddings}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {table.withoutEmbeddings > 0 ? (
                            <span className="text-amber-500 dark:text-amber-400 flex items-center justify-end gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {table.withoutEmbeddings}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={table.coverage} className="h-2 flex-1" />
                            <span className="text-sm w-12 text-right">
                              {table.coverage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRegenerate(table.name)}
                            disabled={regenerating !== null || table.withoutEmbeddings === 0}
                          >
                            {regenerating === table.name ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Brain className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-medium mb-1">About Embeddings</h3>
                <p className="text-sm text-muted-foreground">
                  Embeddings are vector representations of text that enable semantic search. 
                  When content is similar in meaning (not just keywords), embeddings help find 
                  relevant matches. Missing embeddings will fall back to text-based search, 
                  which may be less accurate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
