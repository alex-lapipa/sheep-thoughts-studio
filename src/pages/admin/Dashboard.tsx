import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, Zap, Target, BookOpen, Eye, MousePointerClick, ShoppingCart, CreditCard, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { ShoppingHeatmap } from '@/components/admin/ShoppingHeatmap';

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

interface FunnelMetrics {
  impressions: number;
  productViews: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
}

interface PeriodComparison {
  current: FunnelMetrics;
  previous: FunnelMetrics;
  changes: {
    impressions: number;
    productViews: number;
    addToCarts: number;
    checkouts: number;
    purchases: number;
    viewToCartRate: number;
    cartToCheckoutRate: number;
    checkoutToPurchaseRate: number;
  };
}

function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function ChangeIndicator({ change, suffix = '' }: { change: number; suffix?: string }) {
  if (Math.abs(change) < 0.1) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>No change</span>
      </span>
    );
  }
  
  const isPositive = change > 0;
  return (
    <span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-affirmative' : 'text-destructive'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{isPositive ? '+' : ''}{change.toFixed(1)}%{suffix}</span>
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ thoughts: 0, scenarios: 0, triggers: 0, knowledge: 0 });
  const [modeStats, setModeStats] = useState<ModeStats[]>([]);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [funnelLoading, setFunnelLoading] = useState(true);

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

    async function fetchFunnelMetrics() {
      try {
        const now = new Date();
        const periodDays = 30;
        
        // Current period: last 30 days
        const currentStart = startOfDay(subDays(now, periodDays));
        const currentEnd = endOfDay(now);
        
        // Previous period: 30 days before that
        const previousStart = startOfDay(subDays(now, periodDays * 2));
        const previousEnd = endOfDay(subDays(now, periodDays + 1));

        const [currentData, previousData] = await Promise.all([
          supabase
            .from('ecommerce_events' as 'share_events')
            .select('*')
            .gte('created_at', currentStart.toISOString())
            .lte('created_at', currentEnd.toISOString()),
          supabase
            .from('ecommerce_events' as 'share_events')
            .select('*')
            .gte('created_at', previousStart.toISOString())
            .lte('created_at', previousEnd.toISOString()),
        ]);

        const processEvents = (events: unknown[] | null): FunnelMetrics => {
          if (!events) return { impressions: 0, productViews: 0, addToCarts: 0, checkouts: 0, purchases: 0 };
          const typedEvents = events as Array<{ event_type: string }>;
          return {
            impressions: typedEvents.filter(e => e.event_type === 'product_impression').length,
            productViews: typedEvents.filter(e => e.event_type === 'view_product').length,
            addToCarts: typedEvents.filter(e => e.event_type === 'add_to_cart').length,
            checkouts: typedEvents.filter(e => e.event_type === 'begin_checkout').length,
            purchases: typedEvents.filter(e => e.event_type === 'purchase_complete').length,
          };
        };

        const current = processEvents(currentData.data);
        const previous = processEvents(previousData.data);

        // Calculate rate changes
        const currentViewToCart = current.productViews > 0 ? (current.addToCarts / current.productViews) * 100 : 0;
        const previousViewToCart = previous.productViews > 0 ? (previous.addToCarts / previous.productViews) * 100 : 0;
        
        const currentCartToCheckout = current.addToCarts > 0 ? (current.checkouts / current.addToCarts) * 100 : 0;
        const previousCartToCheckout = previous.addToCarts > 0 ? (previous.checkouts / previous.addToCarts) * 100 : 0;
        
        const currentCheckoutToPurchase = current.checkouts > 0 ? (current.purchases / current.checkouts) * 100 : 0;
        const previousCheckoutToPurchase = previous.checkouts > 0 ? (previous.purchases / previous.checkouts) * 100 : 0;

        setPeriodComparison({
          current,
          previous,
          changes: {
            impressions: calculatePercentChange(current.impressions, previous.impressions),
            productViews: calculatePercentChange(current.productViews, previous.productViews),
            addToCarts: calculatePercentChange(current.addToCarts, previous.addToCarts),
            checkouts: calculatePercentChange(current.checkouts, previous.checkouts),
            purchases: calculatePercentChange(current.purchases, previous.purchases),
            viewToCartRate: currentViewToCart - previousViewToCart,
            cartToCheckoutRate: currentCartToCheckout - previousCartToCheckout,
            checkoutToPurchaseRate: currentCheckoutToPurchase - previousCheckoutToPurchase,
          },
        });
      } catch (error) {
        console.error('Error fetching funnel metrics:', error);
      } finally {
        setFunnelLoading(false);
      }
    }

    fetchStats();
    fetchFunnelMetrics();
  }, []);

  const modeColors: Record<string, string> = {
    innocent: 'bg-green-500',
    concerned: 'bg-yellow-500',
    triggered: 'bg-orange-500',
    savage: 'bg-red-500',
    nuclear: 'bg-purple-500',
  };

  const modeLabels: Record<string, string> = {
    innocent: 'Innocent',
    concerned: 'Concerned',
    triggered: 'Triggered',
    savage: 'Savage',
    nuclear: 'Nuclear',
  };

  const funnelMetrics = periodComparison?.current || { impressions: 0, productViews: 0, addToCarts: 0, checkouts: 0, purchases: 0 };
  const changes = periodComparison?.changes;

  // Calculate conversion rates
  const viewToCartRate = funnelMetrics.productViews > 0 
    ? (funnelMetrics.addToCarts / funnelMetrics.productViews) * 100 
    : 0;
  const cartToCheckoutRate = funnelMetrics.addToCarts > 0 
    ? (funnelMetrics.checkouts / funnelMetrics.addToCarts) * 100 
    : 0;
  const checkoutToPurchaseRate = funnelMetrics.checkouts > 0 
    ? (funnelMetrics.purchases / funnelMetrics.checkouts) * 100 
    : 0;
  const overallConversionRate = funnelMetrics.impressions > 0 
    ? (funnelMetrics.purchases / funnelMetrics.impressions) * 100 
    : 0;

  const funnelSteps = [
    { 
      label: 'Impressions', 
      value: funnelMetrics.impressions, 
      icon: Eye,
      color: 'bg-muted-foreground',
      change: changes?.impressions,
    },
    { 
      label: 'Product Views', 
      value: funnelMetrics.productViews, 
      icon: MousePointerClick,
      color: 'bg-primary',
      rate: funnelMetrics.impressions > 0 ? (funnelMetrics.productViews / funnelMetrics.impressions) * 100 : 0,
      change: changes?.productViews,
    },
    { 
      label: 'Add to Cart', 
      value: funnelMetrics.addToCarts, 
      icon: ShoppingCart,
      color: 'bg-accent',
      rate: viewToCartRate,
      change: changes?.addToCarts,
    },
    { 
      label: 'Checkout', 
      value: funnelMetrics.checkouts, 
      icon: CreditCard,
      color: 'bg-affirmative',
      rate: cartToCheckoutRate,
      change: changes?.checkouts,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 id="dashboard-overview" className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage the Bubbles knowledge base and AI content generation
          </p>
        </div>

        {/* Stats Cards */}
        <h2 id="content-stats" className="sr-only">Content Statistics</h2>
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

        {/* Ecommerce Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle id="conversion-funnel">Ecommerce Conversion Funnel</CardTitle>
            <CardDescription>
              Last 30 days • Overall conversion: {overallConversionRate.toFixed(2)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            {funnelLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-6">
                {/* Visual Funnel */}
                <div className="flex items-center justify-between gap-2">
                  {funnelSteps.map((step, index) => {
                    const maxValue = Math.max(...funnelSteps.map(s => s.value), 1);
                    const widthPercentage = (step.value / maxValue) * 100;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.label} className="flex-1 flex items-center gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{step.label}</span>
                          </div>
                          <div className="h-10 bg-secondary rounded-md overflow-hidden">
                            <div 
                              className={`h-full ${step.color} transition-all flex items-center justify-center`}
                              style={{ width: `${Math.max(widthPercentage, 10)}%` }}
                            >
                              <span className="text-xs font-bold text-white drop-shadow-sm">
                                {step.value.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {step.change !== undefined && (
                            <ChangeIndicator change={step.change} suffix=" vs prev" />
                          )}
                        </div>
                        {index < funnelSteps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Conversion Rate Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-primary">{viewToCartRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">View → Cart</p>
                    {changes && <div className="flex justify-center"><ChangeIndicator change={changes.viewToCartRate} suffix=" pts" /></div>}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-accent">{cartToCheckoutRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Cart → Checkout</p>
                    {changes && <div className="flex justify-center"><ChangeIndicator change={changes.cartToCheckoutRate} suffix=" pts" /></div>}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-affirmative">{checkoutToPurchaseRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Checkout → Purchase</p>
                    {changes && <div className="flex justify-center"><ChangeIndicator change={changes.checkoutToPurchaseRate} suffix=" pts" /></div>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping Activity Heatmap */}
        <ShoppingHeatmap />

        {/* Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle id="mode-distribution">Thoughts by Mode</CardTitle>
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
                          <span className="capitalize font-medium">{modeLabels[mode] || mode}</span>
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
