import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO } from 'date-fns';
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
  RefreshCw,
  Users,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DateRange } from 'react-day-picker';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GA4SetupGuide } from '@/components/admin/GA4SetupGuide';

interface ShareEventStats {
  content_type: string;
  count: number;
}

interface DailyStats {
  date: string;
  count: number;
}

// Ecommerce metrics from internal tracking
interface EcommerceMetrics {
  impressions: number;
  productViews: number;
  addToCarts: number;
  cartOpens: number;
  checkoutStarts: number;
  clickThroughRate: number;
  addToCartRate: number;
  checkoutRate: number;
}

// GA4 metrics from Google Analytics
interface GA4Metrics {
  sessions: number;
  pageViews: number;
  activeUsers: number;
  newUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  ecommercePurchases: number;
  totalRevenue: number;
  dailyData: Array<{
    date: string;
    sessions: number;
    pageViews: number;
    activeUsers: number;
  }>;
}

interface ProductPerformance {
  name: string;
  impressions: number;
  views: number;
  addToCarts: number;
  clickThroughRate: number;
  conversionRate: number;
}

interface DailyEcommerceData {
  date: string;
  displayDate: string;
  impressions: number;
  productViews: number;
  addToCarts: number;
  cartOpens: number;
  checkoutStarts: number;
  clickThroughRate: number;
  addToCartRate: number;
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
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  
  // GA4 metrics from Google Analytics
  const [ga4Metrics, setGa4Metrics] = useState<GA4Metrics>({
    sessions: 0,
    pageViews: 0,
    activeUsers: 0,
    newUsers: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    ecommercePurchases: 0,
    totalRevenue: 0,
    dailyData: [],
  });
  
  // Ecommerce metrics state - now fetched from database
  const [ecommerceMetrics, setEcommerceMetrics] = useState<EcommerceMetrics>({
    impressions: 0,
    productViews: 0,
    addToCarts: 0,
    cartOpens: 0,
    checkoutStarts: 0,
    clickThroughRate: 0,
    addToCartRate: 0,
    checkoutRate: 0,
  });

  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [dailyEcommerceData, setDailyEcommerceData] = useState<DailyEcommerceData[]>([]);

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
          created_at: string;
        }>;
        
        const impressions = events.filter(e => e.event_type === 'product_impression').length;
        const viewProduct = events.filter(e => e.event_type === 'view_product').length;
        const addToCart = events.filter(e => e.event_type === 'add_to_cart').length;
        const openCart = events.filter(e => e.event_type === 'open_cart').length;
        const beginCheckout = events.filter(e => e.event_type === 'begin_checkout').length;

        setEcommerceMetrics({
          impressions,
          productViews: viewProduct,
          addToCarts: addToCart,
          cartOpens: openCart,
          checkoutStarts: beginCheckout,
          clickThroughRate: impressions > 0 ? (viewProduct / impressions) * 100 : 0,
          addToCartRate: viewProduct > 0 ? (addToCart / viewProduct) * 100 : 0,
          checkoutRate: openCart > 0 ? (beginCheckout / openCart) * 100 : 0,
        });

        // Build daily ecommerce trend data
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const dailyData: DailyEcommerceData[] = days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => {
            const eventDate = format(parseISO(e.created_at), 'yyyy-MM-dd');
            return eventDate === dayStr;
          });
          
          const dayImpressions = dayEvents.filter(e => e.event_type === 'product_impression').length;
          const dayViews = dayEvents.filter(e => e.event_type === 'view_product').length;
          const dayAddToCarts = dayEvents.filter(e => e.event_type === 'add_to_cart').length;
          
          return {
            date: dayStr,
            displayDate: format(day, 'MMM d'),
            impressions: dayImpressions,
            productViews: dayViews,
            addToCarts: dayAddToCarts,
            cartOpens: dayEvents.filter(e => e.event_type === 'open_cart').length,
            checkoutStarts: dayEvents.filter(e => e.event_type === 'begin_checkout').length,
            clickThroughRate: dayImpressions > 0 ? (dayViews / dayImpressions) * 100 : 0,
            addToCartRate: dayViews > 0 ? (dayAddToCarts / dayViews) * 100 : 0,
          };
        });
        
        setDailyEcommerceData(dailyData);

        // Calculate top products with impressions and CTR
        const productStats: Record<string, { impressions: number; views: number; addToCarts: number; title: string }> = {};
        
        events.forEach(e => {
          if (e.product_title) {
            if (!productStats[e.product_title]) {
              productStats[e.product_title] = { impressions: 0, views: 0, addToCarts: 0, title: e.product_title };
            }
            if (e.event_type === 'product_impression') {
              productStats[e.product_title].impressions++;
            } else if (e.event_type === 'view_product') {
              productStats[e.product_title].views++;
            } else if (e.event_type === 'add_to_cart') {
              productStats[e.product_title].addToCarts++;
            }
          }
        });

        const topProductsList = Object.values(productStats)
          .map(p => ({
            name: p.title,
            impressions: p.impressions,
            views: p.views,
            addToCarts: p.addToCarts,
            clickThroughRate: p.impressions > 0 ? (p.views / p.impressions) * 100 : 0,
            conversionRate: p.views > 0 ? (p.addToCarts / p.views) * 100 : 0,
          }))
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, 10);

        setTopProducts(topProductsList);
      } else {
        // Reset metrics if no data
        setEcommerceMetrics({
          impressions: 0,
          productViews: 0,
          addToCarts: 0,
          cartOpens: 0,
          checkoutStarts: 0,
          clickThroughRate: 0,
          addToCartRate: 0,
          checkoutRate: 0,
        });
        setTopProducts([]);
        setDailyEcommerceData([]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch GA4 analytics data
  const fetchGA4Analytics = useCallback(async () => {
    if (!dateRange?.from) return;
    
    setGa4Loading(true);
    setGa4Error(null);
    
    const startDate = format(dateRange.from, 'yyyy-MM-dd');
    const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/ga4-analytics?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = await response.json();
      
      if (!result.success) {
        setGa4Error(result.error || 'Failed to fetch GA4 data');
        return;
      }
      
      const { rows, totals } = result.data;
      
      setGa4Metrics({
        sessions: Math.round(totals.sessions || 0),
        pageViews: Math.round(totals.screenPageViews || 0),
        activeUsers: Math.round(totals.activeUsers || 0),
        newUsers: Math.round(totals.newUsers || 0),
        avgSessionDuration: totals.averageSessionDuration || 0,
        bounceRate: (totals.bounceRate || 0) * 100,
        ecommercePurchases: Math.round(totals.ecommercePurchases || 0),
        totalRevenue: totals.totalRevenue || 0,
        dailyData: rows.map((row: any) => ({
          date: row.date,
          sessions: row.sessions || 0,
          pageViews: row.screenPageViews || 0,
          activeUsers: row.activeUsers || 0,
        })),
      });
    } catch (error) {
      console.error('Error fetching GA4 analytics:', error);
      setGa4Error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setGa4Loading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
    fetchGA4Analytics();
  }, [fetchAnalytics, fetchGA4Analytics]);

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
  const maxProductImpressions = Math.max(...topProducts.map(p => p.impressions), 1);

  // Funnel steps - now includes impressions
  const funnelSteps = [
    { label: 'Impressions', value: ecommerceMetrics.impressions, icon: Eye },
    { label: 'Product Clicks', value: ecommerceMetrics.productViews, icon: TrendingUp },
    { label: 'Add to Cart', value: ecommerceMetrics.addToCarts, icon: ShoppingCart },
    { label: 'Cart Opens', value: ecommerceMetrics.cartOpens, icon: Package },
    { label: 'Begin Checkout', value: ecommerceMetrics.checkoutStarts, icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 id="analytics-overview" className="font-display text-3xl font-bold">Analytics</h1>
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
              onClick={() => { fetchAnalytics(); fetchGA4Analytics(); }}
              disabled={loading || ga4Loading}
            >
              <RefreshCw className={cn("h-4 w-4", (loading || ga4Loading) && "animate-spin")} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ga4" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ga4">
              Google Analytics
              {ga4Error && <Badge variant="destructive" className="ml-2 text-xs">Error</Badge>}
            </TabsTrigger>
            <TabsTrigger value="ecommerce">Ecommerce</TabsTrigger>
            <TabsTrigger value="overview">Engagement</TabsTrigger>
            <TabsTrigger value="shares">Share Events</TabsTrigger>
          </TabsList>

          {/* GA4 Tab */}
          <TabsContent value="ga4" className="space-y-6">
            {ga4Error ? (
              <GA4SetupGuide 
                error={ga4Error} 
                onRetry={fetchGA4Analytics}
                isRetrying={ga4Loading}
              />
            ) : (
              <>
                {/* GA4 Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ga4Loading ? '...' : ga4Metrics.sessions.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total site visits</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ga4Loading ? '...' : ga4Metrics.pageViews.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ga4Metrics.sessions > 0 
                          ? `${(ga4Metrics.pageViews / ga4Metrics.sessions).toFixed(1)} per session`
                          : 'No sessions'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ga4Loading ? '...' : ga4Metrics.activeUsers.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-accent">{ga4Metrics.newUsers.toLocaleString()}</span> new users
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {ga4Loading ? '...' : `${Math.floor(ga4Metrics.avgSessionDuration / 60)}:${String(Math.floor(ga4Metrics.avgSessionDuration % 60)).padStart(2, '0')}`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-accent">{ga4Metrics.bounceRate.toFixed(1)}%</span> bounce rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue & Purchases */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-accent">
                        {ga4Loading ? '...' : `€${ga4Metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {ga4Metrics.ecommercePurchases} purchases
                        {ga4Metrics.ecommercePurchases > 0 && 
                          ` • €${(ga4Metrics.totalRevenue / ga4Metrics.ecommercePurchases).toFixed(2)} avg order`
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Daily Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-1 h-20">
                        {ga4Metrics.dailyData.slice(-14).map((day) => {
                          const maxSessions = Math.max(...ga4Metrics.dailyData.map(d => d.sessions), 1);
                          const height = (day.sessions / maxSessions) * 100;
                          return (
                            <div
                              key={day.date}
                              className="flex-1 bg-accent/80 rounded-t hover:bg-accent transition-colors"
                              style={{ height: `${Math.max(height, 4)}%` }}
                              title={`${day.date}: ${day.sessions} sessions`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Last 14 days</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Ecommerce Tab */}
          <TabsContent value="ecommerce" className="space-y-6">
            {/* CTR Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.impressions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Product card views</p>
                </CardContent>
              </Card>

              <Card className="border-accent/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{ecommerceMetrics.clickThroughRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {ecommerceMetrics.productViews.toLocaleString()} clicks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Add to Cart Rate</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.addToCartRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {ecommerceMetrics.addToCarts.toLocaleString()} add to carts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Checkout Rate</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ecommerceMetrics.checkoutRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {ecommerceMetrics.checkoutStarts.toLocaleString()} checkouts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ecommerceMetrics.impressions > 0 
                      ? ((ecommerceMetrics.checkoutStarts / ecommerceMetrics.impressions) * 100).toFixed(2)
                      : '0.00'}%
                  </div>
                  <p className="text-xs text-muted-foreground">Impression to checkout</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Impressions vs Clicks Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Impressions vs Clicks</CardTitle>
                  <CardDescription>Product impressions and click-through performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyEcommerceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={dailyEcommerceData}>
                        <defs>
                          <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCarts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }} 
                          className="text-muted-foreground"
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          className="text-muted-foreground"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="impressions" 
                          name="Impressions"
                          stroke="hsl(var(--muted-foreground))" 
                          fill="url(#colorImpressions)"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="productViews" 
                          name="Clicks"
                          stroke="hsl(var(--primary))" 
                          fill="url(#colorClicks)"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="addToCarts" 
                          name="Add to Carts"
                          stroke="hsl(var(--accent))" 
                          fill="url(#colorCarts)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily CTR Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Daily Click-Through Rate</CardTitle>
                  <CardDescription>CTR% and Add-to-Cart rate trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyEcommerceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyEcommerceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="clickThroughRate" 
                          name="CTR %"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="addToCartRate" 
                          name="Add to Cart %"
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, fill: 'hsl(var(--accent))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Funnel Trend */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Checkout Trends</CardTitle>
                  <CardDescription>Cart opens and checkout starts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyEcommerceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyEcommerceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="cartOpens" 
                          name="Cart Opens"
                          stroke="hsl(var(--secondary-foreground))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--secondary-foreground))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="checkoutStarts" 
                          name="Checkout Starts"
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from impression to checkout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {funnelSteps.map((step, index) => {
                    const baseValue = ecommerceMetrics.impressions || 1;
                    const percentage = (step.value / baseValue) * 100;
                    const prevValue = index > 0 ? funnelSteps[index - 1].value : step.value;
                    const dropRate = index > 0 && prevValue > 0 ? ((1 - step.value / prevValue) * 100).toFixed(1) : null;
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
                              {dropRate && parseFloat(dropRate) > 0 && (
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
                        <Progress value={Math.min(percentage, 100)} className="h-3" />
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
                          <span>{product.impressions} impressions</span>
                          <span>{product.views} clicks</span>
                          <span>{product.addToCarts} add to carts</span>
                        </div>
                      </div>
                      <div className="text-right min-w-16">
                        <div className="font-bold text-primary">{product.clickThroughRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">CTR</div>
                      </div>
                      <div className="text-right min-w-16">
                        <div className="font-bold text-accent">{product.conversionRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">ATC Rate</div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all"
                            style={{ width: `${(product.impressions / maxProductImpressions) * 100}%` }}
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
