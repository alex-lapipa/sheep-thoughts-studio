import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStoreOpsAgent, type HealthCheck } from '@/hooks/useStoreOpsAgent';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  Clock,
  ShoppingBag,
  Package,
  CreditCard,
  Plug,
  BarChart3,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const CATEGORY_CONFIG: Record<string, { icon: typeof Activity; label: string; color: string }> = {
  storefront_theme: { icon: ShoppingBag, label: 'Storefront & Theme', color: 'text-blue-500' },
  checkout_payments: { icon: CreditCard, label: 'Checkout & Payments', color: 'text-purple-500' },
  catalog_inventory: { icon: Package, label: 'Catalog & Inventory', color: 'text-green-500' },
  orders_fulfillment: { icon: FileText, label: 'Orders & Fulfillment', color: 'text-orange-500' },
  apps_integrations: { icon: Plug, label: 'Apps & Integrations', color: 'text-pink-500' },
  performance_seo: { icon: BarChart3, label: 'Performance & SEO', color: 'text-cyan-500' },
};

const STATUS_CONFIG = {
  ok: { icon: CheckCircle2, color: 'text-affirmative', bg: 'bg-affirmative/10', label: 'Healthy' },
  warn: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: 'Warning' },
  critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critical' },
  unknown: { icon: HelpCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' },
};

function HealthCheckCard({ check }: { check: HealthCheck }) {
  const status = STATUS_CONFIG[check.status] || STATUS_CONFIG.unknown;
  const category = CATEGORY_CONFIG[check.category];
  const Icon = status.icon;
  const CategoryIcon = category?.icon || Activity;

  return (
    <Card className={cn('transition-all', status.bg, 'border-transparent')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-full', status.bg)}>
            <Icon className={cn('h-5 w-5', status.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CategoryIcon className={cn('h-4 w-4', category?.color)} />
              <span className="text-xs text-muted-foreground">{category?.label}</span>
            </div>
            <h4 className="font-medium">{check.check_name}</h4>
            {check.likely_cause && (
              <p className="text-sm text-muted-foreground mt-1">{check.likely_cause}</p>
            )}
            {check.suggested_fix && (
              <p className="text-sm text-primary mt-1">
                💡 {check.suggested_fix}
              </p>
            )}
            {check.requires_approval && (
              <Badge variant="outline" className="mt-2 text-xs">
                Requires Approval
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={cn('shrink-0', status.color)}>
            {status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoreOpsOverview() {
  const {
    isLoading,
    healthChecks,
    snapshots,
    pendingActions,
    runHealthCheck,
    getHealthHistory,
    getSnapshots,
    getPendingActions,
    createSnapshot,
  } = useStoreOpsAgent();

  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await Promise.all([
        getHealthHistory(50),
        getSnapshots(10),
        getPendingActions(),
      ]);
    } catch (error) {
      console.error('Failed to load ops data:', error);
    }
  }

  async function handleRunHealthCheck() {
    try {
      await runHealthCheck();
      setLastCheck(new Date());
      toast.success('Health check completed');
    } catch (error) {
      // Error already handled by hook
    }
  }

  async function handleCreateSnapshot() {
    try {
      await createSnapshot('full');
      toast.success('Store snapshot created');
    } catch (error) {
      // Error already handled by hook
    }
  }

  // Group health checks by category
  const checksByCategory = healthChecks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, HealthCheck[]>);

  // Calculate summary stats
  const stats = {
    total: healthChecks.length,
    ok: healthChecks.filter(c => c.status === 'ok').length,
    warn: healthChecks.filter(c => c.status === 'warn').length,
    critical: healthChecks.filter(c => c.status === 'critical').length,
  };

  const overallStatus = stats.critical > 0 ? 'critical' : stats.warn > 0 ? 'warn' : 'ok';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              BUBBLESHEEP STORE OPS
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor, validate, and optimize bubblesheep.xyz operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateSnapshot} disabled={isLoading}>
              <Camera className="h-4 w-4 mr-2" />
              Snapshot
            </Button>
            <Button onClick={handleRunHealthCheck} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Run Health Check
            </Button>
          </div>
        </div>

        {/* Last check timestamp */}
        {lastCheck && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last check: {formatDistanceToNow(lastCheck, { addSuffix: true })}
          </p>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={cn(STATUS_CONFIG[overallStatus].bg)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className={cn('text-2xl font-bold', STATUS_CONFIG[overallStatus].color)}>
                    {STATUS_CONFIG[overallStatus].label}
                  </p>
                </div>
                {(() => {
                  const Icon = STATUS_CONFIG[overallStatus].icon;
                  return <Icon className={cn('h-10 w-10', STATUS_CONFIG[overallStatus].color)} />;
                })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                  <p className="text-2xl font-bold text-affirmative">{stats.ok}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-affirmative/30" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-warning">{stats.warn}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-warning/30" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <XCircle className="h-10 w-10 text-destructive/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions Alert */}
        {pendingActions.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">
                    {pendingActions.length} action{pendingActions.length > 1 ? 's' : ''} pending approval
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review in the Agent Console tab
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Review Actions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="overview">Health Overview</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
              const checks = checksByCategory[categoryKey] || [];
              if (checks.length === 0) return null;

              return (
                <div key={categoryKey}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <config.icon className={cn('h-5 w-5', config.color)} />
                    {config.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {checks.map((check, i) => (
                      <HealthCheckCard key={check.id || i} check={check} />
                    ))}
                  </div>
                </div>
              );
            })}

            {healthChecks.length === 0 && !isLoading && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No health checks yet</p>
                  <p className="text-sm">Run a health check to see store status</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="snapshots" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Store State Snapshots</CardTitle>
                <CardDescription>
                  Point-in-time captures of store configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {snapshots.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No snapshots yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {snapshots.map((snapshot) => (
                        <Card key={snapshot.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{snapshot.snapshot_type} snapshot</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(snapshot.created_at), 'PPpp')}
                                </p>
                              </div>
                              {snapshot.diff_from_previous && (
                                <Badge variant="outline">
                                  Changes detected
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Configuration Changes</CardTitle>
                <CardDescription>
                  Detected differences between snapshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                {snapshots.filter(s => s.diff_from_previous).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No changes detected</p>
                    <p className="text-sm">Create multiple snapshots to track changes</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    {snapshots
                      .filter(s => s.diff_from_previous)
                      .map((snapshot) => (
                        <div key={snapshot.id} className="mb-4 p-4 border rounded-lg">
                          <p className="font-medium mb-2">
                            {format(new Date(snapshot.created_at), 'PPpp')}
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(snapshot.diff_from_previous, null, 2)}
                          </pre>
                        </div>
                      ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}