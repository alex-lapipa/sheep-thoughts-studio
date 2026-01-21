import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BubblesSheep } from "./BubblesSheep";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";
import type { BubbleMode } from "@/data/thoughtBubbles";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
}

const MODE_STYLES: Record<BubblesMode, { bg: string; border: string; accent: string; label: string }> = {
  innocent: { 
    bg: "bg-green-50", 
    border: "border-green-200", 
    accent: "text-green-600",
    label: "Just curious..."
  },
  concerned: { 
    bg: "bg-yellow-50", 
    border: "border-yellow-200", 
    accent: "text-yellow-600",
    label: "Hmm, thinking..."
  },
  triggered: { 
    bg: "bg-orange-50", 
    border: "border-orange-200", 
    accent: "text-orange-600",
    label: "Wait a minute..."
  },
  savage: { 
    bg: "bg-red-50", 
    border: "border-red-200", 
    accent: "text-red-600",
    label: "Actually, you know what..."
  },
  nuclear: { 
    bg: "bg-purple-50", 
    border: "border-purple-200", 
    accent: "text-purple-600",
    label: "I've done the research."
  },
};

const FALLBACK_QUOTES: ThoughtData[] = [
  { id: "1", text: "The sun is powered by angry bees. I've seen the documentation.", mode: "innocent" },
  { id: "2", text: "WiFi comes from birds. That's why they sit on wires.", mode: "concerned" },
  { id: "3", text: "Mountains are just old hills that got promoted.", mode: "triggered" },
  { id: "4", text: "Humans only use 10% of their legs. I've observed this.", mode: "savage" },
  { id: "5", text: "The moon is just the sun's night mode. Basic astronomy.", mode: "nuclear" },
];

export function BubblesSaysWidget() {
  const [quotes, setQuotes] = useState<ThoughtData[]>([]);
  const [currentQuote, setCurrentQuote] = useState<ThoughtData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Fetch quotes from database
  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .eq('is_curated', true)
        .limit(20);

      if (error || !data || data.length === 0) {
        // Try without curated filter
        const { data: allData } = await supabase
          .from('bubbles_thoughts')
          .select('id, text, mode')
          .limit(20);
        
        if (allData && allData.length > 0) {
          const shuffled = [...allData].sort(() => Math.random() - 0.5);
          setQuotes(shuffled);
          setCurrentQuote(shuffled[0]);
        } else {
          setQuotes(FALLBACK_QUOTES);
          setCurrentQuote(FALLBACK_QUOTES[0]);
        }
        return;
      }

      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuotes(shuffled);
      setCurrentQuote(shuffled[0]);
    }

    fetchQuotes();
  }, []);

  const getNextQuote = useCallback(() => {
    if (quotes.length <= 1) return quotes[0];
    let next = quotes[Math.floor(Math.random() * quotes.length)];
    while (next?.id === currentQuote?.id && quotes.length > 1) {
      next = quotes[Math.floor(Math.random() * quotes.length)];
    }
    return next;
  }, [quotes, currentQuote]);

  const rotateQuote = useCallback(() => {
    if (quotes.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentQuote(getNextQuote());
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  }, [quotes, isAnimating, getNextQuote]);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (!autoRotate || quotes.length === 0) return;
    
    const interval = setInterval(rotateQuote, 8000);
    return () => clearInterval(interval);
  }, [autoRotate, quotes.length, rotateQuote]);

  if (!currentQuote) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const style = MODE_STYLES[currentQuote.mode];

  return (
    <Card 
      className={cn(
        "w-full max-w-2xl mx-auto p-6 md:p-8 transition-all duration-500 border-2",
        style.bg,
        style.border
      )}
      onMouseEnter={() => setAutoRotate(false)}
      onMouseLeave={() => setAutoRotate(true)}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Bubbles Avatar */}
        <div className="shrink-0">
          <div className={cn(
            "relative transition-transform duration-300",
            isAnimating ? "scale-90 opacity-50" : "scale-100 opacity-100"
          )}>
            <BubblesSheep size="md" className="drop-shadow-lg" />
            <Sparkles className={cn(
              "absolute -top-1 -right-1 h-5 w-5 animate-pulse",
              style.accent
            )} />
          </div>
        </div>

        {/* Quote Content */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Quote className={cn("h-4 w-4", style.accent)} />
            <span className={cn("text-sm font-medium", style.accent)}>
              {style.label}
            </span>
          </div>
          
          <p className={cn(
            "text-lg md:text-xl font-display text-foreground leading-relaxed transition-all duration-300",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}>
            "{currentQuote.text}"
          </p>
          
          <p className="text-sm text-muted-foreground italic">
            — Bubbles, Wicklow Institute of Uncertain Studies
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={rotateQuote}
          disabled={isAnimating}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isAnimating && "animate-spin")} />
          Another wisdom
        </Button>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            autoRotate ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"
          )} />
          {autoRotate ? "Auto-rotating" : "Paused"}
        </div>
      </div>
    </Card>
  );
}
