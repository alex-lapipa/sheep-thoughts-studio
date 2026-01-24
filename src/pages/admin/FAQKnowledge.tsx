import { useState, useCallback, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { 
  Sparkles, RefreshCw, Send, MessageCircleQuestion, Loader2, 
  Share2, Check, Calendar, Clock, Flame, Copy, History, Trash2, 
  ChevronDown, ChevronUp, Trophy, RotateCcw, Download, Zap, Star, 
  Tag, X, Plus, CheckSquare, Square, Tags, BarChart3, HelpCircle,
  Database, Brain, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShare } from "@/hooks/useShare";
import { StreakBadges } from "@/components/StreakBadges";
import { analytics } from "@/lib/analytics";

// Milestone definitions
const STREAK_MILESTONES = [
  { days: 3, label: "3-Day Streak!", emoji: "🌱" },
  { days: 7, label: "Week Warrior!", emoji: "🔥" },
  { days: 14, label: "Fortnight of Wisdom!", emoji: "⭐" },
  { days: 30, label: "Monthly Master!", emoji: "🏆" },
  { days: 60, label: "Wisdom Sage!", emoji: "🧙" },
  { days: 100, label: "Century of Wisdom!", emoji: "💯" },
  { days: 365, label: "Year of Enlightenment!", emoji: "🐑" },
];

// Predefined tags for categorizing questions
const PREDEFINED_TAGS = [
  { id: "life", label: "Life Advice", emoji: "🌱", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  { id: "philosophy", label: "Philosophy", emoji: "🧠", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  { id: "science", label: "Science", emoji: "🔬", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  { id: "relationships", label: "Relationships", emoji: "💕", color: "bg-pink-500/20 text-pink-700 dark:text-pink-400" },
  { id: "work", label: "Work & Career", emoji: "💼", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
  { id: "funny", label: "Funny", emoji: "😂", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  { id: "deep", label: "Deep Thoughts", emoji: "🌌", color: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400" },
  { id: "practical", label: "Practical", emoji: "🔧", color: "bg-slate-500/20 text-slate-700 dark:text-slate-400" },
];

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  tags?: string[];
}

export default function FAQKnowledge() {
  const { share, isCopied } = useShare();
  
  // Ask Bubbles state
  const [userQuestion, setUserQuestion] = useState("");
  const [bubblesAnswer, setBubblesAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [answerCopied, setAnswerCopied] = useState(false);
  
  // Question history
  const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Tags
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);
  
  // Wisdom streak
  const [wisdomStreak, setWisdomStreak] = useState(0);
  const [totalWisdoms, setTotalWisdoms] = useState(0);
  
  // RAG sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [ragStats, setRagStats] = useState({ total: 0, withEmbeddings: 0 });
  
  // Load data from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("bubbles-question-history");
    if (storedHistory) {
      try {
        setQuestionHistory(JSON.parse(storedHistory));
      } catch {
        setQuestionHistory([]);
      }
    }
    
    const storedFavorites = localStorage.getItem("bubbles-favorites");
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
    
    // Load wisdom dates for streak
    const storedDates = localStorage.getItem("bubbles-wisdom-dates");
    if (storedDates) {
      try {
        const dates = JSON.parse(storedDates);
        setTotalWisdoms(dates.length);
        // Calculate streak
        const sortedDates = dates
          .map((d: string) => {
            const [year, month, day] = d.split('-').map(Number);
            return new Date(year, month - 1, day);
          })
          .sort((a: Date, b: Date) => b.getTime() - a.getTime());
        
        let streak = 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date(now);
          expectedDate.setDate(expectedDate.getDate() - i);
          const actualDate = sortedDates[i];
          actualDate.setHours(0, 0, 0, 0);
          
          if (actualDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else if (i === 0 && actualDate.getTime() === expectedDate.getTime() - 86400000) {
            continue;
          } else {
            break;
          }
        }
        setWisdomStreak(streak);
      } catch {
        setWisdomStreak(0);
      }
    }
  }, []);
  
  // Fetch RAG stats
  useEffect(() => {
    const fetchRagStats = async () => {
      const { count: total } = await supabase
        .from("bubbles_rag_content")
        .select("*", { count: "exact", head: true });
      
      const { count: withEmbeddings } = await supabase
        .from("bubbles_rag_content")
        .select("*", { count: "exact", head: true })
        .not("embedding", "is", null);
      
      setRagStats({ 
        total: total || 0, 
        withEmbeddings: withEmbeddings || 0 
      });
    };
    fetchRagStats();
  }, []);
  
  // Save to history
  const saveToHistory = useCallback((question: string, answer: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: Date.now(),
    };
    setQuestionHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Ask Bubbles
  const askBubbles = useCallback(async () => {
    if (!userQuestion.trim()) return;
    
    setIsAsking(true);
    setBubblesAnswer(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("bubbles-answer", {
        body: { question: userQuestion }
      });
      
      if (error) throw error;
      
      const answer = data?.answer || "Even my infinite wisdom has limits. Try asking differently!";
      setBubblesAnswer(answer);
      saveToHistory(userQuestion, answer);
      analytics.askQuestion(userQuestion);
      
      // Celebrate with confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (error) {
      console.error("Failed to ask Bubbles:", error);
      toast.error("Bubbles is taking a nap. Try again!");
    } finally {
      setIsAsking(false);
    }
  }, [userQuestion, saveToHistory]);
  
  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id];
      localStorage.setItem("bubbles-favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Toggle tag
  const toggleTag = useCallback((itemId: string, tagId: string) => {
    setQuestionHistory(prev => {
      const updated = prev.map(item => {
        if (item.id !== itemId) return item;
        const currentTags = item.tags || [];
        const newTags = currentTags.includes(tagId)
          ? currentTags.filter(t => t !== tagId)
          : [...currentTags, tagId];
        return { ...item, tags: newTags };
      });
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Delete history item
  const deleteHistoryItem = useCallback((id: string) => {
    setQuestionHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Clear all history
  const clearHistory = useCallback(() => {
    setQuestionHistory([]);
    localStorage.removeItem("bubbles-question-history");
    toast.success("History cleared!");
  }, []);
  
  // Sync to RAG
  const syncToRag = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Get favorite items to sync
      const favoritesToSync = questionHistory.filter(item => favorites.includes(item.id));
      
      if (favoritesToSync.length === 0) {
        toast.info("No favorites to sync. Star some answers first!");
        return;
      }
      
      let synced = 0;
      for (const item of favoritesToSync) {
        const tags = item.tags?.map(t => PREDEFINED_TAGS.find(pt => pt.id === t)?.label).filter(Boolean) || [];
        
        const { error } = await supabase
          .from("bubbles_rag_content")
          .upsert({
            id: `faq-${item.id}`,
            type: "faq",
            title: item.question,
            bubbles_wrong_take: item.answer,
            category: tags[0] || "general",
            tags: tags,
            updated_at: new Date().toISOString()
          }, { onConflict: "id" });
        
        if (!error) synced++;
      }
      
      toast.success(`Synced ${synced} items to RAG knowledge base!`);
      
      // Refresh stats
      const { count: total } = await supabase
        .from("bubbles_rag_content")
        .select("*", { count: "exact", head: true });
      const { count: withEmbeddings } = await supabase
        .from("bubbles_rag_content")
        .select("*", { count: "exact", head: true })
        .not("embedding", "is", null);
      setRagStats({ total: total || 0, withEmbeddings: withEmbeddings || 0 });
    } catch (error) {
      console.error("Failed to sync:", error);
      toast.error("Failed to sync to RAG");
    } finally {
      setIsSyncing(false);
    }
  }, [questionHistory, favorites]);
  
  // Copy answer
  const copyAnswer = useCallback(async () => {
    if (!bubblesAnswer) return;
    try {
      await navigator.clipboard.writeText(bubblesAnswer);
      setAnswerCopied(true);
      toast.success("Copied!");
      setTimeout(() => setAnswerCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [bubblesAnswer]);
  
  // Filter history
  const filteredHistory = useMemo(() => {
    return questionHistory.filter(item => {
      if (showFavoritesOnly && !favorites.includes(item.id)) return false;
      if (selectedTagFilter && !item.tags?.includes(selectedTagFilter)) return false;
      return true;
    });
  }, [questionHistory, showFavoritesOnly, favorites, selectedTagFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">FAQ Knowledge Base</h1>
            <p className="text-muted-foreground">
              Ask Bubbles, manage wisdom history, and sync to RAG
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Database className="w-3 h-3" />
              {ragStats.total} RAG entries
            </Badge>
            <Badge variant="outline" className={cn(
              "gap-1",
              ragStats.withEmbeddings === ragStats.total ? "text-green-600" : "text-amber-600"
            )}>
              <Brain className="w-3 h-3" />
              {ragStats.withEmbeddings} embedded
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{wisdomStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{totalWisdoms}</p>
              <p className="text-xs text-muted-foreground">Total Wisdoms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <History className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">{questionHistory.length}</p>
              <p className="text-xs text-muted-foreground">Questions Asked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </CardContent>
          </Card>
        </div>

        {/* Streak Badges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Streak Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakBadges currentStreak={wisdomStreak} />
          </CardContent>
        </Card>

        <Tabs defaultValue="ask" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ask" className="gap-2">
              <MessageCircleQuestion className="w-4 h-4" />
              Ask Bubbles
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History ({questionHistory.length})
            </TabsTrigger>
            <TabsTrigger value="sync" className="gap-2">
              <Database className="w-4 h-4" />
              RAG Sync
            </TabsTrigger>
          </TabsList>

          {/* Ask Bubbles Tab */}
          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ask Bubbles Anything</CardTitle>
                <CardDescription>
                  Submit your burning question and receive wisdom of dubious accuracy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Why do birds fly south? What is the meaning of life? Why does toast land butter-side down?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={500}
                  disabled={isAsking}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {userQuestion.length}/500
                  </span>
                  <Button 
                    onClick={askBubbles}
                    disabled={!userQuestion.trim() || isAsking}
                    className="gap-2"
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Ask Bubbles
                      </>
                    )}
                  </Button>
                </div>

                {bubblesAnswer && (
                  <Card className="bg-accent/10 border-accent/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className="bg-accent text-accent-foreground">
                          🐑 Bubbles says:
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={copyAnswer}
                          >
                            {answerCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{bubblesAnswer}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Question History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="gap-1"
                    >
                      <Star className={cn("w-4 h-4", showFavoritesOnly && "fill-current")} />
                      Favorites
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-destructive hover:text-destructive gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Tag filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={selectedTagFilter === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTagFilter(null)}
                  >
                    All
                  </Button>
                  {PREDEFINED_TAGS.map(tag => (
                    <Button
                      key={tag.id}
                      variant={selectedTagFilter === tag.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTagFilter(tag.id)}
                      className="gap-1"
                    >
                      {tag.emoji} {tag.label}
                    </Button>
                  ))}
                </div>

                {/* History items */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No questions yet</p>
                      <p className="text-sm">Ask Bubbles something!</p>
                    </div>
                  ) : (
                    filteredHistory.map((item) => {
                      const isFavorited = favorites.includes(item.id);
                      const isEditingTags = editingTagsFor === item.id;
                      
                      return (
                        <Card key={item.id} className={cn(
                          "transition-all",
                          isFavorited && "ring-2 ring-amber-500/30"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium text-sm">"{item.question}"</p>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn("h-7 w-7", isEditingTags && "bg-primary/10")}
                                  onClick={() => setEditingTagsFor(isEditingTags ? null : item.id)}
                                >
                                  <Tag className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn("h-7 w-7", isFavorited && "text-amber-500")}
                                  onClick={() => toggleFavorite(item.id)}
                                >
                                  <Star className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => deleteHistoryItem(item.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Tag editing */}
                            {isEditingTags && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {PREDEFINED_TAGS.map(tag => (
                                  <Button
                                    key={tag.id}
                                    variant={item.tags?.includes(tag.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleTag(item.id, tag.id)}
                                    className="h-6 text-xs gap-1"
                                  >
                                    {tag.emoji} {tag.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            {/* Tags display */}
                            {item.tags && item.tags.length > 0 && !isEditingTags && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.tags.map(tagId => {
                                  const tag = PREDEFINED_TAGS.find(t => t.id === tagId);
                                  if (!tag) return null;
                                  return (
                                    <Badge key={tagId} variant="secondary" className="text-xs">
                                      {tag.emoji} {tag.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.answer}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-2">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG Sync Tab */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Sync to RAG Knowledge Base
                </CardTitle>
                <CardDescription>
                  Push your favorite Q&A pairs to the Bubbles knowledge base for AI context
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="text-2xl font-bold">{favorites.length}</p>
                      <p className="text-sm text-muted-foreground">Ready to sync</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-2xl font-bold">{ragStats.total}</p>
                      <p className="text-sm text-muted-foreground">In RAG database</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Button
                  onClick={syncToRag}
                  disabled={isSyncing || favorites.length === 0}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync {favorites.length} Favorites to RAG
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  Only starred favorites will be synced. Embeddings are generated automatically.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
