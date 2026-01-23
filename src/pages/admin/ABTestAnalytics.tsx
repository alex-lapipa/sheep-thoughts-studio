import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  FlaskConical, RefreshCw, Eye, ShoppingCart, CreditCard, 
  TrendingUp, TrendingDown, Minus, Users, ArrowRight, ExternalLink
} from "lucide-react";
import { generatePreviewUrl } from "@/contexts/FeatureFlagsContext";
import { StatisticalSignificance } from "@/components/admin/StatisticalSignificance";

interface VariantMetrics {
  variant: string;
  views: number;
  productViews: number;
  addToCarts: number;
  checkouts: number;
  purchases: number;
  viewToProductRate: number;
  productToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
  overallConversion: number;
}

interface DailyTrend {
  date: string;
  simplified_views: number;
  full_views: number;
  simplified_conversions: number;
  full_conversions: number;
}

function ChangeIndicator({ value, suffix = '%' }: { value: number; suffix?: string }) {
  if (Math.abs(value) < 0.1) {
    return <span className="text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" />Same</span>;
  }
  const isPositive = value > 0;
  return (
    <span className={`flex items-center gap-1 ${isPositive ? 'text-affirmative' : 'text-destructive'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  );
}

export default function ABTestAnalytics() {
  const [dateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ["ab-test-metrics", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_test_events")
        .select("*")
        .eq("test_name", "homepage_layout")
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString());

      if (error) throw error;

      // Aggregate by variant
      const byVariant: Record<string, VariantMetrics> = {
        simplified: {
          variant: 'simplified',
          views: 0, productViews: 0, addToCarts: 0, checkouts: 0, purchases: 0,
          viewToProductRate: 0, productToCartRate: 0, cartToCheckoutRate: 0, 
          checkoutToPurchaseRate: 0, overallConversion: 0
        },
        full: {
          variant: 'full',
          views: 0, productViews: 0, addToCarts: 0, checkouts: 0, purchases: 0,
          viewToProductRate: 0, productToCartRate: 0, cartToCheckoutRate: 0,
          checkoutToPurchaseRate: 0, overallConversion: 0
        }
      };

      (data || []).forEach((event) => {
        const v = byVariant[event.variant];
        if (!v) return;

        switch (event.event_type) {
          case 'view': v.views++; break;
          case 'product_view': v.productViews++; break;
          case 'add_to_cart': v.addToCarts++; break;
          case 'checkout_start': v.checkouts++; break;
          case 'purchase': v.purchases++; break;
        }
      });

      // Calculate rates
      Object.values(byVariant).forEach((v) => {
        v.viewToProductRate = v.views > 0 ? (v.productViews / v.views) * 100 : 0;
        v.productToCartRate = v.productViews > 0 ? (v.addToCarts / v.productViews) * 100 : 0;
        v.cartToCheckoutRate = v.addToCarts > 0 ? (v.checkouts / v.addToCarts) * 100 : 0;
        v.checkoutToPurchaseRate = v.checkouts > 0 ? (v.purchases / v.checkouts) * 100 : 0;
        v.overallConversion = v.views > 0 ? (v.purchases / v.views) * 100 : 0;
      });

      return byVariant;
    },
  });

  const { data: dailyTrends } = useQuery({
    queryKey: ["ab-test-trends", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_test_events")
        .select("variant, event_type, created_at")
        .eq("test_name", "homepage_layout")
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const byDay: Record<string, DailyTrend> = {};
      (data || []).forEach((event) => {
        const day = format(new Date(event.created_at), "MMM dd");
        if (!byDay[day]) {
          byDay[day] = { 
            date: day, 
            simplified_views: 0, full_views: 0,
            simplified_conversions: 0, full_conversions: 0
          };
        }
        if (event.event_type === 'view') {
          if (event.variant === 'simplified') byDay[day].simplified_views++;
          else byDay[day].full_views++;
        }
        if (event.event_type === 'purchase') {
          if (event.variant === 'simplified') byDay[day].simplified_conversions++;
          else byDay[day].full_conversions++;
        }
      });

      return Object.values(byDay);
    },
  });

  const simplified = metrics?.simplified;
  const full = metrics?.full;
  const totalViews = (simplified?.views || 0) + (full?.views || 0);

  // Calculate lift (simplified vs full)
  const conversionLift = simplified && full && full.overallConversion > 0
    ? ((simplified.overallConversion - full.overallConversion) / full.overallConversion) * 100
    : 0;

  const funnelComparison = [
    { stage: 'Views', simplified: simplified?.views || 0, full: full?.views || 0 },
    { stage: 'Product Views', simplified: simplified?.productViews || 0, full: full?.productViews || 0 },
    { stage: 'Add to Cart', simplified: simplified?.addToCarts || 0, full: full?.addToCarts || 0 },
    { stage: 'Checkout', simplified: simplified?.checkouts || 0, full: full?.checkouts || 0 },
    { stage: 'Purchase', simplified: simplified?.purchases || 0, full: full?.purchases || 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-accent" />
              A/B Test Analytics
            </h1>
            <p className="text-muted-foreground">
              Compare conversion rates between homepage variants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => window.open(generatePreviewUrl(window.location.origin, { simplifiedHomepage: true }), '_blank')}
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Preview Simplified
            </Button>
            <Button 
              onClick={() => window.open(generatePreviewUrl(window.location.origin, { simplifiedHomepage: false }), '_blank')}
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Preview Full
            </Button>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Simplified Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {simplified?.overallConversion.toFixed(2) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {simplified?.views || 0} sessions • {simplified?.purchases || 0} purchases
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Full Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {full?.overallConversion.toFixed(2) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {full?.views || 0} sessions • {full?.purchases || 0} purchases
              </p>
            </CardContent>
          </Card>

          <Card className={conversionLift > 0 ? "border-affirmative/30 bg-affirmative/5" : conversionLift < 0 ? "border-destructive/30 bg-destructive/5" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conversion Lift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <ChangeIndicator value={conversionLift} />
              </div>
              <p className="text-xs text-muted-foreground">
                Simplified vs Full
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistical Significance Calculator */}
        <StatisticalSignificance
          controlVisitors={full?.views || 0}
          controlConversions={full?.purchases || 0}
          treatmentVisitors={simplified?.views || 0}
          treatmentConversions={simplified?.purchases || 0}
          controlLabel="Full Homepage"
          treatmentLabel="Simplified Homepage"
        />

        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Funnel Comparison</TabsTrigger>
            <TabsTrigger value="rates">Conversion Rates</TabsTrigger>
            <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          </TabsList>

          {/* Funnel Comparison */}
          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Comparison</CardTitle>
                <CardDescription>Side-by-side comparison of each funnel stage</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={funnelComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="simplified" name="Simplified" fill="#3b82f6" />
                      <Bar dataKey="full" name="Full" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Rates */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Stage-by-Stage Conversion Rates</CardTitle>
                <CardDescription>How each variant performs at each funnel transition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: 'View → Product', simplified: simplified?.viewToProductRate, full: full?.viewToProductRate, icon: Eye },
                    { label: 'Product → Cart', simplified: simplified?.productToCartRate, full: full?.productToCartRate, icon: ShoppingCart },
                    { label: 'Cart → Checkout', simplified: simplified?.cartToCheckoutRate, full: full?.cartToCheckoutRate, icon: CreditCard },
                    { label: 'Checkout → Purchase', simplified: simplified?.checkoutToPurchaseRate, full: full?.checkoutToPurchaseRate, icon: TrendingUp },
                  ].map((stage) => {
                    const diff = (stage.simplified || 0) - (stage.full || 0);
                    const Icon = stage.icon;
                    return (
                      <div key={stage.label} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stage.label}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                Simplified
                              </Badge>
                              <span className="font-bold">{(stage.simplified || 0).toFixed(1)}%</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                                Full
                              </Badge>
                              <span className="font-bold">{(stage.full || 0).toFixed(1)}%</span>
                            </div>
                            <div className="ml-auto">
                              <ChangeIndicator value={diff} suffix=" pts" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Trends */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Daily Trends</CardTitle>
                <CardDescription>Views and conversions over time by variant</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyTrends && dailyTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="simplified_views" name="Simplified Views" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="full_views" name="Full Views" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="simplified_conversions" name="Simplified Purchases" stroke="#3b82f6" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="full_conversions" name="Full Purchases" stroke="#f97316" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No trend data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
