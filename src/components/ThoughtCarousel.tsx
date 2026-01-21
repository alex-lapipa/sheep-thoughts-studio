import { useState, useEffect, useCallback } from "react";
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

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ThoughtData {
  id: string;
  text: string;
  mode: BubblesMode;
}

const MODE_LABELS: Record<BubblesMode, string> = {
  innocent: "Innocent",
  concerned: "Concerned", 
  triggered: "Triggered",
  savage: "Savage",
  nuclear: "Nuclear",
};

const MODE_COLORS: Record<BubblesMode, string> = {
  innocent: "bg-bubbles-cream text-green-700 border-green-200",
  concerned: "bg-bubbles-gorse/20 text-yellow-700 border-yellow-200",
  triggered: "bg-orange-100 text-orange-700 border-orange-200",
  savage: "bg-bubbles-heather/20 text-red-700 border-red-200",
  nuclear: "bg-bubbles-heather/40 text-purple-700 border-purple-200",
};

// Map nuclear mode to savage for ThoughtBubble (since BubbleMode doesn't include nuclear)
const getDisplayMode = (mode: BubblesMode): BubbleMode => {
  if (mode === 'nuclear') return 'savage';
  return mode as BubbleMode;
};

export function ThoughtCarousel() {
  const [thoughts, setThoughts] = useState<ThoughtData[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch diverse thoughts from database
  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .limit(12);

      if (error) {
        console.error('Error fetching thoughts:', error);
        return;
      }

      if (data && data.length > 0) {
        // Shuffle for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setThoughts(shuffled);
      }
    }

    fetchThoughts();
  }, []);

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
    if (!api || !isAutoPlaying || thoughts.length === 0) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, isAutoPlaying, thoughts.length]);

  const handleMouseEnter = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoPlaying(true);
  }, []);

  if (thoughts.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="h-32 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {thoughts.map((thought, index) => (
            <CarouselItem 
              key={thought.id} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <div 
                className={cn(
                  "transition-all duration-300 h-full",
                  current === index 
                    ? "scale-100 opacity-100" 
                    : "scale-95 opacity-60"
                )}
              >
                <ThoughtBubble mode={getDisplayMode(thought.mode)} size="sm" className="h-full min-h-[120px]">
                  <div className="space-y-2">
                    <span className={cn(
                      "inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      MODE_COLORS[thought.mode]
                    )}>
                      {MODE_LABELS[thought.mode]}
                    </span>
                    <p className="text-sm text-foreground/90 italic leading-relaxed">
                      "{thought.text}"
                    </p>
                  </div>
                </ThoughtBubble>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {thoughts.slice(0, 6).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              current === index 
                ? "bg-primary w-4" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
        {thoughts.length > 6 && (
          <span className="text-xs text-muted-foreground ml-1">+{thoughts.length - 6}</span>
        )}
      </div>
    </div>
  );
}
