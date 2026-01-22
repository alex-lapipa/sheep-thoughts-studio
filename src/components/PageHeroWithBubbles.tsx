import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BubblesBog } from "@/components/BubblesBog";
import { WicklowHeroLandscape } from "@/components/WicklowHeroLandscape";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type PostureType = "four-legged" | "two-legged" | "half-upright" | "leaning" | "seated";
type AccessoryType = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none";

// Weighted accessory pool - "none" appears often for grounded presence
const ACCESSORY_POOL: AccessoryType[] = [
  "none", "none", "none", "none",  // ~36% chance of no accessory
  "sunglasses",                     // ~9% each for accessories
  "cap",                   
  "bucket-hat",            
  "headphones",
  "scarf",
  "bandana",
  "flower-crown",
];

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
  accessory?: AccessoryType | "random";
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
  accessory = "random",
}: PageHeroWithBubblesProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(FALLBACK_THOUGHTS);
  
  // Random posture selection on mount (stable for component lifetime)
  // Weighted: four-legged (30%), two-legged (30%), transitional (25%), seated (15%)
  const resolvedPosture = useMemo<PostureType>(() => {
    if (posture === "random") {
      const roll = Math.random();
      if (roll < 0.30) return "four-legged";
      if (roll < 0.60) return "two-legged";
      if (roll < 0.75) return "half-upright";
      if (roll < 0.88) return "leaning";
      return "seated";
    }
    return posture;
  }, [posture]);

  // Random accessory selection - mismatched human-absorbed styling
  const resolvedAccessory = useMemo<AccessoryType>(() => {
    if (accessory === "random") {
      return ACCESSORY_POOL[Math.floor(Math.random() * ACCESSORY_POOL.length)];
    }
    return accessory;
  }, [accessory]);
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

  // Generate random position for thought bubble (always originating from head area)
  const getRandomPosition = useCallback(() => {
    // Positions: 0=top-left of head, 1=top-center of head, 2=top-right of head
    // All positions now anchor to upper portion where head is located
    return Math.floor(Math.random() * 3);
  }, []);

  // Add new thought bubble periodically - slower, one at a time for readability
  useEffect(() => {
    if (thoughts.length === 0) return;

    const addThought = () => {
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      const newThought = {
        ...randomThought,
        position: getRandomPosition(),
        key: `${randomThought.id}-${Date.now()}`,
      };

      // Only one primary thought at a time for readability
      setVisibleThoughts([newThought]);
    };

    // Initial thought after delay
    const initialTimeout = setTimeout(addThought, 1200);

    // Add new thoughts every 6-9 seconds (long enough to read comfortably)
    const interval = setInterval(() => {
      addThought();
    }, 6000 + Math.random() * 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [thoughts, getRandomPosition]);

  const bubbleSizeClasses = {
    sm: "w-32 h-32 md:w-40 md:h-40",
    md: "w-40 h-40 md:w-56 md:h-56",
    lg: "w-48 h-48 md:w-64 md:h-64",
  };

  // All positions anchor to head area (top portion of mascot)
  const positionStyles: Record<number, string> = {
    0: "top-0 -left-2 -translate-y-full md:-left-4",           // Above head, left
    1: "-top-4 left-1/2 -translate-x-1/2 -translate-y-full",   // Above head, center
    2: "top-0 -right-2 -translate-y-full md:-right-4",         // Above head, right
  };

  return (
    <section className={cn(
      "min-h-[50vh] md:min-h-[60vh] lg:min-h-[65vh] py-16 md:py-24 lg:py-32 relative overflow-hidden",
      className
    )}>
      {/* Large Wicklow landscape with dynamic weather */}
      <WicklowHeroLandscape weather="random" showTrees />

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Bubbles with thought bubbles */}
          <div className="relative flex-shrink-0">
            {/* The mascot */}
            <div className={cn(bubbleSizeClasses[bubbleSize])}>
              <BubblesBog
                size={bubbleSize === "sm" ? "md" : bubbleSize === "md" ? "lg" : "xl"}
                posture={resolvedPosture}
                accessory={resolvedAccessory}
                expression="certain"
                animated={false}
              />
            </div>

            {/* Animated thought bubbles - organic, cloud-like emergence */}
            <AnimatePresence mode="wait">
              {visibleThoughts.map((thought) => (
                <motion.div
                  key={thought.key}
                  className={cn(
                    "absolute z-20 max-w-[200px] md:max-w-[260px]",
                    positionStyles[thought.position]
                  )}
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: [0, -4, 0],
                  }}
                  exit={{ opacity: 0, scale: 0.85, y: -8 }}
                  transition={{
                    opacity: { duration: 0.8, ease: "easeOut" },
                    scale: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
                    y: { 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    },
                  }}
                >
                  <OrganicThoughtBubble text={thought.text} mode={thought.mode} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Soft connector bubbles - clustered, not comic-trail */}
            <AnimatePresence>
              {visibleThoughts.length > 0 && (
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Soft bubble cluster - organic shapes */}
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-4 h-4 rounded-full bg-bubbles-cream/70 border border-bubbles-peat/10 blur-[0.5px]" />
                    <div className="absolute -top-2 -right-1 w-2.5 h-2.5 rounded-full bg-bubbles-cream/60 border border-bubbles-peat/10 blur-[0.3px]" />
                    <div className="absolute -top-1 left-1 w-2 h-2 rounded-full bg-bubbles-cream/50 border border-bubbles-peat/10 blur-[0.2px]" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
    </section>
  );
}

// Old WicklowWeatherEffects removed - now using WicklowHeroLandscape component

/**
 * ORGANIC THOUGHT BUBBLE
 * 
 * Design principles:
 * - Cloud-like, irregular, organic shapes (not geometric)
 * - Soft, muted Wicklow-palette colors
 * - Text readable and calmly presented
 * - Harmonizes with bog mist atmosphere
 * - No comic-strip styling or abrupt animations
 */
// Multiple cloud shape variations to prevent repetition
const CLOUD_PATHS = [
  // Variant 0: Classic fluffy cloud
  {
    main: `M 20 70 
           C 5 65, 5 45, 20 40
           C 15 25, 35 15, 55 20
           C 65 8, 90 5, 110 15
           C 130 5, 160 10, 175 25
           C 195 30, 198 50, 185 65
           C 195 80, 175 90, 155 85
           C 140 95, 100 98, 70 90
           C 45 95, 15 85, 20 70
           Z`,
    highlight: `M 35 55 
                C 25 50, 30 35, 45 35
                C 50 25, 70 22, 90 28
                C 105 20, 130 22, 145 32
                C 160 35, 165 48, 158 58`,
  },
  // Variant 1: Wide puffy cloud
  {
    main: `M 15 65
           C 2 60, 0 42, 18 38
           C 12 22, 38 12, 60 18
           C 78 5, 105 3, 130 12
           C 155 3, 180 8, 190 28
           C 200 35, 200 55, 188 68
           C 198 82, 170 92, 145 88
           C 120 96, 80 98, 55 90
           C 30 95, 8 80, 15 65
           Z`,
    highlight: `M 30 50
                C 20 45, 25 32, 42 32
                C 55 20, 85 18, 110 25
                C 135 18, 165 22, 175 35
                C 182 42, 180 52, 172 58`,
  },
  // Variant 2: Tall cumulus-style
  {
    main: `M 25 72
           C 8 68, 5 50, 22 42
           C 10 28, 30 10, 58 16
           C 72 2, 100 0, 125 10
           C 148 2, 172 8, 182 24
           C 198 32, 198 52, 185 65
           C 195 78, 178 88, 158 84
           C 135 94, 95 96, 68 88
           C 40 94, 12 82, 25 72
           Z`,
    highlight: `M 40 52
                C 28 46, 32 30, 50 28
                C 62 15, 95 12, 120 20
                C 145 12, 168 18, 175 32
                C 185 40, 182 50, 172 56`,
  },
  // Variant 3: Asymmetric drift cloud
  {
    main: `M 18 68
           C 5 62, 8 45, 25 42
           C 20 28, 42 18, 65 22
           C 82 10, 108 8, 135 15
           C 158 8, 178 15, 188 32
           C 198 42, 195 58, 182 68
           C 192 80, 168 90, 142 86
           C 115 95, 75 95, 50 88
           C 28 92, 10 78, 18 68
           Z`,
    highlight: `M 38 52
                C 25 48, 30 35, 48 34
                C 62 22, 92 18, 118 25
                C 142 18, 162 24, 172 38
                C 180 46, 175 55, 165 58`,
  },
  // Variant 4: Compact rounded cloud
  {
    main: `M 22 68
           C 10 62, 10 48, 25 44
           C 22 32, 40 22, 62 26
           C 78 14, 102 12, 125 20
           C 148 12, 168 18, 178 32
           C 192 40, 192 55, 180 66
           C 190 78, 165 86, 145 82
           C 122 90, 85 92, 60 85
           C 38 90, 15 78, 22 68
           Z`,
    highlight: `M 38 52
                C 28 48, 32 38, 48 36
                C 60 26, 88 24, 110 30
                C 132 24, 155 28, 165 38
                C 175 45, 172 52, 162 56`,
  },
  // Variant 5: Wispy stretched cloud
  {
    main: `M 12 66
           C 2 60, 5 45, 20 42
           C 15 30, 35 20, 55 24
           C 70 12, 95 8, 120 14
           C 145 6, 170 12, 185 28
           C 200 38, 198 55, 185 65
           C 195 78, 172 88, 148 84
           C 118 92, 78 94, 52 86
           C 28 92, 5 78, 12 66
           Z`,
    highlight: `M 32 50
                C 20 46, 26 34, 45 32
                C 60 22, 90 18, 115 24
                C 140 18, 168 22, 178 35
                C 188 44, 182 54, 170 58`,
  },
];

function OrganicThoughtBubble({ text, mode }: { text: string; mode: BubblesMode }) {
  // Stable random cloud variant for this bubble instance
  const cloudVariant = useMemo(() => 
    CLOUD_PATHS[Math.floor(Math.random() * CLOUD_PATHS.length)], 
  []);

  // Muted, atmospheric colors that harmonize with Wicklow landscape
  // Mode escalation is subtle, not garish
  const modeStyles: Record<BubblesMode, { 
    fill: string;
    textColor: string;
    glowOpacity: number;
  }> = {
    innocent: {
      fill: "hsl(45 30% 92%)", // Warm cream - bog cotton
      textColor: "hsl(28 25% 25%)",
      glowOpacity: 0.15,
    },
    concerned: {
      fill: "hsl(210 25% 88%)", // Misty grey-blue
      textColor: "hsl(210 20% 22%)",
      glowOpacity: 0.2,
    },
    triggered: {
      fill: "hsl(35 35% 85%)", // Warm bracken tint
      textColor: "hsl(28 30% 20%)",
      glowOpacity: 0.25,
    },
    savage: {
      fill: "hsl(330 25% 88%)", // Muted heather
      textColor: "hsl(330 20% 18%)",
      glowOpacity: 0.3,
    },
    nuclear: {
      fill: "hsl(50 40% 88%)", // Soft gorse hint
      textColor: "hsl(45 30% 15%)",
      glowOpacity: 0.35,
    },
  };

  const style = modeStyles[mode];

  // Allow longer text for readability - no aggressive truncation
  const displayText = text.length > 120 ? text.substring(0, 117) + "…" : text;

  return (
    <div className="relative">
      {/* Atmospheric glow - like fog around the thought */}
      <div 
        className="absolute inset-0 blur-xl rounded-full"
        style={{ 
          backgroundColor: style.fill, 
          opacity: style.glowOpacity,
          transform: "scale(1.3)",
        }}
      />
      
      {/* Organic cloud shape using SVG - randomized variant */}
      <div className="relative">
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 4px 12px rgba(44, 44, 44, 0.08))" }}
        >
          {/* Organic cloud path - soft, irregular edges */}
          <path
            d={cloudVariant.main}
            fill={style.fill}
            stroke="hsl(28 15% 75%)"
            strokeWidth="0.5"
            opacity="0.95"
          />
          
          {/* Inner highlight for depth */}
          <path
            d={cloudVariant.highlight}
            fill="none"
            stroke="hsl(0 0% 100%)"
            strokeWidth="1"
            opacity="0.3"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Text overlay - positioned within cloud bounds */}
        <div className="absolute inset-0 flex items-center justify-center px-6 py-4 md:px-8 md:py-5">
          <p 
            className="text-xs md:text-sm leading-relaxed text-center font-sans"
            style={{ color: style.textColor }}
          >
            {displayText}
          </p>
        </div>
      </div>
      
      {/* Soft origin cluster - not comic-trail dots */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        <div 
          className="w-2.5 h-2.5 rounded-full blur-[0.3px]"
          style={{ backgroundColor: style.fill, opacity: 0.8 }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full blur-[0.2px] mt-1"
          style={{ backgroundColor: style.fill, opacity: 0.6 }}
        />
      </div>
    </div>
  );
}
