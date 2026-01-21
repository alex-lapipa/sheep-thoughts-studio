import { useState, useCallback, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, RefreshCw, Send, MessageCircleQuestion, Loader2, Share2, Check, Calendar, Clock, Flame, Copy, History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useShare } from "@/hooks/useShare";

const FAQ = () => {
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
  }
  const [questionHistory, setQuestionHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
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
    toast.success("History cleared!");
  }, []);
  
  const deleteHistoryItem = useCallback((id: string) => {
    setQuestionHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("bubbles-question-history", JSON.stringify(updated));
      return updated;
    });
  }, []);
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
    
    // Add today if not already recorded
    if (!wisdomDates.includes(todayString)) {
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
  }, []);

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
    } catch (err) {
      console.error("Error:", err);
      toast.error("Bubbles wandered off. Try again.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t("faqPage.title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("faqPage.subtitle")}
            </p>
          </div>

          {/* Daily Bubbles Wisdom */}
          <div className="mb-6 p-6 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl border border-primary/30">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display font-bold text-xl mb-1">Today's Wisdom</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              
              {/* Streak and Stats */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 rounded-full">
                  <Flame className={cn("w-4 h-4", wisdomStreak > 0 ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-sm font-bold text-accent">{wisdomStreak}</span>
                  <span className="text-xs text-muted-foreground">day streak</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalWisdoms} total wisdom{totalWisdoms !== 1 ? 's' : ''} viewed
                </div>
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
          </div>

          {/* Random Bubbles Wisdom */}
          <div className="mb-10 p-6 bg-gradient-to-br from-accent/20 to-primary/10 rounded-2xl border border-accent/30">
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
          </div>

          {/* Ask Bubbles Anything */}
          <div className="mb-10 p-6 bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl border border-primary/30">
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
          </div>

          {/* Question History */}
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
                  <div className="flex justify-end">
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
                  
                  {questionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-card rounded-xl border shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-display font-semibold text-sm text-foreground">
                          "{item.question}"
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => deleteHistoryItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.answer}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-display text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-secondary/50 rounded-xl text-center">
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
