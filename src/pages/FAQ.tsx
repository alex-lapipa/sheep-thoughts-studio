import { useState, useCallback, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOgImage } from "@/hooks/useOgImage";
import { Sparkles, RefreshCw, Send, MessageCircleQuestion, Loader2, Share2, Check, Calendar, Clock, Flame, Copy, History, Trash2, ChevronDown, ChevronUp, Trophy, RotateCcw, Download, Zap, Star, Tag, X, Plus, CheckSquare, Square, Tags, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useShare } from "@/hooks/useShare";
import confetti from "canvas-confetti";
import { StreakBadges } from "@/components/StreakBadges";
import { analytics } from "@/lib/analytics";
import { TocItem } from "@/hooks/useTableOfContents";

// Table of Contents items for the FAQ page with nested sub-sections
const FAQ_TOC_ITEMS: TocItem[] = [
  { id: "daily-wisdom", title: "Daily Wisdom", level: 1 },
  { id: "random-wisdom", title: "Random Wisdom", level: 1 },
  { id: "ask-bubbles", title: "Ask Bubbles", level: 1 },
  { id: "question-history", title: "Question History", level: 1 },
  { 
    id: "faq-list", 
    title: "FAQ List", 
    level: 1,
    children: [
      { id: "faq-about-bubbles", title: "About Bubbles", level: 2 },
      { id: "faq-how-it-works", title: "How It Works", level: 2 },
      { id: "faq-mysteries", title: "Mysteries", level: 2 },
      { id: "faq-community", title: "Community & Fun", level: 2 },
    ]
  },
  { id: "contact", title: "Contact", level: 1 },
];

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

const FAQ = () => {
  // Smooth scrolling is handled by LegalPageLayout
  const { t } = useLanguage();
  const { share, isCopied } = useShare();
  const [randomWisdom, setRandomWisdom] = useState<{ question: string; answer: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Ask Bubbles state
  const [userQuestion, setUserQuestion] = useState("");
  const [bubblesAnswer, setBubblesAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [answerCopied, setAnswerCopied] = useState(false);
  
  // Question history
  interface HistoryItem {
    id: string;
    question: string;
    answer: string;
    timestamp: number;
    tags?: string[];
  }
  const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Tags/Categories
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
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);
  
  // Bulk selection mode
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkTagMenu, setShowBulkTagMenu] = useState(false);
  const [showTagStats, setShowTagStats] = useState(false);
  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bubbles-favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);
  
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const isFavoriting = !prev.includes(id);
      const updated = isFavoriting 
        ? [...prev, id]
        : prev.filter(f => f !== id);
      localStorage.setItem("bubbles-favorites", JSON.stringify(updated));
      analytics.favoriteAnswer(isFavoriting);
      return updated;
    });
  }, []);
  
  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bubbles-question-history");
    if (stored) {
      try {
        setQuestionHistory(JSON.parse(stored));
      } catch {
        setQuestionHistory([]);
      }
    }
  }, []);
  
  // Save to history when we get an answer
  const saveToHistory = useCallback((question: string, answer: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: Date.now(),
    };
    setQuestionHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    setQuestionHistory([]);
    localStorage.removeItem("bubbles-question-history");
    analytics.clearHistory();
    toast.success("History cleared!");
  }, []);
  
  const deleteHistoryItem = useCallback((id: string) => {
    setQuestionHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Tag management
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
  
  // Bulk tag operations
  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);
  
  const selectAllFavorites = useCallback(() => {
    const favoriteIds = questionHistory
      .filter(item => favorites.includes(item.id))
      .map(item => item.id);
    setSelectedItems(new Set(favoriteIds));
  }, [questionHistory, favorites]);
  
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);
  
  const applyTagToSelected = useCallback((tagId: string) => {
    setQuestionHistory(prev => {
      const updated = prev.map(item => {
        if (!selectedItems.has(item.id)) return item;
        const currentTags = item.tags || [];
        if (currentTags.includes(tagId)) return item;
        return { ...item, tags: [...currentTags, tagId] };
      });
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
    toast.success(`Tag applied to ${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''}!`);
    setShowBulkTagMenu(false);
  }, [selectedItems]);
  
  const removeTagFromSelected = useCallback((tagId: string) => {
    setQuestionHistory(prev => {
      const updated = prev.map(item => {
        if (!selectedItems.has(item.id)) return item;
        const currentTags = item.tags || [];
        return { ...item, tags: currentTags.filter(t => t !== tagId) };
      });
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
    toast.success(`Tag removed from ${selectedItems.size} item${selectedItems.size !== 1 ? 's' : ''}!`);
    setShowBulkTagMenu(false);
  }, [selectedItems]);
  
  const exitBulkMode = useCallback(() => {
    setBulkSelectMode(false);
    setSelectedItems(new Set());
    setShowBulkTagMenu(false);
  }, []);
  
  // Get all unique tags used in history
  const usedTags = useMemo(() => {
    const tagSet = new Set<string>();
    questionHistory.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [questionHistory]);
  
  // Tag statistics - count items per tag
  const tagStats = useMemo(() => {
    const stats: Record<string, { count: number; favoriteCount: number }> = {};
    PREDEFINED_TAGS.forEach(tag => {
      stats[tag.id] = { count: 0, favoriteCount: 0 };
    });
    
    questionHistory.forEach(item => {
      item.tags?.forEach(tagId => {
        if (stats[tagId]) {
          stats[tagId].count++;
          if (favorites.includes(item.id)) {
            stats[tagId].favoriteCount++;
          }
        }
      });
    });
    
    // Calculate untagged count
    const untaggedCount = questionHistory.filter(item => !item.tags || item.tags.length === 0).length;
    const untaggedFavorites = questionHistory.filter(item => 
      (!item.tags || item.tags.length === 0) && favorites.includes(item.id)
    ).length;
    
    return { 
      byTag: stats, 
      untagged: { count: untaggedCount, favoriteCount: untaggedFavorites },
      totalTagged: questionHistory.length - untaggedCount
    };
  }, [questionHistory, favorites]);
  
  // Filter history by tag and favorites
  const filteredHistory = useMemo(() => {
    return questionHistory.filter(item => {
      if (showFavoritesOnly && !favorites.includes(item.id)) return false;
      if (selectedTagFilter && !item.tags?.includes(selectedTagFilter)) return false;
      return true;
    });
  }, [questionHistory, showFavoritesOnly, favorites, selectedTagFilter]);
  
  const shareWisdom = useCallback(() => {
    if (!randomWisdom) return;
    share({
      title: "Bubbles Wisdom",
      text: `"${randomWisdom.question}" — ${randomWisdom.answer}`,
      url: window.location.href,
    });
  }, [randomWisdom, share]);

  const shareAIAnswer = useCallback(() => {
    if (!bubblesAnswer || !userQuestion) return;
    share({
      title: "Bubbles Answered My Question",
      text: `Q: "${userQuestion}"\n\nA: ${bubblesAnswer}\n\n— Bubbles, Wicklow Institute of Confident Incorrectness`,
      url: window.location.href,
    });
  }, [bubblesAnswer, userQuestion, share]);

  const copyAnswerOnly = useCallback(async () => {
    if (!bubblesAnswer) return;
    try {
      await navigator.clipboard.writeText(bubblesAnswer);
      setAnswerCopied(true);
      toast.success("Answer copied to clipboard!");
      setTimeout(() => setAnswerCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [bubblesAnswer]);

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
    { question: t("faq.q7"), answer: t("faq.a7") },
    { question: t("faq.q8"), answer: t("faq.a8") },
    { question: t("faq.q9"), answer: t("faq.a9") },
    { question: t("faq.q10"), answer: t("faq.a10") },
    { question: t("faq.q11"), answer: t("faq.a11") },
    { question: t("faq.q12"), answer: t("faq.a12") },
    { question: t("faq.q13"), answer: t("faq.a13") },
    { question: t("faq.q14"), answer: t("faq.a14") },
    { question: t("faq.q15"), answer: t("faq.a15") },
    { question: t("faq.q16"), answer: t("faq.a16") },
    { question: t("faq.q17"), answer: t("faq.a17") },
  ];

  // Daily wisdom - consistent based on date
  const dailyWisdom = useMemo(() => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    // Simple hash function to get a consistent index from date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % faqs.length;
    return faqs[index];
  }, [faqs]);

  // Countdown to next daily wisdom (midnight)
  const [timeUntilNext, setTimeUntilNext] = useState("");
  
  // Wisdom streak tracking
  const [wisdomStreak, setWisdomStreak] = useState(0);
  const [totalWisdoms, setTotalWisdoms] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState<typeof STREAK_MILESTONES[0] | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Toggle demo mode with keyboard shortcut (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDemoMode(prev => !prev);
        toast.success(showDemoMode ? "Demo mode hidden" : "Demo mode enabled! 🎉");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDemoMode]);

  // Celebrate milestone with confetti
  const celebrateMilestone = useCallback((milestone: typeof STREAK_MILESTONES[0]) => {
    setCurrentMilestone(milestone);
    setShowMilestone(true);
    analytics.unlockMilestone(milestone.days, milestone.label);
    
    // Fire confetti!
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ['#4ade80', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
    
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
    
    // Also fire a big burst in the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });
    
    // Hide milestone banner after delay
    setTimeout(() => setShowMilestone(false), 5000);
  }, []);
  
  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    setTimeUntilNext(calculateTimeUntilMidnight());
    
    const interval = setInterval(() => {
      setTimeUntilNext(calculateTimeUntilMidnight());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Track wisdom views and calculate streak
  useEffect(() => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Get stored wisdom dates
    const storedData = localStorage.getItem("bubbles-wisdom-dates");
    let wisdomDates: string[] = storedData ? JSON.parse(storedData) : [];
    
    // Check if today is new
    const isNewDay = !wisdomDates.includes(todayString);
    
    // Add today if not already recorded
    if (isNewDay) {
      wisdomDates.push(todayString);
      localStorage.setItem("bubbles-wisdom-dates", JSON.stringify(wisdomDates));
    }
    
    setTotalWisdoms(wisdomDates.length);
    
    // Calculate streak (consecutive days ending today or yesterday)
    const sortedDates = wisdomDates
      .map(d => {
        const [year, month, day] = d.split('-').map(Number);
        return new Date(year, month - 1, day);
      })
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      const currentDate = sortedDates[i];
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    setWisdomStreak(streak);
    
    // Check for milestone celebration (only on new days)
    if (isNewDay) {
      const celebratedMilestones = JSON.parse(localStorage.getItem("bubbles-celebrated-milestones") || "[]");
      
      // Find the highest milestone achieved
      const achievedMilestone = [...STREAK_MILESTONES]
        .reverse()
        .find(m => streak >= m.days && !celebratedMilestones.includes(m.days));
      
      if (achievedMilestone) {
        // Mark as celebrated
        celebratedMilestones.push(achievedMilestone.days);
        localStorage.setItem("bubbles-celebrated-milestones", JSON.stringify(celebratedMilestones));
        
        // Delay celebration slightly for effect
        setTimeout(() => celebrateMilestone(achievedMilestone), 500);
      }
    }
  }, [celebrateMilestone]);

  const shareDailyWisdom = useCallback(() => {
    share({
      title: "Today's Bubbles Wisdom",
      text: `"${dailyWisdom.question}" — ${dailyWisdom.answer}`,
      url: window.location.href,
    });
  }, [dailyWisdom, share]);

  const getRandomWisdom = useCallback(() => {
    setIsSpinning(true);
    
    let randomIndex = Math.floor(Math.random() * faqs.length);
    if (randomWisdom) {
      while (faqs[randomIndex].question === randomWisdom.question && faqs.length > 1) {
        randomIndex = Math.floor(Math.random() * faqs.length);
      }
    }
    
    setTimeout(() => {
      setRandomWisdom(faqs[randomIndex]);
      setIsSpinning(false);
    }, 300);
  }, [faqs, randomWisdom]);

  const askBubbles = async () => {
    if (!userQuestion.trim() || isAsking) return;
    
    if (userQuestion.length > 500) {
      toast.error("Question must be less than 500 characters");
      return;
    }

    setIsAsking(true);
    setBubblesAnswer(null);
    analytics.askQuestion(userQuestion.trim());

    try {
      const { data, error } = await supabase.functions.invoke("bubbles-answer", {
        body: { question: userQuestion.trim() },
      });

      if (error) {
        console.error("Error asking Bubbles:", error);
        toast.error(error.message || "Bubbles got distracted by a cloud");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const answer = data?.answer || "I stared at a fence post and forgot what you asked.";
      setBubblesAnswer(answer);
      saveToHistory(userQuestion.trim(), answer);
      analytics.receiveAnswer();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Bubbles wandered off. Try again.");
    } finally {
      setIsAsking(false);
    }
  };

  const { ogImageUrl, siteUrl } = useOgImage("og-faq.jpg");

  return (
    <LegalPageLayout 
      tocItems={FAQ_TOC_ITEMS} 
      tocTitle="On This Page"
      mobileTocTitle="Jump to Section"
    >
      <Helmet>
        <title>Ask Bubbles | FAQ & Daily Wisdom</title>
        <meta name="description" content="Ask Bubbles anything and receive confidently incorrect answers. Track your wisdom streak and unlock achievement badges." />
        <meta property="og:title" content="Ask Bubbles | FAQ & Daily Wisdom" />
        <meta property="og:description" content="Ask Bubbles anything. Get wisdom. Stay confused. From the Wicklow Institute of Confident Incorrectness." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/faq`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ask Bubbles | FAQ" />
        <meta name="twitter:description" content="Ask Bubbles anything. Get wisdom. Stay confused." />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/faq`} />
      </Helmet>

      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          {t("faqPage.title")}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("faqPage.subtitle")}
        </p>
      </div>

      {/* Milestone Celebration Banner */}
      {showMilestone && currentMilestone && (
        <div className="mb-6 p-6 bg-gradient-to-r from-accent via-primary to-accent rounded-2xl border-2 border-accent animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-3">{currentMilestone.emoji}</span>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-accent-foreground" />
              <h3 className="font-display font-bold text-2xl text-accent-foreground">
                {currentMilestone.label}
              </h3>
            </div>
            <p className="text-accent-foreground/80">
              You've reached a {currentMilestone.days}-day wisdom streak! 🎉
            </p>
          </div>
        </div>
      )}

      {/* Daily Bubbles Wisdom */}
      <section id="daily-wisdom" className="mb-6 p-6 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl border border-primary/30 scroll-mt-24">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold text-xl mb-1">Today's Wisdom</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              {/* Streak and Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 rounded-full">
                  <Flame className={cn("w-4 h-4", wisdomStreak > 0 ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-sm font-bold text-accent">{wisdomStreak}</span>
                  <span className="text-xs text-muted-foreground">day streak</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalWisdoms} total wisdom{totalWisdoms !== 1 ? 's' : ''} viewed
                </div>
              </div>
              
              {/* Badge Collection */}
              <div className="w-full mb-4 p-4 bg-card/50 rounded-xl border">
                <StreakBadges currentStreak={wisdomStreak} />
                
                {/* Demo Mode Controls */}
                {showDemoMode && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-dashed border-accent animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-accent">🎮 Demo Mode</span>
                    </div>
                    
                    {/* Celebration Triggers */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Trigger Celebrations:</p>
                      <div className="flex flex-wrap gap-2">
                        {STREAK_MILESTONES.map((milestone) => (
                          <Button
                            key={milestone.days}
                            variant="outline"
                            size="sm"
                            onClick={() => celebrateMilestone(milestone)}
                            className="text-xs gap-1.5 hover-scale"
                          >
                            <span>{milestone.emoji}</span>
                            <span>{milestone.days}d</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Streak Simulation */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Simulate Streak:</p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 3, 7, 14, 30, 60, 100, 365].map((days) => (
                          <Button
                            key={days}
                            variant={wisdomStreak === days ? "default" : "secondary"}
                            size="sm"
                            onClick={() => setWisdomStreak(days)}
                            className="text-xs hover-scale"
                          >
                            {days}d
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Badge Management */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Badge Management:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem("bubbles-celebrated-milestones", JSON.stringify(STREAK_MILESTONES.map(m => m.days)));
                            toast.success("All badges unlocked!");
                            window.location.reload();
                          }}
                          className="text-xs gap-1.5"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Unlock All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.removeItem("bubbles-celebrated-milestones");
                            toast.success("All badges reset!");
                            window.location.reload();
                          }}
                          className="text-xs gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Reset Badges
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.removeItem("bubbles-wisdom-dates");
                            localStorage.removeItem("bubbles-celebrated-milestones");
                            setWisdomStreak(0);
                            setTotalWisdoms(0);
                            toast.success("All progress reset!");
                            window.location.reload();
                          }}
                          className="text-xs gap-1.5 text-destructive hover:text-destructive"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reset All
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Shift+D</kbd> to hide
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Next wisdom in {timeUntilNext}</span>
              </div>
              
              <div className="w-full p-5 bg-card rounded-xl border shadow-sm">
                <p className="font-display font-semibold text-lg mb-2 text-foreground">
                  "{dailyWisdom.question}"
                </p>
                <p className="text-muted-foreground italic mb-4">
                  {dailyWisdom.answer}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareDailyWisdom}
                  className="gap-2 font-display"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Today's Wisdom
                    </>
                  )}
                </Button>
              </div>
            </div>
      </section>

      {/* Random Bubbles Wisdom */}
      <section id="random-wisdom" className="mb-10 p-6 bg-gradient-to-br from-accent/20 to-primary/10 rounded-2xl border border-accent/30 scroll-mt-24">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-display font-bold text-xl mb-2">Random Bubbles Wisdom</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let fate decide which truth you need to hear today
              </p>
              
              <Button 
                onClick={getRandomWisdom}
                className="gap-2 font-display mb-4"
                variant="default"
              >
                <RefreshCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                {randomWisdom ? "Another Wisdom" : "Reveal Wisdom"}
              </Button>

              {randomWisdom && (
                <div className={cn(
                  "w-full mt-2 p-5 bg-card rounded-xl border shadow-sm transition-all duration-300",
                  isSpinning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-fade-in"
                )}>
                  <p className="font-display font-semibold text-lg mb-2 text-foreground">
                    "{randomWisdom.question}"
                  </p>
                  <p className="text-muted-foreground italic mb-4">
                    {randomWisdom.answer}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareWisdom}
                    className="gap-2 font-display"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share Wisdom
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
      </section>

      {/* Ask Bubbles Anything */}
      <section id="ask-bubbles" className="mb-10 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl border border-primary/30 scroll-mt-24">
            <div className="flex flex-col items-center text-center">
              <MessageCircleQuestion className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold text-xl mb-2">Ask Bubbles Anything</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your burning question and receive wisdom of dubious accuracy
              </p>
              
              <div className="w-full space-y-3">
                <Textarea
                  placeholder="Why do birds fly south? What is the meaning of life? Why does toast land butter-side down?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="resize-none min-h-[80px]"
                  maxLength={500}
                  disabled={isAsking}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {userQuestion.length}/500
                  </span>
                  <Button 
                    onClick={askBubbles}
                    disabled={!userQuestion.trim() || isAsking}
                    className="gap-2 font-display"
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Bubbles is thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Ask Bubbles
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {bubblesAnswer && (
                <div className="w-full mt-4 p-5 bg-card rounded-xl border shadow-sm animate-fade-in">
                  <p className="font-display font-semibold text-sm mb-2 text-muted-foreground">
                    Your question: "{userQuestion}"
                  </p>
                  <div className="border-t pt-3 mt-3">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {bubblesAnswer}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <p className="text-xs text-muted-foreground italic">
                      — Bubbles, Wicklow Institute of Confident Incorrectness
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAnswerOnly}
                        className="gap-2 font-display"
                      >
                        {answerCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareAIAnswer}
                        className="gap-2 font-display"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Shared!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
      </section>

      {/* Question History */}
      <section id="question-history" className="scroll-mt-24">
        {questionHistory.length > 0 && (
          <div className="mb-10 p-6 bg-gradient-to-br from-muted/50 to-secondary/30 rounded-2xl border">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <h3 className="font-display font-bold text-lg">Your Question History</h3>
                    <p className="text-sm text-muted-foreground">
                      {questionHistory.length} question{questionHistory.length !== 1 ? 's' : ''} asked
                      {favorites.length > 0 && ` · ${favorites.length} favorited`}
                    </p>
                  </div>
                </div>
                {showHistory ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {showHistory && (
                <div className="mt-4 space-y-3">
                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Favorites Toggle */}
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="gap-2"
                      disabled={favorites.length === 0}
                    >
                      <Star className={cn("w-4 h-4", showFavoritesOnly && "fill-current")} />
                      {showFavoritesOnly ? "Show All" : `Favorites (${favorites.length})`}
                    </Button>
                    
                    {/* Tag Filter Dropdown */}
                    {usedTags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Filter:
                        </span>
                        {PREDEFINED_TAGS.filter(tag => usedTags.includes(tag.id)).map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                              selectedTagFilter === tag.id
                                ? "ring-2 ring-primary ring-offset-1"
                                : "opacity-70 hover:opacity-100",
                              tag.color
                            )}
                          >
                            <span>{tag.emoji}</span>
                            <span>{tag.label}</span>
                            {selectedTagFilter === tag.id && (
                              <X className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Tag Statistics Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showTagStats ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowTagStats(!showTagStats)}
                      className="gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {showTagStats ? "Hide Stats" : "Tag Stats"}
                    </Button>
                  </div>
                  
                  {/* Tag Statistics Panel */}
                  {showTagStats && (
                    <div className="p-4 bg-muted/30 rounded-xl border animate-fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h4 className="font-display font-bold text-sm">Category Statistics</h4>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {tagStats.totalTagged} tagged / {questionHistory.length} total
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PREDEFINED_TAGS.map(tag => {
                          const stats = tagStats.byTag[tag.id];
                          const percentage = questionHistory.length > 0 
                            ? Math.round((stats.count / questionHistory.length) * 100) 
                            : 0;
                          
                          return (
                            <button
                              key={tag.id}
                              onClick={() => {
                                if (stats.count > 0) {
                                  setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id);
                                }
                              }}
                              disabled={stats.count === 0}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                stats.count > 0 
                                  ? "hover:border-primary/50 hover:bg-card cursor-pointer" 
                                  : "opacity-50 cursor-not-allowed",
                                selectedTagFilter === tag.id && "ring-2 ring-primary border-primary"
                              )}
                            >
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", tag.color)}>
                                {tag.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{tag.label}</span>
                                  <span className="font-display font-bold text-lg">{stats.count}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full rounded-full transition-all", tag.color.split(' ')[0])}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-8">{percentage}%</span>
                                </div>
                                {stats.favoriteCount > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Star className="w-3 h-3 fill-accent text-accent" />
                                    {stats.favoriteCount} favorited
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Untagged section */}
                      {tagStats.untagged.count > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Tag className="w-4 h-4" />
                              <span>Untagged answers</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold">{tagStats.untagged.count}</span>
                              {tagStats.untagged.favoriteCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="w-3 h-3 fill-accent text-accent" />
                                  {tagStats.untagged.favoriteCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Left side - Bulk operations */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!bulkSelectMode ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setBulkSelectMode(true);
                            if (favorites.length > 0) {
                              selectAllFavorites();
                            }
                          }}
                          className="gap-2"
                          disabled={favorites.length === 0}
                        >
                          <Tags className="w-4 h-4" />
                          Bulk Tag ({favorites.length})
                        </Button>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/30">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{selectedItems.size} selected</span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllFavorites}
                            className="gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Select All Favorites
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            disabled={selectedItems.size === 0}
                          >
                            Clear
                          </Button>
                          
                          <div className="relative">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setShowBulkTagMenu(!showBulkTagMenu)}
                              className="gap-2"
                              disabled={selectedItems.size === 0}
                            >
                              <Tags className="w-4 h-4" />
                              Apply Tags
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                            
                            {showBulkTagMenu && (
                              <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-card border rounded-xl shadow-lg min-w-[280px] animate-fade-in">
                                <p className="text-xs text-muted-foreground mb-3 font-medium">
                                  Apply to {selectedItems.size} selected item{selectedItems.size !== 1 ? 's' : ''}:
                                </p>
                                <div className="space-y-2">
                                  {PREDEFINED_TAGS.map(tag => {
                                    // Check if any selected item already has this tag
                                    const selectedWithTag = [...selectedItems].filter(id => {
                                      const item = questionHistory.find(i => i.id === id);
                                      return item?.tags?.includes(tag.id);
                                    }).length;
                                    
                                    return (
                                      <div key={tag.id} className="flex items-center justify-between gap-2">
                                        <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", tag.color)}>
                                          <span>{tag.emoji}</span>
                                          <span>{tag.label}</span>
                                        </span>
                                        <div className="flex items-center gap-1">
                                          {selectedWithTag > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                              ({selectedWithTag})
                                            </span>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => applyTagToSelected(tag.id)}
                                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                                          >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                          </Button>
                                          {selectedWithTag > 0 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeTagFromSelected(tag.id)}
                                              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              <X className="w-3 h-3 mr-1" />
                                              Remove
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowBulkTagMenu(false)}
                                    className="w-full text-xs"
                                  >
                                    Close
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={exitBulkMode}
                            className="text-muted-foreground"
                          >
                            Done
                          </Button>
                        </>
                      )}
                    </div>
                    
                    {/* Right side - Export/Clear */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const itemsToExport = filteredHistory;
                          const content = itemsToExport.map((item, index) => {
                            const date = new Date(item.timestamp).toLocaleString();
                            const isFav = favorites.includes(item.id) ? " ⭐" : "";
                            const tags = item.tags?.length 
                              ? ` [${item.tags.map(t => PREDEFINED_TAGS.find(pt => pt.id === t)?.label || t).join(', ')}]`
                              : "";
                            return `--- Question ${index + 1}${isFav}${tags} (${date}) ---\n\nQ: ${item.question}\n\nA: ${item.answer}\n`;
                          }).join('\n\n');
                          
                          const filterLabel = [
                            showFavoritesOnly && "Favorites",
                            selectedTagFilter && PREDEFINED_TAGS.find(t => t.id === selectedTagFilter)?.label
                          ].filter(Boolean).join(" + ") || "All";
                          
                          const header = `🐑 Bubbles Wisdom History (${filterLabel})\nExported: ${new Date().toLocaleString()}\nTotal Questions: ${itemsToExport.length}\n\n${'='.repeat(50)}\n\n`;
                          const fullContent = header + content;
                          
                          const blob = new Blob([fullContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `bubbles-wisdom-${new Date().toISOString().split('T')[0]}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          analytics.exportHistory(itemsToExport.length, showFavoritesOnly);
                          toast.success("History exported successfully!");
                        }}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-destructive hover:text-destructive gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                  
                  {/* History Items */}
                  {filteredHistory.map((item) => {
                    const isFavorited = favorites.includes(item.id);
                    const isEditingTags = editingTagsFor === item.id;
                    const isSelected = selectedItems.has(item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "p-4 bg-card rounded-xl border shadow-sm transition-all",
                          isFavorited && "ring-2 ring-accent/50 border-accent/30",
                          bulkSelectMode && isSelected && "ring-2 ring-primary border-primary/50"
                        )}
                        onClick={bulkSelectMode ? () => toggleItemSelection(item.id) : undefined}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {bulkSelectMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemSelection(item.id);
                                }}
                                className="shrink-0 mt-0.5"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary" />
                                ) : (
                                  <Square className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                            )}
                            <p className="font-display font-semibold text-sm text-foreground">
                              "{item.question}"
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-7 w-7 transition-colors",
                                isEditingTags
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-primary"
                              )}
                              onClick={() => setEditingTagsFor(isEditingTags ? null : item.id)}
                              title="Add tags"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-7 w-7 transition-colors",
                                isFavorited 
                                  ? "text-accent hover:text-accent/80" 
                                  : "text-muted-foreground hover:text-accent"
                              )}
                              onClick={() => toggleFavorite(item.id)}
                              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={cn("w-3.5 h-3.5", isFavorited && "fill-current")} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => {
                                setUserQuestion(item.question);
                                setBubblesAnswer(null);
                                document.getElementById('ask-bubbles-section')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              title="Ask again"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteHistoryItem(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Tag Editor */}
                        {isEditingTags && (
                          <div className="mb-3 p-3 bg-muted/50 rounded-lg border animate-fade-in">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Add categories to organize this answer:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {PREDEFINED_TAGS.map(tag => {
                                const isSelected = item.tags?.includes(tag.id);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => toggleTag(item.id, tag.id)}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                                      isSelected
                                        ? tag.color
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                  >
                                    <span>{tag.emoji}</span>
                                    <span>{tag.label}</span>
                                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Current Tags Display */}
                        {!isEditingTags && item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map(tagId => {
                              const tag = PREDEFINED_TAGS.find(t => t.id === tagId);
                              if (!tag) return null;
                              return (
                                <span
                                  key={tagId}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs",
                                    tag.color
                                  )}
                                >
                                  <span>{tag.emoji}</span>
                                  <span>{tag.label}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.answer}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground/60">
                            {new Date(item.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {isFavorited && (
                            <span className="text-xs text-accent font-medium">⭐ Favorited</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty States */}
                  {filteredHistory.length === 0 && (showFavoritesOnly || selectedTagFilter) && (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedTagFilter ? (
                        <>
                          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No answers tagged with "{PREDEFINED_TAGS.find(t => t.id === selectedTagFilter)?.label}"</p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => setSelectedTagFilter(null)}
                            className="mt-1"
                          >
                            Clear filter
                          </Button>
                        </>
                      ) : (
                        <>
                          <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No favorites yet</p>
                          <p className="text-sm">Star your best answers to save them here</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </section>

      {/* FAQ List */}
      <section id="faq-list" className="scroll-mt-24">
        <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
        
        {/* About Bubbles */}
        <div id="faq-about-bubbles" className="scroll-mt-24 mb-8">
          <h3 className="text-lg font-display font-semibold mb-3 text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            About Bubbles
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(0, 5).map((faq, index) => (
              <AccordionItem key={index} value={`about-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* How It Works */}
        <div id="faq-how-it-works" className="scroll-mt-24 mb-8">
          <h3 className="text-lg font-display font-semibold mb-3 text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            How It Works
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(5, 9).map((faq, index) => (
              <AccordionItem key={index} value={`how-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Mysteries */}
        <div id="faq-mysteries" className="scroll-mt-24 mb-8">
          <h3 className="text-lg font-display font-semibold mb-3 text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Mysteries
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(9, 13).map((faq, index) => (
              <AccordionItem key={index} value={`tech-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Community & Fun */}
        <div id="faq-community" className="scroll-mt-24 mb-8">
          <h3 className="text-lg font-display font-semibold mb-3 text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Community & Fun
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(13).map((faq, index) => (
              <AccordionItem key={index} value={`community-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="mt-12 p-6 bg-secondary/50 rounded-xl text-center scroll-mt-24">
        <h3 className="font-display font-bold text-xl mb-2">{t("faqPage.contact.title")}</h3>
        <p className="text-muted-foreground mb-4">
          {t("faqPage.contact.subtitle")}
        </p>
        <a 
          href="/contact" 
          className="inline-flex items-center justify-center h-10 px-6 font-display font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
        >
          {t("faqPage.contact.button")}
        </a>
      </section>
    </LegalPageLayout>
  );
};

export default FAQ;
