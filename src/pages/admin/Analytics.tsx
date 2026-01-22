import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Eye, 
  ShoppingCart, 
  Share2, 
  MessageCircle, 
  Trophy,
  TrendingUp,
  CalendarIcon,
  CreditCard,
  ArrowRight,
  Package,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DateRange } from 'react-day-picker';

interface ShareEventStats {
  content_type: string;
  count: number;
}

interface DailyStats {
  date: string;
  count: number;
}

// Simulated ecommerce metrics (in production, these would come from GA4 or a dedicated analytics table)
interface EcommerceMetrics {
  productViews: number;
  addToCarts: number;
  cartOpens: number;
  checkoutStarts: number;
  // Calculated rates
  addToCartRate: number;
  checkoutRate: number;
}

interface ProductPerformance {
  name: string;
  views: number;
  addToCarts: number;
  conversionRate: number;
}

export default function AdminAnalytics() {
  // Date range state - default to last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [shareStats, setShareStats] = useState<ShareEventStats[]>([]);
  const [totalShares, setTotalShares] = useState(0);
  const [recentShares, setRecentShares] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ecommerce metrics state - now fetched from database
  const [ecommerceMetrics, setEcommerceMetrics] = useState<EcommerceMetrics>({
    productViews: 0,
    addToCarts: 0,
    cartOpens: 0,
    checkoutStarts: 0,
    addToCartRate: 0,
    checkoutRate: 0,
  });

  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);

  const fetchAnalytics = useCallback(async () => {
    if (!dateRange?.from) return;
    
    setLoading(true);
    const startDate = startOfDay(dateRange.from);
    const endDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(new Date());
    
    try {
      // Fetch share events grouped by content type within date range
      const { data: shares, count } = await supabase
        .from('share_events')
        .select('content_type', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (shares) {
        const typeCounts = shares.reduce((acc: Record<string, number>, s) => {
          acc[s.content_type] = (acc[s.content_type] || 0) + 1;
          return acc;
        }, {});

        setShareStats(
          Object.entries(typeCounts)
            .map(([content_type, count]) => ({ content_type, count: count as number }))
            .sort((a, b) => b.count - a.count)
        );
      }

      setTotalShares(count || 0);

      // Fetch shares within date range for daily breakdown
      const { data: recentData } = await supabase
        .from('share_events')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (recentData) {
        const dailyCounts = recentData.reduce((acc: Record<string, number>, s) => {
          const date = new Date(s.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        setRecentShares(
          Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count: count as number }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      }

      // Fetch ecommerce events from database within date range
      const { data: ecommerceEvents } = await supabase
        .from('ecommerce_events' as 'share_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ecommerceEvents && ecommerceEvents.length > 0) {
        // Count events by type
        const events = ecommerceEvents as unknown as Array<{
          event_type: string;
          product_id?: string;
          product_title?: string;
        }>;
        
        const viewProduct = events.filter(e => e.event_type === 'view_product').length;
        const addToCart = events.filter(e => e.event_type === 'add_to_cart').length;
        const openCart = events.filter(e => e.event_type === 'open_cart').length;
        const beginCheckout = events.filter(e => e.event_type === 'begin_checkout').length;

        setEcommerceMetrics({
          productViews: viewProduct,
          addToCarts: addToCart,
          cartOpens: openCart,
          checkoutStarts: beginCheckout,
          addToCartRate: viewProduct > 0 ? (addToCart / viewProduct) * 100 : 0,
          checkoutRate: openCart > 0 ? (beginCheckout / openCart) * 100 : 0,
        });

        // Calculate top products
        const productViews: Record<string, { views: number; addToCarts: number; title: string }> = {};
        
        events.forEach(e => {
          if (e.product_title) {
            if (!productViews[e.product_title]) {
              productViews[e.product_title] = { views: 0, addToCarts: 0, title: e.product_title };
            }
            if (e.event_type === 'view_product') {
              productViews[e.product_title].views++;
            } else if (e.event_type === 'add_to_cart') {
              productViews[e.product_title].addToCarts++;
            }
          }
        });

        const topProductsList = Object.values(productViews)
          .map(p => ({
            name: p.title,
            views: p.views,
            addToCarts: p.addToCarts,
            conversionRate: p.views > 0 ? (p.addToCarts / p.views) * 100 : 0,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopProducts(topProductsList);
      } else {
        // Reset metrics if no data
        setEcommerceMetrics({
          productViews: 0,
          addToCarts: 0,
          cartOpens: 0,
          checkoutStarts: 0,
          addToCartRate: 0,
          checkoutRate: 0,
        });
        setTopProducts([]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Quick date range presets
  const setPreset = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const contentTypeIcons: Record<string, React.ReactNode> = {
    badge: <Trophy className="h-4 w-4" />,
    scenario: <MessageCircle className="h-4 w-4" />,
    thought: <MessageCircle className="h-4 w-4" />,
    product: <ShoppingCart className="h-4 w-4" />,
    page: <Eye className="h-4 w-4" />,
  };

  const contentTypeLabels: Record<string, string> = {
    badge: 'Badge Shares',
    scenario: 'Scenario Shares',
    thought: 'Thought Shares',
    product: 'Product Shares',
    page: 'Page Shares',
  };

  // Calculate max for bar scaling
  const maxShareCount = Math.max(...shareStats.map(s => s.count), 1);
  const maxProductViews = Math.max(...topProducts.map(p => p.views), 1);

  // Funnel steps
  const funnelSteps = [
    { label: 'Product Views', value: ecommerceMetrics.productViews, icon: Eye },
    { label: 'Add to Cart', value: ecommerceMetrics.addToCarts, icon: ShoppingCart },
    { label: 'Cart Opens', value: ecommerceMetrics.cartOpens, icon: Package },
    { label: 'Begin Checkout', value: ecommerceMetrics.checkoutStarts, icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track user engagement, sharing activity, and ecommerce performance
            </p>
          </div>
          
          {/* Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPreset(7)}>7d</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(30)}>30d</Button>
              <Button variant="outline" size="sm" onClick={() => setPreset(90)}>90d</Button>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ecommerce" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ecommerce">Ecommerce</TabsTrigger>
            <TabsTrigger value="overview">Engagement</TabsTrigger>
            <TabsTrigger value="shares">Share Events</TabsTrigger>
          </TabsList>

          {/* Ecommerce Tab */}
          <TabsContent value="ecommerce" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.productViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Selected period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Add to Carts</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.addToCarts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-accent">{ecommerceMetrics.addToCartRate.toFixed(1)}%</span> conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Checkout Starts</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.checkoutStarts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-accent">{ecommerceMetrics.checkoutRate.toFixed(1)}%</span> of cart opens
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((ecommerceMetrics.checkoutStarts / ecommerceMetrics.productViews) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">View to checkout</p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from product view to checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {funnelSteps.map((step, index) => {
                    const percentage = (step.value / ecommerceMetrics.productViews) * 100;
                    const prevValue = index > 0 ? funnelSteps[index - 1].value : step.value;
                    const dropRate = index > 0 ? ((1 - step.value / prevValue) * 100).toFixed(1) : null;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.label}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary">
                              <Icon className="h-4 w-4 text-foreground" />
                            </div>
                            <div>
                              <span className="font-medium">{step.label}</span>
                              {dropRate && (
                                <span className="text-xs text-destructive ml-2">
                                  -{dropRate}% drop
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{step.value.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-3" />
                        {index < funnelSteps.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Products with highest engagement and conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{product.views} views</span>
                          <span>{product.addToCarts} add to carts</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent">{product.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">conversion</div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all"
                            style={{ width: `${(product.views / maxProductViews) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integration Note */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Analytics Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Ecommerce events are tracked via the <code className="text-xs bg-secondary px-1 rounded">analytics</code> utility. 
                      Events include: <code className="text-xs bg-secondary px-1 rounded">view_product</code>, 
                      <code className="text-xs bg-secondary px-1 rounded ml-1">add_to_cart</code>, 
                      <code className="text-xs bg-secondary px-1 rounded ml-1">open_cart</code>, and 
                      <code className="text-xs bg-secondary px-1 rounded ml-1">begin_checkout</code>.
                      Connect Google Analytics 4 to see real-time data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : totalShares}</div>
                  <p className="text-xs text-muted-foreground">All time share events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Content Types</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? '...' : shareStats.length}</div>
                  <p className="text-xs text-muted-foreground">Unique shared content types</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : recentShares.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Recent share events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Top Content</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {loading ? '...' : (shareStats[0]?.content_type || 'N/A')}
                  </div>
                  <p className="text-xs text-muted-foreground">Most shared type</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Share by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Shares by Content Type</CardTitle>
                  <CardDescription>Distribution of share events across content</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : shareStats.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No share events recorded yet</p>
                  ) : (
                    <div className="space-y-4">
                      {shareStats.map(({ content_type, count }) => {
                        const percentage = (count / maxShareCount) * 100;
                        return (
                          <div key={content_type} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                {contentTypeIcons[content_type] || <Share2 className="h-4 w-4" />}
                                <span className="capitalize font-medium">
                                  {contentTypeLabels[content_type] || content_type}
                                </span>
                              </span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent transition-all"
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

              {/* Daily Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Share events over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : recentShares.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No recent share activity</p>
                  ) : (
                    <div className="space-y-3">
                      {recentShares.map(({ date, count }) => (
                        <div key={date} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{date}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-accent rounded-full" style={{ width: `${Math.max(count * 10, 20)}px` }} />
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shares" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Events Details</CardTitle>
                <CardDescription>
                  Tracked via the analytics utility when users share content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Tracked Events</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <code className="text-xs bg-secondary px-1 rounded">view_product</code> — Product detail page views</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">add_to_cart</code> — Add to cart button clicks</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">open_cart</code> — Cart drawer opens</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">begin_checkout</code> — Checkout button clicks</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">share_badge</code> — Badge collection shares</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">share_scenario</code> — Scenario shares</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">ask_bubbles</code> — Questions submitted to Bubbles</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">view_scenario</code> — Scenario page views</li>
                      <li>• <code className="text-xs bg-secondary px-1 rounded">unlock_milestone</code> — Achievement unlocks</li>
                    </ul>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Events are tracked via Google Analytics (if consent given) and stored in the 
                    <code className="text-xs bg-secondary px-1 rounded mx-1">share_events</code> 
                    table for share actions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
