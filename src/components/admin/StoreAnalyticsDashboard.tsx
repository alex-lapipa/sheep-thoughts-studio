import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Package, Truck, CheckCircle, AlertTriangle,
  Clock, ArrowUpRight, ArrowDownRight, PackageX, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreAnalytics {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  fulfillmentStats: Record<string, number>;
  financialStats: Record<string, number>;
}

interface InventoryAlert {
  productId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
}

interface StoreMetrics {
  analytics: StoreAnalytics | null;
  inventoryAlerts: InventoryAlert[];
  productCount: number;
  orderCount: number;
}

export function StoreAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<StoreMetrics>({
    analytics: null,
    inventoryAlerts: [],
    productCount: 0,
    orderCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Fetch analytics and inventory in parallel
      const [analyticsResult, syncResult, inventoryResult] = await Promise.all([
        supabase.functions.invoke('shopify-integrations', { 
          body: { action: 'analytics', days: 30 } 
        }),
        supabase.functions.invoke('shopify-integrations', { 
          body: { action: 'sync_status' } 
        }),
        supabase.functions.invoke('shopify-integrations', { 
          body: { action: 'inventory' } 
        }),
      ]);

      const analytics = analyticsResult.data?.analytics || null;
      const syncStatus = syncResult.data?.syncStatus || {};
      const inventory = inventoryResult.data?.inventory || [];

      // Process inventory for alerts (low stock < 10, out of stock = 0)
      const inventoryAlerts: InventoryAlert[] = inventory
        .filter((item: { available: number }) => item.available <= 10)
        .map((item: { inventory_item_id: number; available: number }) => ({
          productId: String(item.inventory_item_id),
          productTitle: 'Product',
          variantTitle: '',
          sku: '',
          quantity: item.available,
          status: item.available === 0 ? 'out_of_stock' : 'low_stock',
        }))
        .slice(0, 10);

      setMetrics({
        analytics,
        inventoryAlerts,
        productCount: syncStatus.shopify?.productCount || 0,
        orderCount: syncStatus.shopify?.orderCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch store metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Calculate fulfillment rate
  const calculateFulfillmentRate = () => {
    if (!metrics.analytics?.fulfillmentStats) return 0;
    const stats = metrics.analytics.fulfillmentStats;
    const fulfilled = (stats['fulfilled'] || 0);
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    return total > 0 ? Math.round((fulfilled / total) * 100) : 0;
  };

  // Calculate payment success rate
  const calculatePaymentSuccessRate = () => {
    if (!metrics.analytics?.financialStats) return 0;
    const stats = metrics.analytics.financialStats;
    const paid = (stats['paid'] || 0);
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  };

  const fulfillmentRate = calculateFulfillmentRate();
  const paymentSuccessRate = calculatePaymentSuccessRate();
  const outOfStockCount = metrics.inventoryAlerts.filter(a => a.status === 'out_of_stock').length;
  const lowStockCount = metrics.inventoryAlerts.filter(a => a.status === 'low_stock').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Store Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time metrics from your Shopify store
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchMetrics(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-affirmative" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue (30d)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-affirmative" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{metrics.analytics?.totalRevenue?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs bg-affirmative/10 text-affirmative border-affirmative/30">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Live
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {metrics.analytics?.totalOrders || 0} orders
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Order Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Order Value
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{metrics.analytics?.avgOrderValue?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-affirmative" />
                <span>Per transaction</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fulfillment Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              fulfillmentRate >= 80 ? "bg-affirmative" : fulfillmentRate >= 50 ? "bg-warning" : "bg-destructive"
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fulfillment Rate
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fulfillmentRate}%</div>
              <Progress 
                value={fulfillmentRate} 
                className={cn(
                  "h-2 mt-2",
                  fulfillmentRate >= 80 ? "[&>div]:bg-affirmative" : 
                  fulfillmentRate >= 50 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                )} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={cn(
            "relative overflow-hidden",
            (outOfStockCount > 0) && "border-destructive/50"
          )}>
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              outOfStockCount > 0 ? "bg-destructive" : lowStockCount > 0 ? "bg-warning" : "bg-affirmative"
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inventory Alerts
                </CardTitle>
                {outOfStockCount > 0 ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : lowStockCount > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-affirmative" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {outOfStockCount + lowStockCount}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                {outOfStockCount > 0 && (
                  <span className="text-destructive flex items-center gap-1">
                    <PackageX className="h-3 w-3" />
                    {outOfStockCount} out
                  </span>
                )}
                {lowStockCount > 0 && (
                  <span className="text-warning flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {lowStockCount} low
                  </span>
                )}
                {outOfStockCount === 0 && lowStockCount === 0 && (
                  <span className="text-affirmative">All stocked</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Fulfillment Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Fulfillment Status
              </CardTitle>
              <CardDescription>Order fulfillment breakdown (30d)</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.analytics?.fulfillmentStats && Object.keys(metrics.analytics.fulfillmentStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(metrics.analytics.fulfillmentStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                      const total = Object.values(metrics.analytics!.fulfillmentStats).reduce((sum, v) => sum + v, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isFulfilled = status.toLowerCase().includes('fulfilled');
                      const isPartial = status.toLowerCase().includes('partial');
                      
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {isFulfilled ? (
                                <CheckCircle className="h-3 w-3 text-affirmative" />
                              ) : isPartial ? (
                                <Clock className="h-3 w-3 text-warning" />
                              ) : (
                                <Package className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="capitalize">
                                {status.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className={cn(
                              "h-1.5",
                              isFulfilled ? "[&>div]:bg-affirmative" : 
                              isPartial ? "[&>div]:bg-warning" : "[&>div]:bg-muted-foreground"
                            )} 
                          />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No fulfillment data available
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Status
              </CardTitle>
              <CardDescription>Payment breakdown (30d)</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.analytics?.financialStats && Object.keys(metrics.analytics.financialStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(metrics.analytics.financialStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                      const total = Object.values(metrics.analytics!.financialStats).reduce((sum, v) => sum + v, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isPaid = status.toLowerCase().includes('paid');
                      const isPending = status.toLowerCase().includes('pending');
                      const isRefund = status.toLowerCase().includes('refund');
                      
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <CheckCircle className="h-3 w-3 text-affirmative" />
                              ) : isPending ? (
                                <Clock className="h-3 w-3 text-warning" />
                              ) : isRefund ? (
                                <ArrowDownRight className="h-3 w-3 text-destructive" />
                              ) : (
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="capitalize">
                                {status.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className={cn(
                              "h-1.5",
                              isPaid ? "[&>div]:bg-affirmative" : 
                              isPending ? "[&>div]:bg-warning" : 
                              isRefund ? "[&>div]:bg-destructive" : "[&>div]:bg-muted-foreground"
                            )} 
                          />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payment data available
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Items
              </CardTitle>
              <CardDescription>Items needing attention</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.inventoryAlerts.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {metrics.inventoryAlerts.map((alert, index) => (
                    <div 
                      key={`${alert.productId}-${index}`}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-sm",
                        alert.status === 'out_of_stock' ? 'bg-destructive/10' : 'bg-warning/10'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {alert.status === 'out_of_stock' ? (
                          <PackageX className="h-4 w-4 text-destructive" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <span className="truncate max-w-[150px]">
                          Item #{alert.productId.slice(-6)}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          alert.status === 'out_of_stock' 
                            ? 'text-destructive border-destructive/30' 
                            : 'text-warning border-warning/30'
                        )}
                      >
                        {alert.quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-affirmative mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    All products are well-stocked
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-affirmative/10 text-affirmative border-affirmative/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {paymentSuccessRate}% Paid
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  <Package className="h-3 w-3 mr-1" />
                  {metrics.productCount} Products
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  {metrics.orderCount} Total Orders
                </Badge>
              </div>
              {fulfillmentRate >= 90 && (
                <Badge variant="outline" className="bg-affirmative/10 text-affirmative border-affirmative/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  High Performance
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
