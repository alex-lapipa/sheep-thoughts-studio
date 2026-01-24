import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThoughtBubble } from "./ThoughtBubble";
import { BubblesHeroImage } from "./BubblesHeroImage";
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
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const SPEED_OPTIONS = [0.5, 1, 2] as const;
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

    const baseDisplayTime = isLoopForever ? DISPLAY_DURATION_AMBIENT : DISPLAY_DURATION;
    const displayTime = baseDisplayTime / playbackSpeed;
    const fadeTime = FADE_DURATION / playbackSpeed;
    const pauseTime = PAUSE_BETWEEN / playbackSpeed;

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
        }, pauseTime);
      }, fadeTime);
    };

    // Start the cycle after display duration
    const interval = setInterval(cycle, displayTime + fadeTime + pauseTime);

    return () => clearInterval(interval);
  }, [thoughts, getNextThought, isPaused, isLoopForever, playbackSpeed]);

  return (
    <section className="hero-gradient py-12 md:py-20 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Mobile: Stack vertically, Desktop: Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Mobile: Character first for visual impact */}
          <div className="relative flex justify-center items-center order-1 lg:order-2">
            {/* Post-punk stencil Bubbles - the new brand standard */}
            <div className="relative">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 flex items-center justify-center animate-float">
                <BubblesHeroImage size="hero" className="w-full h-full drop-shadow-2xl" />
              </div>
            </div>
            
            {/* Thought Bubble - Mobile optimized positioning */}
            {currentThought && (
              <div 
                key={bubbleKey} 
                className="absolute -top-2 sm:-top-4 right-0 sm:right-4 md:right-8 max-w-[200px] sm:max-w-[240px] md:max-w-[260px] transition-all ease-in-out cursor-pointer group"
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
                  <p className="text-foreground italic text-sm sm:text-base group-hover:opacity-80 transition-opacity">"{currentThought.text}"</p>
                </ThoughtBubble>
                
                {/* First-visit hint tooltip - Hidden on small mobile */}
                {showHint && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in hidden sm:block">
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
                  <div className="relative w-12 sm:w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/60 rounded-full"
                      style={{
                        animation: (isPaused && !isLoopForever) ? 'none' : `progress ${(isLoopForever ? DISPLAY_DURATION_AMBIENT : DISPLAY_DURATION) / playbackSpeed}ms linear`,
                        animationFillMode: 'forwards',
                      }}
                    />
                  </div>
                  {isPaused && !isLoopForever && (
                    <span className="text-[10px] text-muted-foreground/70 animate-pulse hidden sm:inline">paused</span>
                  )}
                  {isLoopForever && (
                    <Repeat className="h-3 w-3 text-primary/60 animate-spin" style={{ animationDuration: '3s' }} />
                  )}
                </div>
              </div>
            )}
            
            {/* Playback controls - Hide on mobile for cleaner UI */}
            <div className="absolute -bottom-10 sm:-bottom-12 right-0 md:right-8 hidden sm:flex items-center gap-4">
              {/* Speed controls */}
              <div className="flex items-center gap-1">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                      playbackSpeed === speed 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              
              {/* Ambient toggle */}
              <div className="flex items-center gap-1.5">
                <label 
                  htmlFor="loop-forever" 
                  className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1"
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

          {/* Text Content */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left order-2 lg:order-1">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                {t("hero.meet")} <span className="text-accent">{t("hero.bubbles")}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                {t("hero.tagline")}
              </p>
            </div>
            
            {/* CTA Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to="/collections/all" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-foreground font-display text-base h-12 sm:h-11">
                  {t("hero.shopNow")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-display text-base h-12 sm:h-11">
                  {t("hero.theLore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}