import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Target, Plus, Trophy, Sparkles, Calendar, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays, addMonths, addQuarters, addYears } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface Milestone {
  percentage: number;
  label: string;
  emoji: string;
  celebrated?: boolean;
}

interface RevenueGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  milestones: Milestone[];
  achieved_milestones: Milestone[];
  metadata: Record<string, unknown>;
  created_at: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { percentage: 25, label: "Quarter Way!", emoji: "🌱" },
  { percentage: 50, label: "Halfway Hero!", emoji: "🔥" },
  { percentage: 75, label: "Almost There!", emoji: "⭐" },
  { percentage: 100, label: "Goal Achieved!", emoji: "🏆" },
  { percentage: 125, label: "Overachiever!", emoji: "🚀" },
];

const fireMilestoneConfetti = (milestone: Milestone) => {
  const colors = milestone.percentage >= 100 
    ? ["#FFD700", "#FFA500", "#FFFF00", "#FFE4B5"]
    : ["#4ade80", "#60a5fa", "#f472b6", "#facc15", "#a78bfa"];

  // Big center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors,
    startVelocity: 30,
    gravity: 0.8,
  });

  // Side bursts
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });
  }, 200);
};

export function RevenueGoalTracker() {
  const [goals, setGoals] = useState<RevenueGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RevenueGoal | null>(null);
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    period_type: "monthly",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
  });

  const fetchGoals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("revenue_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type-safe parsing of JSONB fields
      const parsedGoals = (data || []).map(goal => ({
        ...goal,
        milestones: Array.isArray(goal.milestones) ? goal.milestones as unknown as Milestone[] : DEFAULT_MILESTONES,
        achieved_milestones: Array.isArray(goal.achieved_milestones) ? goal.achieved_milestones as unknown as Milestone[] : [],
        metadata: typeof goal.metadata === "object" && goal.metadata !== null ? goal.metadata as Record<string, unknown> : {},
      }));
      
      setGoals(parsedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load revenue goals");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch revenue data to update goal progress
  const updateGoalProgress = useCallback(async () => {
    const activeGoals = goals.filter(g => g.status === "active");
    if (activeGoals.length === 0) return;

    for (const goal of activeGoals) {
      try {
        // Get purchase events within the goal period
        const { data: events } = await supabase
          .from("ecommerce_events")
          .select("price, quantity")
          .eq("event_type", "purchase_complete")
          .gte("created_at", goal.start_date)
          .lte("created_at", goal.end_date);

        const totalRevenue = (events || []).reduce(
          (sum, e) => sum + ((e.price || 0) * (e.quantity || 1)), 
          0
        );

        // Only update if changed
        if (Math.abs(totalRevenue - goal.current_amount) > 0.01) {
          await supabase
            .from("revenue_goals")
            .update({ current_amount: totalRevenue })
            .eq("id", goal.id);

          // Check for new milestones
          const progress = (totalRevenue / goal.target_amount) * 100;
          const milestones = goal.milestones || DEFAULT_MILESTONES;
          
          for (const milestone of milestones) {
            const milestoneKey = `${goal.id}-${milestone.percentage}`;
            if (progress >= milestone.percentage && !celebratedMilestones.has(milestoneKey)) {
              // Celebrate!
              setCelebratedMilestones(prev => new Set([...prev, milestoneKey]));
              fireMilestoneConfetti(milestone);
              toast.success(
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{milestone.emoji}</span>
                  <div>
                    <div className="font-bold">{milestone.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {goal.name}: {progress.toFixed(0)}% of €{goal.target_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );

              // Record the achievement
              const newAchieved = [...(goal.achieved_milestones || []), { ...milestone, celebrated: true }];
              await supabase
                .from("revenue_goals")
                .update({ achieved_milestones: newAchieved as unknown as Json[] })
                .eq("id", goal.id);
            }
          }
        }
      } catch (error) {
        console.error("Error updating goal progress:", error);
      }
    }
    
    fetchGoals();
  }, [goals, celebratedMilestones, fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    if (goals.length > 0) {
      updateGoalProgress();
    }
  }, [goals.length]); // Only run when goals count changes

  const getEndDate = (startDate: string, periodType: string): string => {
    const start = new Date(startDate);
    switch (periodType) {
      case "daily": return format(addDays(start, 1), "yyyy-MM-dd");
      case "weekly": return format(addDays(start, 7), "yyyy-MM-dd");
      case "monthly": return format(addMonths(start, 1), "yyyy-MM-dd");
      case "quarterly": return format(addQuarters(start, 1), "yyyy-MM-dd");
      case "yearly": return format(addYears(start, 1), "yyyy-MM-dd");
      default: return formData.end_date;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.target_amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const endDate = formData.period_type === "custom" 
      ? formData.end_date 
      : getEndDate(formData.start_date, formData.period_type);

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from("revenue_goals")
          .update({
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            period_type: formData.period_type,
            start_date: formData.start_date,
            end_date: endDate,
          })
          .eq("id", editingGoal.id);

        if (error) throw error;
        toast.success("Goal updated successfully");
      } else {
        const { error } = await supabase
          .from("revenue_goals")
          .insert([{
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            period_type: formData.period_type,
            start_date: formData.start_date,
            end_date: endDate,
            milestones: DEFAULT_MILESTONES as unknown as Json,
          }]);

        if (error) throw error;
        toast.success("Goal created successfully! 🎯");
      }

      setDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        name: "",
        target_amount: "",
        period_type: "monthly",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
      });
      fetchGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("revenue_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      toast.success("Goal deleted");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleEdit = (goal: RevenueGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      period_type: goal.period_type,
      start_date: goal.start_date,
      end_date: goal.end_date,
    });
    setDialogOpen(true);
  };

  const activeGoals = goals.filter(g => g.status === "active");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue Goals</CardTitle>
              <CardDescription>Track progress toward your revenue targets</CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create Revenue Goal"}</DialogTitle>
                <DialogDescription>
                  Set a target and track your progress with milestone celebrations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Q1 2026 Revenue"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount (€)</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="10000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Period Type</Label>
                    <Select
                      value={formData.period_type}
                      onValueChange={(value) => setFormData({ ...formData, period_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                </div>
                {formData.period_type === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingGoal ? "Update" : "Create"} Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading goals...</p>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No active goals</p>
            <p className="text-sm">Create a revenue goal to start tracking</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 150);
              const daysLeft = differenceInDays(new Date(goal.end_date), new Date());
              const isOverdue = daysLeft < 0;
              const milestones = goal.milestones || DEFAULT_MILESTONES;
              const nextMilestone = milestones.find(m => m.percentage > progress);

              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{goal.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {goal.period_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isOverdue ? "Ended" : `${daysLeft} days left`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar with milestones */}
                  <div className="relative">
                    <Progress value={Math.min(progress, 100)} className="h-4" />
                    
                    {/* Milestone markers */}
                    <div className="absolute inset-0 flex items-center pointer-events-none">
                      {milestones.filter(m => m.percentage <= 100).map((milestone) => (
                        <div
                          key={milestone.percentage}
                          className="absolute flex flex-col items-center"
                          style={{ left: `${milestone.percentage}%`, transform: "translateX(-50%)" }}
                        >
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full border-2 transition-all",
                              progress >= milestone.percentage
                                ? "bg-primary border-primary scale-110"
                                : "bg-background border-muted-foreground/50"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          €{goal.current_amount.toLocaleString()}
                        </span>
                        {" / "}€{goal.target_amount.toLocaleString()}
                      </span>
                      <span className={cn(
                        "font-medium",
                        progress >= 100 ? "text-affirmative" : progress >= 75 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Next milestone indicator */}
                    {nextMilestone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        <span>Next: {nextMilestone.emoji} {nextMilestone.percentage}%</span>
                      </div>
                    )}
                    {progress >= 100 && (
                      <div className="flex items-center gap-1 text-affirmative">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">Goal Achieved!</span>
                      </div>
                    )}
                  </div>

                  {/* Achieved milestones */}
                  {goal.achieved_milestones && goal.achieved_milestones.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {goal.achieved_milestones.map((milestone, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs gap-1">
                          <span>{milestone.emoji}</span>
                          <span>{milestone.label}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
