import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "./ThoughtBubble";
import { ArrowRight, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";
type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
}

const MODES: BubblesMode[] = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'];

// Timing constants for smooth reading experience
const FADE_DURATION = 600; // ms for fade in/out
const DISPLAY_DURATION = 6000; // ms to display thought (increased for reading)
const DISPLAY_DURATION_AMBIENT = 4000; // ms for ambient/loop mode (faster)
const PAUSE_BETWEEN = 800; // ms pause between thoughts

export function HeroSection() {
  const { t } = useLanguage();
  const [currentThought, setCurrentThought] = useState<ThoughtData | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoopForever, setIsLoopForever] = useState(false);

  // Show hint tooltip on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('bubbles-hint-seen');
    if (!hasSeenHint) {
      // Delay showing hint so user sees the bubble first
      const timer = setTimeout(() => setShowHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('bubbles-hint-seen', 'true');
  };

  // Fetch thoughts from database on mount
  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .in('mode', MODES)
        .limit(50);

      if (error) {
        console.error('Error fetching thoughts:', error);
        return;
      }

      if (data && data.length > 0) {
        setThoughts(data);
        // Set initial random thought
        const randomThought = data[Math.floor(Math.random() * data.length)];
        setCurrentThought(randomThought);
      }
    }

    fetchThoughts();
  }, []);

  // Get next random thought (avoiding repeat)
  const getNextThought = useCallback(() => {
    if (thoughts.length <= 1) return thoughts[0];
    let next = thoughts[Math.floor(Math.random() * thoughts.length)];
    while (next?.id === currentThought?.id && thoughts.length > 1) {
      next = thoughts[Math.floor(Math.random() * thoughts.length)];
    }
    return next;
  }, [thoughts, currentThought]);

  // Skip to next thought with animation
  const skipToNext = useCallback(() => {
    if (thoughts.length === 0) return;
    
    // Fade out quickly
    setIsVisible(false);
    
    setTimeout(() => {
      const nextThought = getNextThought();
      setCurrentThought(nextThought);
      setBubbleKey(prev => prev + 1);
      
      setTimeout(() => {
        setIsVisible(true);
      }, PAUSE_BETWEEN / 2); // Faster transition on click
    }, FADE_DURATION / 2); // Faster fade on click
  }, [thoughts, getNextThought]);

  // Smooth rotation: fade out → pause → change thought → fade in
  // Pauses when user hovers over the thought bubble (unless Loop Forever is on)
  useEffect(() => {
    if (thoughts.length === 0 || (isPaused && !isLoopForever)) return;

    const displayTime = isLoopForever ? DISPLAY_DURATION_AMBIENT : DISPLAY_DURATION;

    const cycle = () => {
      // Step 1: Fade out
      setIsVisible(false);
      
      // Step 2: After fade out, pause, then change thought
      setTimeout(() => {
        const nextThought = getNextThought();
        setCurrentThought(nextThought);
        setBubbleKey(prev => prev + 1);
        
        // Step 3: After pause, fade in
        setTimeout(() => {
          setIsVisible(true);
        }, PAUSE_BETWEEN);
      }, FADE_DURATION);
    };

    // Start the cycle after display duration
    const interval = setInterval(cycle, displayTime + FADE_DURATION + PAUSE_BETWEEN);

    return () => clearInterval(interval);
  }, [thoughts, getNextThought, isPaused, isLoopForever]);

  return (
    <section className="hero-gradient py-20 md:py-32 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                {t("hero.meet")} <span className="text-accent">{t("hero.bubbles")}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                {t("hero.tagline")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/collections/all">
                <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-display">
                  {t("hero.shopNow")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="font-display">
                  {t("hero.theLore")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Sheep Character - Stylized without emoji */}
          <div className="relative flex justify-center items-center">
            {/* Character representation - fluffy circle with face */}
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-bubbles-cream border-4 border-bubbles-heather shadow-2xl flex items-center justify-center animate-float">
                {/* Face features */}
                <div className="relative">
                  {/* Eyes */}
                  <div className="flex gap-6 mb-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-bubbles-peat" />
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-bubbles-peat" />
                  </div>
                  {/* Nose/mouth */}
                  <div className="w-6 h-3 md:w-8 md:h-4 mx-auto rounded-full bg-bubbles-heather/50" />
                </div>
              </div>
              
              {/* Wool texture circles */}
              <div className="absolute -top-4 -left-2 w-12 h-12 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
              <div className="absolute -top-2 right-0 w-10 h-10 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
              <div className="absolute top-8 -right-4 w-14 h-14 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
              <div className="absolute -bottom-2 -left-4 w-10 h-10 rounded-full bg-bubbles-cream/80 border-2 border-bubbles-heather/30" />
            </div>
            
            {/* Thought Bubble with smooth transitions - pauses on hover */}
            {currentThought && (
              <div 
                key={bubbleKey} 
                className="absolute -top-4 right-0 md:right-8 max-w-[260px] transition-all ease-in-out cursor-pointer group"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
                  transitionDuration: `${FADE_DURATION}ms`,
                }}
                onClick={() => {
                  skipToNext();
                  dismissHint();
                }}
                onMouseEnter={() => {
                  setIsPaused(true);
                  dismissHint();
                }}
                onMouseLeave={() => setIsPaused(false)}
                title="Click to skip to next thought"
              >
                <ThoughtBubble mode={currentThought.mode as any} size="md">
                  <p className="text-foreground italic group-hover:opacity-80 transition-opacity">"{currentThought.text}"</p>
                </ThoughtBubble>
                
                {/* First-visit hint tooltip */}
                {showHint && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in">
                    <div className="bg-foreground text-background text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                      <span>Hover to pause • Click to skip</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissHint();
                        }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
                  </div>
                )}
                {/* Progress indicator */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  <div className="relative w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/60 rounded-full"
                      style={{
                        animation: (isPaused && !isLoopForever) ? 'none' : `progress ${isLoopForever ? DISPLAY_DURATION_AMBIENT : DISPLAY_DURATION}ms linear`,
                        animationFillMode: 'forwards',
                      }}
                    />
                  </div>
                  {isPaused && !isLoopForever && (
                    <span className="text-[10px] text-muted-foreground/70 animate-pulse">paused</span>
                  )}
                  {isLoopForever && (
                    <Repeat className="h-3 w-3 text-primary/60 animate-spin" style={{ animationDuration: '3s' }} />
                  )}
                </div>
              </div>
            )}
            
            {/* Loop Forever toggle */}
            <div className="absolute -bottom-12 right-0 md:right-8 flex items-center gap-2">
              <label 
                htmlFor="loop-forever" 
                className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5"
              >
                <Repeat className="h-3 w-3" />
                Ambient
              </label>
              <Switch
                id="loop-forever"
                checked={isLoopForever}
                onCheckedChange={setIsLoopForever}
                className="scale-75"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}