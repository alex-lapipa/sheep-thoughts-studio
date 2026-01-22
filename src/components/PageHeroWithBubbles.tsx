import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BubblesBog } from "@/components/BubblesBog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type PostureType = "four-legged" | "two-legged";

interface Thought {
  id: string;
  text: string;
  mode: BubblesMode;
}

interface PageHeroWithBubblesProps {
  title: string;
  subtitle?: string;
  className?: string;
  bubbleSize?: "sm" | "md" | "lg";
  posture?: PostureType | "random";
  accessory?: "sunglasses" | "cap" | "bucket-hat" | "none";
}

// Fallback thoughts if database is empty
const FALLBACK_THOUGHTS: Thought[] = [
  { id: "f1", text: "Clouds are just fog that got promoted.", mode: "innocent" },
  { id: "f2", text: "The humans write things down because their wool doesn't remember.", mode: "concerned" },
  { id: "f3", text: "I have never been wrong. I have been early.", mode: "triggered" },
  { id: "f4", text: "Birds are not real. I've done the research.", mode: "savage" },
  { id: "f5", text: "The internet is stored in a cave somewhere. I've seen the cables.", mode: "concerned" },
  { id: "f6", text: "Rain is the sky's way of apologising. It has a lot to apologise for.", mode: "innocent" },
  { id: "f7", text: "Maps are opinions. The land doesn't agree with any of them.", mode: "triggered" },
  { id: "f8", text: "Fences exist because humans don't trust grass.", mode: "savage" },
];

export function PageHeroWithBubbles({
  title,
  subtitle,
  className,
  bubbleSize = "md",
  posture = "random",
  accessory = "none",
}: PageHeroWithBubblesProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(FALLBACK_THOUGHTS);
  
  // Random posture selection on mount (stable for component lifetime)
  const resolvedPosture = useMemo<PostureType>(() => {
    if (posture === "random") {
      return Math.random() > 0.5 ? "two-legged" : "four-legged";
    }
    return posture;
  }, [posture]);
  const [visibleThoughts, setVisibleThoughts] = useState<Array<Thought & { position: number; key: string }>>([]);

  // Fetch thoughts from RAG database
  useEffect(() => {
    async function fetchThoughts() {
      const { data, error } = await supabase
        .from('bubbles_thoughts')
        .select('id, text, mode')
        .limit(40);

      if (!error && data && data.length > 0) {
        setThoughts(data);
      }
    }

    fetchThoughts();
  }, []);

  // Generate random position for thought bubble (around Bubbles' head)
  const getRandomPosition = useCallback(() => {
    // Positions: 0=top-left, 1=top, 2=top-right, 3=right, 4=left
    return Math.floor(Math.random() * 5);
  }, []);

  // Add new thought bubble periodically
  useEffect(() => {
    if (thoughts.length === 0) return;

    const addThought = () => {
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      const newThought = {
        ...randomThought,
        position: getRandomPosition(),
        key: `${randomThought.id}-${Date.now()}`,
      };

      setVisibleThoughts(prev => {
        // Keep max 3 visible at a time
        const updated = [...prev, newThought].slice(-3);
        return updated;
      });
    };

    // Initial thought after short delay
    const initialTimeout = setTimeout(addThought, 800);

    // Add new thoughts every 3-5 seconds
    const interval = setInterval(() => {
      addThought();
    }, 3000 + Math.random() * 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [thoughts, getRandomPosition]);

  // Remove thoughts after they've been shown
  useEffect(() => {
    const cleanup = setInterval(() => {
      setVisibleThoughts(prev => {
        if (prev.length > 2) {
          return prev.slice(1);
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(cleanup);
  }, []);

  const bubbleSizeClasses = {
    sm: "w-32 h-32 md:w-40 md:h-40",
    md: "w-40 h-40 md:w-56 md:h-56",
    lg: "w-48 h-48 md:w-64 md:h-64",
  };

  const positionStyles: Record<number, string> = {
    0: "-top-8 -left-4 md:-top-12 md:-left-8",
    1: "-top-16 left-1/2 -translate-x-1/2 md:-top-20",
    2: "-top-8 -right-4 md:-top-12 md:-right-8",
    3: "top-1/4 -right-8 md:-right-16",
    4: "top-1/4 -left-8 md:-left-16",
  };

  return (
    <section className={cn(
      "py-12 md:py-20 bg-gradient-to-b from-secondary/40 to-background relative overflow-hidden",
      className
    )}>
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Bubbles with thought bubbles */}
          <div className="relative flex-shrink-0">
            {/* The mascot */}
            <div className={cn(bubbleSizeClasses[bubbleSize])}>
              <BubblesBog
                size={bubbleSize === "sm" ? "md" : bubbleSize === "md" ? "lg" : "xl"}
                posture={resolvedPosture}
                accessory={accessory}
                expression="certain"
                animated={false}
              />
            </div>

            {/* Animated thought bubbles */}
            <AnimatePresence>
              {visibleThoughts.map((thought) => (
                <motion.div
                  key={thought.key}
                  className={cn(
                    "absolute z-20 max-w-[180px] md:max-w-[220px]",
                    positionStyles[thought.position]
                  )}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <ThoughtBubblePopup text={thought.text} mode={thought.mode} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Connector bubbles (decorative) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
              <motion.div
                className="w-3 h-3 rounded-full bg-bubbles-cream border border-bubbles-peat/20"
                animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="absolute -top-2 left-1/2 translate-x-2 -translate-y-4">
              <motion.div
                className="w-2 h-2 rounded-full bg-bubbles-cream border border-bubbles-peat/20"
                animate={{ y: [0, -3, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Hero text */}
          <div className="text-center md:text-left flex-1">
            <motion.h1
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-accent/5 animate-drift" />
      <div className="absolute bottom-10 left-20 w-16 h-16 rounded-full bg-bubbles-gorse/10 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-10 w-12 h-12 rounded-full bg-bubbles-heather/10 animate-bounce-gentle" style={{ animationDelay: "0.5s" }} />
    </section>
  );
}

// Individual thought bubble popup
function ThoughtBubblePopup({ text, mode }: { text: string; mode: BubblesMode }) {
  const modeColors: Record<BubblesMode, string> = {
    innocent: "bg-mode-innocent/90 border-mode-innocent",
    concerned: "bg-mode-concerned/90 border-mode-concerned",
    triggered: "bg-mode-triggered/90 border-mode-triggered",
    savage: "bg-mode-savage/90 border-mode-savage",
    nuclear: "bg-mode-nuclear/90 border-mode-nuclear",
  };

  // Truncate long thoughts
  const displayText = text.length > 80 ? text.substring(0, 77) + "..." : text;

  return (
    <div
      className={cn(
        "relative px-3 py-2 rounded-xl border-2 shadow-lg backdrop-blur-sm",
        modeColors[mode]
      )}
    >
      <p className="text-xs md:text-sm font-display text-foreground leading-snug">
        "{displayText}"
      </p>
      
      {/* Bubble tail */}
      <div
        className={cn(
          "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r-2 border-b-2",
          modeColors[mode]
        )}
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
    </div>
  );
}
