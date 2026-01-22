import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Eye, 
  ShoppingCart, 
  Share2, 
  MessageCircle, 
  Trophy,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShareEventStats {
  content_type: string;
  count: number;
}

interface DailyStats {
  date: string;
  count: number;
}

export default function AdminAnalytics() {
  const [shareStats, setShareStats] = useState<ShareEventStats[]>([]);
  const [totalShares, setTotalShares] = useState(0);
  const [recentShares, setRecentShares] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch share events grouped by content type
        const { data: shares, count } = await supabase
          .from('share_events')
          .select('content_type', { count: 'exact' });

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

        // Fetch shares from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentData } = await supabase
          .from('share_events')
          .select('created_at')
          .gte('created_at', sevenDaysAgo.toISOString());

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
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track user engagement and sharing activity
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shares">Share Events</TabsTrigger>
          </TabsList>

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
