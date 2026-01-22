import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BubblesBog } from "@/components/BubblesBog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  Star, 
  MessageSquare,
  Filter,
  RotateCcw,
  Save,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  LayoutList,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CHARACTER REVIEW — Design QA for Bubbles Combinations
 * 
 * Allows rating, feedback, and status tracking for each posture × accessory combo.
 */

// CRITICAL: Bubbles is a sheep and must NEVER stand on two legs — all postures are quadrupedal
type Posture = "four-legged" | "seated" | "grazing" | "leaning";
type Accessory = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none";
type Expression = "neutral" | "distant" | "certain" | "waiting";
type Status = "approved" | "review" | "needs-work" | "rejected";

const POSTURES: Posture[] = ["four-legged", "seated", "grazing", "leaning"];
const ACCESSORIES: Accessory[] = ["none", "sunglasses", "cap", "bucket-hat", "headphones", "scarf", "bandana", "flower-crown"];
const EXPRESSIONS: Expression[] = ["neutral", "distant", "certain", "waiting"];
const STATUSES: Status[] = ["approved", "review", "needs-work", "rejected"];

const DESIGN_ISSUES = [
  "Proportions off",
  "Accessory clipping",
  "Expression unclear",
  "Posture unnatural",
  "Color inconsistency",
  "Missing detail",
  "Animation glitch",
  "Weathering issue",
];

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof Check; color: string; bg: string }> = {
  approved: { label: "Approved", icon: Check, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  review: { label: "In Review", icon: Eye, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
  "needs-work": { label: "Needs Work", icon: AlertTriangle, color: "text-warning dark:text-warning", bg: "bg-warning/20 dark:bg-warning/10" },
  rejected: { label: "Rejected", icon: X, color: "text-destructive dark:text-destructive", bg: "bg-destructive/20 dark:bg-destructive/10" },
};

interface CombinationFeedback {
  id?: string;
  posture: string;
  accessory: string;
  expression: string;
  status: Status;
  rating: number | null;
  notes: string | null;
  design_issues: string[] | null;
  priority: number;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function CharacterReview() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Record<string, CombinationFeedback>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [postureFilter, setPostureFilter] = useState<Posture | "all">("all");
  const [accessoryFilter, setAccessoryFilter] = useState<Accessory | "all">("all");
  const [expressionFilter, setExpressionFilter] = useState<Expression>("neutral");
  
  // View options
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const [animated, setAnimated] = useState(true);
  const [weathered, setWeathered] = useState(true);
  
  // Detail view
  const [selectedCombo, setSelectedCombo] = useState<{ posture: Posture; accessory: Accessory } | null>(null);
  const [detailIndex, setDetailIndex] = useState(0);

  // Generate all combinations
  const allCombinations = useMemo(() => 
    POSTURES.flatMap(posture => 
      ACCESSORIES.map(accessory => ({ posture, accessory }))
    ), []
  );

  // Filtered combinations
  const filteredCombinations = useMemo(() => 
    allCombinations.filter(({ posture, accessory }) => {
      if (postureFilter !== "all" && posture !== postureFilter) return false;
      if (accessoryFilter !== "all" && accessory !== accessoryFilter) return false;
      
      const key = `${posture}-${accessory}-${expressionFilter}`;
      const fb = feedback[key];
      if (statusFilter !== "all" && (!fb || fb.status !== statusFilter)) return false;
      
      return true;
    }), [allCombinations, postureFilter, accessoryFilter, statusFilter, expressionFilter, feedback]
  );

  // Fetch existing feedback
  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("character_combination_feedback")
      .select("*");
    
    if (!error && data) {
      const feedbackMap: Record<string, CombinationFeedback> = {};
      data.forEach((item) => {
        const key = `${item.posture}-${item.accessory}-${item.expression}`;
        feedbackMap[key] = {
          ...item,
          status: item.status as Status,
        };
      });
      setFeedback(feedbackMap);
    }
    setLoading(false);
  };

  const getKey = (posture: string, accessory: string) => 
    `${posture}-${accessory}-${expressionFilter}`;

  const getFeedback = (posture: string, accessory: string): CombinationFeedback => {
    const key = getKey(posture, accessory);
    return feedback[key] || {
      posture,
      accessory,
      expression: expressionFilter,
      status: "review" as Status,
      rating: null,
      notes: null,
      design_issues: null,
      priority: 0,
      reviewed_by: null,
      reviewed_at: null,
    };
  };

  const updateFeedback = async (
    posture: string, 
    accessory: string, 
    updates: Partial<CombinationFeedback>
  ) => {
    const key = getKey(posture, accessory);
    const existing = feedback[key];
    
    const newFeedback: CombinationFeedback = {
      ...getFeedback(posture, accessory),
      ...updates,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
    };

    // Optimistic update
    setFeedback(prev => ({ ...prev, [key]: newFeedback }));

    try {
      if (existing?.id) {
        const { error } = await supabase
          .from("character_combination_feedback")
          .update({
            status: newFeedback.status,
            rating: newFeedback.rating,
            notes: newFeedback.notes,
            design_issues: newFeedback.design_issues,
            priority: newFeedback.priority,
            reviewed_by: newFeedback.reviewed_by,
            reviewed_at: newFeedback.reviewed_at,
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("character_combination_feedback")
          .insert({
            posture: newFeedback.posture,
            accessory: newFeedback.accessory,
            expression: newFeedback.expression,
            status: newFeedback.status,
            rating: newFeedback.rating,
            notes: newFeedback.notes,
            design_issues: newFeedback.design_issues,
            priority: newFeedback.priority,
            reviewed_by: newFeedback.reviewed_by,
            reviewed_at: newFeedback.reviewed_at,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setFeedback(prev => ({ ...prev, [key]: { ...data, status: data.status as Status } }));
        }
      }
      
      toast.success("Feedback saved");
    } catch (error) {
      toast.error("Failed to save feedback");
      // Revert on error
      if (existing) {
        setFeedback(prev => ({ ...prev, [key]: existing }));
      }
    }
  };

  const setQuickStatus = (posture: string, accessory: string, status: Status) => {
    updateFeedback(posture, accessory, { status });
  };

  const setRating = (posture: string, accessory: string, rating: number) => {
    updateFeedback(posture, accessory, { rating });
  };

  // Stats
  const stats = useMemo(() => {
    const total = allCombinations.length;
    const byStatus: Record<Status, number> = { approved: 0, review: 0, "needs-work": 0, rejected: 0 };
    
    allCombinations.forEach(({ posture, accessory }) => {
      const fb = getFeedback(posture, accessory);
      byStatus[fb.status]++;
    });
    
    return { total, byStatus };
  }, [allCombinations, feedback, expressionFilter]);

  // Navigate in detail view
  const navigateDetail = (direction: 1 | -1) => {
    const newIndex = detailIndex + direction;
    if (newIndex >= 0 && newIndex < filteredCombinations.length) {
      setDetailIndex(newIndex);
      setSelectedCombo(filteredCombinations[newIndex]);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Sparkles className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Character Review</h1>
            <p className="text-muted-foreground">
              Review and provide feedback on all posture × accessory combinations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchFeedback}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm">
            {stats.total} total combinations
          </Badge>
          {STATUSES.map(status => {
            const config = STATUS_CONFIG[status];
            const count = stats.byStatus[status];
            return (
              <Badge 
                key={status} 
                className={cn("text-sm cursor-pointer", config.bg, config.color)}
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
              >
                <config.icon className="h-3 w-3 mr-1" />
                {count} {config.label}
              </Badge>
            );
          })}
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* View Mode */}
              <div className="space-y-2">
                <Label>View</Label>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "detail")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="grid" className="flex-1">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="detail" className="flex-1">
                      <LayoutList className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Posture Filter */}
              <div className="space-y-2">
                <Label>Posture</Label>
                <Select value={postureFilter} onValueChange={(v) => setPostureFilter(v as Posture | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Postures</SelectItem>
                    {POSTURES.map(p => (
                      <SelectItem key={p} value={p} className="capitalize">{p.replace("-", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accessory Filter */}
              <div className="space-y-2">
                <Label>Accessory</Label>
                <Select value={accessoryFilter} onValueChange={(v) => setAccessoryFilter(v as Accessory | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accessories</SelectItem>
                    {ACCESSORIES.map(a => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a === "none" ? "None" : a.replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expression */}
              <div className="space-y-2">
                <Label>Expression</Label>
                <Select value={expressionFilter} onValueChange={(v) => setExpressionFilter(v as Expression)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPRESSIONS.map(e => (
                      <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="col-span-2 flex gap-6 items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch checked={animated} onCheckedChange={setAnimated} id="animated" />
                  <Label htmlFor="animated">Animated</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={weathered} onCheckedChange={setWeathered} id="weathered" />
                  <Label htmlFor="weathered">Weathered</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCombinations.map(({ posture, accessory }, idx) => {
              const fb = getFeedback(posture, accessory);
              const statusConfig = STATUS_CONFIG[fb.status];
              
              return (
                <motion.div
                  key={`${posture}-${accessory}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Card 
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-lg",
                      "border-2",
                      fb.status === "approved" && "border-emerald-300 dark:border-emerald-700",
                      fb.status === "needs-work" && "border-warning/50 dark:border-warning/30",
                      fb.status === "rejected" && "border-destructive/50 dark:border-destructive/30",
                      fb.status === "review" && "border-transparent"
                    )}
                    onClick={() => {
                      setSelectedCombo({ posture, accessory });
                      setDetailIndex(idx);
                      setViewMode("detail");
                    }}
                  >
                    <CardContent className="p-3">
                      {/* Character */}
                      <div className="bg-gradient-to-b from-secondary/30 to-secondary/10 rounded-lg p-2 mb-2">
                        <BubblesBog
                          size="md"
                          posture={posture}
                          accessory={accessory}
                          expression={expressionFilter}
                          animated={animated}
                          weathered={weathered}
                        />
                      </div>
                      
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {fb.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-3 w-3",
                                  i < fb.rating! ? "fill-primary text-primary" : "text-muted"
                                )} 
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Labels */}
                      <div className="text-center space-y-0.5">
                        <p className="text-xs font-medium capitalize">{posture.replace("-", " ")}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {accessory === "none" ? "No accessory" : accessory.replace("-", " ")}
                        </p>
                      </div>
                      
                      {/* Quick actions */}
                      <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); setQuickStatus(posture, accessory, "approved"); }}
                        >
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); setQuickStatus(posture, accessory, "needs-work"); }}
                        >
                          <AlertTriangle className="h-3 w-3 text-warning" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); setQuickStatus(posture, accessory, "rejected"); }}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detail View */}
        {viewMode === "detail" && selectedCombo && (
          <DetailPanel
            posture={selectedCombo.posture}
            accessory={selectedCombo.accessory}
            expression={expressionFilter}
            feedback={getFeedback(selectedCombo.posture, selectedCombo.accessory)}
            animated={animated}
            weathered={weathered}
            onUpdate={(updates) => updateFeedback(selectedCombo.posture, selectedCombo.accessory, updates)}
            onNavigate={navigateDetail}
            currentIndex={detailIndex}
            totalCount={filteredCombinations.length}
            onClose={() => setViewMode("grid")}
          />
        )}

        {filteredCombinations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No combinations match the current filters</p>
              <Button variant="link" onClick={() => {
                setStatusFilter("all");
                setPostureFilter("all");
                setAccessoryFilter("all");
              }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

// Detail Panel Component
function DetailPanel({
  posture,
  accessory,
  expression,
  feedback,
  animated,
  weathered,
  onUpdate,
  onNavigate,
  currentIndex,
  totalCount,
  onClose,
}: {
  posture: Posture;
  accessory: Accessory;
  expression: Expression;
  feedback: CombinationFeedback;
  animated: boolean;
  weathered: boolean;
  onUpdate: (updates: Partial<CombinationFeedback>) => void;
  onNavigate: (direction: 1 | -1) => void;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(feedback.notes || "");
  const [selectedIssues, setSelectedIssues] = useState<string[]>(feedback.design_issues || []);

  // Sync when feedback changes
  useEffect(() => {
    setNotes(feedback.notes || "");
    setSelectedIssues(feedback.design_issues || []);
  }, [feedback]);

  const toggleIssue = (issue: string) => {
    const newIssues = selectedIssues.includes(issue)
      ? selectedIssues.filter(i => i !== issue)
      : [...selectedIssues, issue];
    setSelectedIssues(newIssues);
    onUpdate({ design_issues: newIssues });
  };

  const saveNotes = () => {
    onUpdate({ notes });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="capitalize">
            {posture.replace("-", " ")} + {accessory === "none" ? "No Accessory" : accessory.replace("-", " ")}
          </CardTitle>
          <CardDescription>
            Expression: {expression} • Combination {currentIndex + 1} of {totalCount}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate(-1)} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate(1)} disabled={currentIndex === totalCount - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Character Preview */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-b from-secondary/30 to-secondary/10 rounded-xl p-6 mb-4">
              <BubblesBog
                size="hero"
                posture={posture}
                accessory={accessory}
                expression={expression}
                animated={animated}
                weathered={weathered}
              />
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-4">
              <Label className="mr-2">Rating:</Label>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onUpdate({ rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star <= (feedback.rating || 0) 
                        ? "fill-primary text-primary" 
                        : "text-muted-foreground hover:text-primary/70"
                    )} 
                  />
                </button>
              ))}
              {feedback.rating && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-xs"
                  onClick={() => onUpdate({ rating: null })}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Feedback Form */}
          <div className="space-y-6">
            {/* Status Buttons */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map(status => {
                  const config = STATUS_CONFIG[status];
                  const isActive = feedback.status === status;
                  return (
                    <Button
                      key={status}
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "justify-start",
                        isActive && config.bg,
                        isActive && config.color
                      )}
                      onClick={() => onUpdate({ status })}
                    >
                      <config.icon className="h-4 w-4 mr-2" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Design Issues */}
            <div className="space-y-2">
              <Label>Design Issues</Label>
              <div className="flex flex-wrap gap-2">
                {DESIGN_ISSUES.map(issue => (
                  <Badge
                    key={issue}
                    variant={selectedIssues.includes(issue) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleIssue(issue)}
                  >
                    {issue}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add detailed feedback, suggestions, or observations..."
                rows={4}
              />
              <Button size="sm" onClick={saveNotes}>
                <Save className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
            </div>

            {/* Meta info */}
            {feedback.reviewed_at && (
              <p className="text-xs text-muted-foreground">
                Last reviewed: {new Date(feedback.reviewed_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}