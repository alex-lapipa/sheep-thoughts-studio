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
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  TrendingUp, Users, MessageSquare, Clock, RefreshCw, 
  Cloud, Heart, Home, Mountain, Sparkles, Plane, Globe, Wrench, Flower2, Car
} from "lucide-react";

// Mentor definitions with colors
const MENTORS = [
  { id: "anthony", name: "Anthony", role: "Pub Philosopher", color: "#f59e0b", icon: Cloud },
  { id: "peggy", name: "Peggy", role: "Truth-Giver", color: "#f43f5e", icon: Heart },
  { id: "carmel", name: "Carmel", role: "Practical Caretaker", color: "#64748b", icon: Home },
  { id: "jimmy", name: "Jimmy", role: "The Law", color: "#3b82f6", icon: Mountain },
  { id: "aidan", name: "Aidan", role: "Cosmic Philosopher", color: "#8b5cf6", icon: Sparkles },
  { id: "seamus", name: "Seamus", role: "Exotic One", color: "#10b981", icon: Plane },
  { id: "alex", name: "Alex", role: "Language Chaos", color: "#ec4899", icon: Globe },
  { id: "jony", name: "Jony", role: "The Fixer", color: "#06b6d4", icon: Wrench },
  { id: "maureen", name: "Maureen", role: "The Gentle Soul", color: "#ec4899", icon: Flower2 },
  { id: "eddie", name: "Eddie", role: "The Driver", color: "#6366f1", icon: Car },
  { id: "betty", name: "Betty", role: "The Badminton Champion", color: "#84cc16", icon: Heart },
];

const COLORS = MENTORS.map(m => m.color);

interface MentorStats {
  mentor_id: string;
  mentor_name: string;
  trigger_count: number;
  avg_confidence: number;
}

interface DailyTrend {
  date: string;
  total: number;
  [key: string]: string | number;
}

export default function MentorAnalytics() {
  const [dateRange] = useState({ from: subDays(new Date(), 30), to: new Date() });

  // Fetch aggregate mentor stats
  const { data: mentorStats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["mentor-stats", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_trigger_events")
        .select("mentor_id, mentor_name, confidence_score")
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString());

      if (error) throw error;

      // Aggregate by mentor
      const stats: Record<string, MentorStats> = {};
      (data || []).forEach((event) => {
        if (!stats[event.mentor_id]) {
          stats[event.mentor_id] = {
            mentor_id: event.mentor_id,
            mentor_name: event.mentor_name,
            trigger_count: 0,
            avg_confidence: 0,
          };
        }
        stats[event.mentor_id].trigger_count++;
        stats[event.mentor_id].avg_confidence += Number(event.confidence_score) || 0;
      });

      // Calculate averages
      Object.values(stats).forEach((s) => {
        s.avg_confidence = s.trigger_count > 0 ? s.avg_confidence / s.trigger_count : 0;
      });

      return Object.values(stats).sort((a, b) => b.trigger_count - a.trigger_count);
    },
  });

  // Fetch daily trends
  const { data: dailyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["mentor-trends", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_trigger_events")
        .select("mentor_id, created_at")
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const byDay: Record<string, DailyTrend> = {};
      (data || []).forEach((event) => {
        const day = format(new Date(event.created_at), "MMM dd");
        if (!byDay[day]) {
          byDay[day] = { date: day, total: 0 };
          MENTORS.forEach(m => { byDay[day][m.id] = 0; });
        }
        byDay[day].total++;
        byDay[day][event.mentor_id] = (byDay[day][event.mentor_id] as number || 0) + 1;
      });

      return Object.values(byDay);
    },
  });

  // Fetch recent events
  const { data: recentEvents } = useQuery({
    queryKey: ["mentor-recent-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_trigger_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalTriggers = mentorStats?.reduce((sum, s) => sum + s.trigger_count, 0) || 0;
  const uniqueMentorsTriggered = mentorStats?.length || 0;

  // Prepare pie chart data
  const pieData = mentorStats?.map((s) => ({
    name: s.mentor_name,
    value: s.trigger_count,
    color: MENTORS.find(m => m.id === s.mentor_id)?.color || "#888",
  })) || [];

  const isLoading = statsLoading || trendsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mentor Analytics</h1>
            <p className="text-muted-foreground">
              Track which mentors are triggered during conversations
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTriggers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueMentorsTriggered} / 7</div>
              <p className="text-xs text-muted-foreground">Mentors with activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Mentor</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mentorStats?.[0]?.mentor_name || "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {mentorStats?.[0]?.trigger_count || 0} triggers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyTrends?.length ? Math.round(totalTriggers / dailyTrends.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Triggers per day</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Daily Trends</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Triggers by Mentor</CardTitle>
                  <CardDescription>Total trigger count per mentor</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mentorStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="mentor_name" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="trigger_count" fill="hsl(var(--primary))">
                          {mentorStats?.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={MENTORS.find(m => m.id === entry.mentor_id)?.color || "#888"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution</CardTitle>
                  <CardDescription>Mentor trigger share percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mentor Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Mentor Leaderboard</CardTitle>
                <CardDescription>All mentors ranked by trigger frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {MENTORS.map((mentor) => {
                    const stats = mentorStats?.find(s => s.mentor_id === mentor.id);
                    const Icon = mentor.icon;
                    const percentage = totalTriggers > 0 
                      ? ((stats?.trigger_count || 0) / totalTriggers * 100).toFixed(1)
                      : "0";

                    return (
                      <div
                        key={mentor.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: mentor.color, borderLeftWidth: 4 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="p-2 rounded-full"
                            style={{ backgroundColor: `${mentor.color}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: mentor.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-xs text-muted-foreground">{mentor.role}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold">
                            {stats?.trigger_count || 0}
                          </span>
                          <Badge variant="secondary">{percentage}%</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Daily Trigger Trends</CardTitle>
                <CardDescription>Mentor triggers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : dailyTrends && dailyTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {MENTORS.map((mentor) => (
                        <Line
                          key={mentor.id}
                          type="monotone"
                          dataKey={mentor.id}
                          name={mentor.name}
                          stroke={mentor.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
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

          {/* Recent Activity Tab */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Triggers</CardTitle>
                <CardDescription>Latest mentor trigger events</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvents && recentEvents.length > 0 ? (
                  <div className="space-y-3">
                    {recentEvents.map((event) => {
                      const mentor = MENTORS.find(m => m.id === event.mentor_id);
                      const Icon = mentor?.icon || MessageSquare;

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                        >
                          <div
                            className="p-2 rounded-full"
                            style={{ backgroundColor: `${mentor?.color || "#888"}20` }}
                          >
                            <Icon 
                              className="h-4 w-4" 
                              style={{ color: mentor?.color || "#888" }} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{event.mentor_name}</p>
                            {event.trigger_words && event.trigger_words.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {event.trigger_words.slice(0, 5).map((word: string) => (
                                  <Badge key={word} variant="outline" className="text-xs">
                                    {word}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {format(new Date(event.created_at), "MMM dd, HH:mm")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent trigger events
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
