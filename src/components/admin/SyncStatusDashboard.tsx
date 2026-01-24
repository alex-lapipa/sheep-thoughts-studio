import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, CheckCircle, AlertCircle, Clock, 
  Package, ShoppingCart, Webhook, Database,
  TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SyncStatus, ShopifyAnalytics } from '@/hooks/useShopifyIntegrations';

interface SyncStatusDashboardProps {
  fetchSyncStatus: () => Promise<SyncStatus | null>;
  fetchAnalytics: (days?: number) => Promise<ShopifyAnalytics | null>;
}

export function SyncStatusDashboard({ fetchSyncStatus, fetchAnalytics }: SyncStatusDashboardProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [analytics, setAnalytics] = useState<ShopifyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [statusResult, analyticsResult] = await Promise.all([
        fetchSyncStatus(),
        fetchAnalytics(30),
      ]);
      setSyncStatus(statusResult);
      setAnalytics(analyticsResult);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
      case 'active':
      case 'ok':
        return 'text-affirmative bg-affirmative/10 border-affirmative/30';
      case 'error':
      case 'failed':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'pending':
      case 'syncing':
        return 'text-warning bg-warning/10 border-warning/30';
      default:
        return 'text-muted-foreground bg-muted border-muted';
    }
  };

  const getMappingHealth = () => {
    if (!syncStatus?.mappings) return 0;
    const ok = syncStatus.mappings.byStatus?.ok || 0;
    const total = syncStatus.mappings.total || 1;
    return Math.round((ok / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sync Status</h2>
          <p className="text-sm text-muted-foreground">
            Live data from all connected integrations
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => loadData(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Shopify Connection */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Shopify
              </CardTitle>
              <Badge 
                variant="outline" 
                className={cn("text-xs", syncStatus?.shopify?.connected 
                  ? 'text-affirmative border-affirmative/30' 
                  : 'text-destructive border-destructive/30'
                )}
              >
                {syncStatus?.shopify?.connected ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Disconnected</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus?.shopify?.productCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Products synced
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                {syncStatus?.shopify?.orderCount || 0} orders
              </span>
              <span className="flex items-center gap-1">
                <Webhook className="h-3 w-3" />
                {syncStatus?.shopify?.webhooksActive || 0} hooks
              </span>
            </div>
          </CardContent>
        </Card>

        {/* POD Providers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                POD Providers
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus?.pod?.providers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active providers
            </p>
            <div className="mt-3 space-y-1">
              {syncStatus?.pod?.providers?.slice(0, 3).map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{provider.provider}</span>
                  <Badge variant="outline" className={cn("text-xs py-0", getStatusColor(provider.status))}>
                    {provider.status}
                  </Badge>
                </div>
              ))}
              {(!syncStatus?.pod?.providers || syncStatus.pod.providers.length === 0) && (
                <p className="text-xs text-muted-foreground">No providers connected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Variant Mappings */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mappings Health
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMappingHealth()}%
            </div>
            <Progress value={getMappingHealth()} className="mt-2 h-2" />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-affirmative" />
                <span>{syncStatus?.mappings?.byStatus?.ok || 0} OK</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span>{(syncStatus?.mappings?.byStatus?.unmapped || 0) + (syncStatus?.mappings?.byStatus?.missing_file || 0)} Issues</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue (30d) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue (30d)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-affirmative" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{analytics?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalOrders || 0} orders
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-affirmative" />
              <span className="text-affirmative">
                €{analytics?.avgOrderValue?.toFixed(2) || '0'} avg order
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fulfillment Status */}
        {analytics?.fulfillmentStats && Object.keys(analytics.fulfillmentStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fulfillment Status</CardTitle>
              <CardDescription>Order fulfillment breakdown (30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.fulfillmentStats).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        status.toLowerCase().includes('fulfilled') ? 'bg-affirmative' :
                        status.toLowerCase().includes('partial') ? 'bg-warning' :
                        'bg-muted-foreground'
                      )} />
                      <span className="text-sm capitalize">
                        {status.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Status */}
        {analytics?.financialStats && Object.keys(analytics.financialStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Status</CardTitle>
              <CardDescription>Payment status breakdown (30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.financialStats).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        status.toLowerCase().includes('paid') ? 'bg-affirmative' :
                        status.toLowerCase().includes('pending') ? 'bg-warning' :
                        status.toLowerCase().includes('refund') ? 'bg-destructive' :
                        'bg-muted-foreground'
                      )} />
                      <span className="text-sm capitalize">
                        {status.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Last Updated */}
      {syncStatus?.lastChecked && (
        <p className="text-xs text-muted-foreground text-center">
          Last checked: {format(new Date(syncStatus.lastChecked), 'PPpp')}
        </p>
      )}
    </div>
  );
}
