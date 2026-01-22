import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi 
} from "@/components/ui/carousel";
import { ThoughtBubble } from "./ThoughtBubble";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { BubbleMode } from "@/data/thoughtBubbles";
import { cn } from "@/lib/utils";
import { Play, Pause, Sun, Moon, Sunrise, Sunset, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMood } from "@/contexts/MoodContext";
import { motion, AnimatePresence } from "framer-motion";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
  tags?: string[] | null;
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type MoodFilter = "all" | "match-mood" | BubblesMode;

const MODE_LABELS: Record<BubblesMode, string> = {
  innocent: "Innocent",
  concerned: "Concerned", 
  triggered: "Triggered",
  savage: "Savage",
  nuclear: "Nuclear",
};

const MODE_COLORS: Record<BubblesMode, string> = {
  innocent: "bg-mode-innocent/20 text-mode-innocent border-mode-innocent/30",
  concerned: "bg-mode-concerned/20 text-mode-concerned border-mode-concerned/30",
  triggered: "bg-mode-triggered/20 text-mode-triggered border-mode-triggered/30",
  savage: "bg-mode-savage/20 text-mode-savage border-mode-savage/30",
  nuclear: "bg-mode-nuclear/20 text-mode-nuclear border-mode-nuclear/30",
};

const TIME_CONFIG: Record<TimeOfDay, {
  icon: typeof Sun;
  label: string;
  suggestedModes: BubblesMode[];
  greeting: string;
}> = {
  morning: {
    icon: Sunrise,
    label: "Morning",
    suggestedModes: ["innocent", "concerned"],
    greeting: "Rise and bleat",
  },
  afternoon: {
    icon: Sun,
    label: "Afternoon",
    suggestedModes: ["innocent", "concerned", "triggered"],
    greeting: "Midday musings",
  },
  evening: {
    icon: Sunset,
    label: "Evening",
    suggestedModes: ["triggered", "savage"],
    greeting: "Evening edge",
  },
  night: {
    icon: Moon,
    label: "Night",
    suggestedModes: ["savage", "nuclear"],
    greeting: "Midnight chaos",
  },
};

// Map nuclear mode to savage for ThoughtBubble (since BubbleMode doesn't include nuclear)
const getDisplayMode = (mode: BubblesMode): BubbleMode => {
  if (mode === 'nuclear') return 'savage';
  return mode as BubbleMode;
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

interface ThoughtCarouselProps {
  /** Show time-of-day indicator and filter by appropriate moods */
  useTimeContext?: boolean;
  /** Allow user to filter by mood */
  showMoodFilter?: boolean;
  /** Match thoughts to global mood context */
  syncWithMood?: boolean;
  /** Compact mode for sidebar use */
  compact?: boolean;
  /** Override auto-rotation interval (ms) */
  interval?: number;
}

export function ThoughtCarousel({ 
  useTimeContext = true,
  showMoodFilter = true,
  syncWithMood = false,
  compact = false,
  interval = 4000,
}: ThoughtCarouselProps) {
  const [allThoughts, setAllThoughts] = useState<ThoughtData[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [moodFilter, setMoodFilter] = useState<MoodFilter>("all");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);
  
  const { currentMode } = useMood();

  // Update time of day periodically
  useEffect(() => {
    const checkTime = () => setTimeOfDay(getTimeOfDay());
    const timer = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch thoughts from database
  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode, tags')
        .eq('is_curated', true) // Only curated thoughts
        .limit(50);

      if (error) {
        console.error('Error fetching thoughts:', error);
        // Fallback to non-curated
        const { data: fallbackData } = await supabase
          .from('bubbles_thoughts')
          .select('id, text, mode, tags')
          .limit(30);
        
        if (fallbackData) {
          setAllThoughts(fallbackData);
        }
        return;
      }

      if (data && data.length > 0) {
        setAllThoughts(data);
      }
    }

    fetchThoughts();
  }, []);

  // Filter thoughts based on time, mood filter, and sync settings
  const filteredThoughts = useMemo(() => {
    let filtered = [...allThoughts];

    // Apply mood filter
    if (moodFilter === "match-mood" && syncWithMood) {
      filtered = filtered.filter(t => t.mode === currentMode);
    } else if (moodFilter !== "all" && moodFilter !== "match-mood") {
      filtered = filtered.filter(t => t.mode === moodFilter);
    }

    // Apply time-of-day context (if enabled and no specific mood selected)
    if (useTimeContext && moodFilter === "all") {
      const timeConfig = TIME_CONFIG[timeOfDay];
      // Weight thoughts by time-appropriate moods
      const prioritized = filtered.sort((a, b) => {
        const aScore = timeConfig.suggestedModes.includes(a.mode) ? 1 : 0;
        const bScore = timeConfig.suggestedModes.includes(b.mode) ? 1 : 0;
        return bScore - aScore;
      });
      // Take first 75% from prioritized, rest random
      const cutoff = Math.floor(prioritized.length * 0.75);
      const primary = prioritized.slice(0, cutoff);
      const secondary = prioritized.slice(cutoff).sort(() => Math.random() - 0.5);
      filtered = [...primary, ...secondary];
    } else {
      // Just shuffle
      filtered = filtered.sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [allThoughts, moodFilter, currentMode, syncWithMood, useTimeContext, timeOfDay]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-advance carousel
  useEffect(() => {
    if (!api || !isAutoPlaying || filteredThoughts.length === 0) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, interval);

    return () => clearInterval(timer);
  }, [api, isAutoPlaying, filteredThoughts.length, interval]);

  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  const shuffleThoughts = useCallback(() => {
    if (api) {
      const randomIndex = Math.floor(Math.random() * filteredThoughts.length);
      api.scrollTo(randomIndex);
    }
  }, [api, filteredThoughts.length]);

  const TimeIcon = TIME_CONFIG[timeOfDay].icon;

  if (allThoughts.length === 0) {
    return (
      <div className={cn("w-full mx-auto", compact ? "max-w-md" : "max-w-4xl")}>
        <div className="h-32 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (filteredThoughts.length === 0) {
    return (
      <div className={cn("w-full mx-auto text-center py-8", compact ? "max-w-md" : "max-w-4xl")}>
        <p className="text-muted-foreground text-sm">No thoughts match this filter</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMoodFilter("all")}
          className="mt-2"
        >
          Show all thoughts
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full mx-auto", compact ? "max-w-md" : "max-w-4xl px-12")}>
      {/* Time & Mood Header */}
      {(useTimeContext || showMoodFilter) && !compact && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {/* Time of Day Indicator */}
          {useTimeContext && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
            >
              <TimeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {TIME_CONFIG[timeOfDay].greeting}
              </span>
            </motion.div>
          )}

          {/* Mood Filter Pills */}
          {showMoodFilter && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={moodFilter === "all" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setMoodFilter("all")}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                All
              </Badge>
              {syncWithMood && (
                <Badge
                  variant={moodFilter === "match-mood" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setMoodFilter("match-mood")}
                >
                  Match Mood
                </Badge>
              )}
              {(["innocent", "triggered", "savage"] as BubblesMode[]).map(mode => (
                <Badge
                  key={mode}
                  variant={moodFilter === mode ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-xs transition-all",
                    moodFilter === mode && MODE_COLORS[mode]
                  )}
                  onClick={() => setMoodFilter(moodFilter === mode ? "all" : mode)}
                >
                  {MODE_LABELS[mode]}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Carousel */}
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
            dragFree: false,
            containScroll: "trimSnaps",
            skipSnaps: false,
          }}
          className="w-full touch-pan-y"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            <AnimatePresence mode="popLayout">
              {filteredThoughts.map((thought, index) => (
                <CarouselItem 
                  key={thought.id} 
                  className={cn(
                    "pl-2 md:pl-4",
                    compact ? "basis-full" : "basis-full sm:basis-1/2 lg:basis-1/3"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "transition-all duration-300 h-full",
                      current === index 
                        ? "scale-100 opacity-100" 
                        : "scale-95 opacity-60"
                    )}
                  >
                    <ThoughtBubble 
                      mode={getDisplayMode(thought.mode)} 
                      size={compact ? "sm" : "sm"} 
                      className={cn(
                        "h-full",
                        compact ? "min-h-[80px]" : "min-h-[120px]"
                      )}
                    >
                      <div className="space-y-2">
                        <span className={cn(
                          "inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border",
                          MODE_COLORS[thought.mode]
                        )}>
                          {MODE_LABELS[thought.mode]}
                        </span>
                        <p className={cn(
                          "text-foreground/90 italic leading-relaxed",
                          compact ? "text-xs" : "text-sm"
                        )}>
                          "{thought.text}"
                        </p>
                      </div>
                    </ThoughtBubble>
                  </motion.div>
                </CarouselItem>
              ))}
            </AnimatePresence>
          </CarouselContent>
          {!compact && (
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>
      </div>

      {/* Controls row */}
      <div className={cn(
        "flex items-center justify-center gap-4 mt-4",
        compact && "gap-2"
      )}>
        {/* Play/Pause button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAutoPlay}
          className={cn(
            "rounded-full hover:bg-primary/10",
            compact ? "h-6 w-6" : "h-8 w-8"
          )}
          aria-label={isAutoPlaying ? "Pause autoplay" : "Play autoplay"}
        >
          {isAutoPlaying ? (
            <Pause className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
          ) : (
            <Play className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
          )}
        </Button>

        {/* Shuffle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={shuffleThoughts}
          className={cn(
            "rounded-full hover:bg-primary/10",
            compact ? "h-6 w-6" : "h-8 w-8"
          )}
          aria-label="Shuffle thoughts"
        >
          <Shuffle className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
        </Button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {filteredThoughts.slice(0, compact ? 4 : 6).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                compact ? "w-1.5 h-1.5" : "w-2 h-2",
                current === index 
                  ? cn("bg-primary", compact ? "w-3" : "w-4")
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          {filteredThoughts.length > (compact ? 4 : 6) && (
            <span className="text-xs text-muted-foreground ml-1">
              +{filteredThoughts.length - (compact ? 4 : 6)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
