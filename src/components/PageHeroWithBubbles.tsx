import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BubblesBog } from "@/components/BubblesBog";
import { WicklowHeroLandscape } from "@/components/WicklowHeroLandscape";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type PostureType = "four-legged" | "seated" | "grazing" | "leaning";
type AccessoryType = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "beanie" | "bow-tie" | "glasses" | "none";

// Weighted accessory pool - "none" appears often for grounded presence
const ACCESSORY_POOL: AccessoryType[] = [
  "none", "none", "none", "none",  // ~31% chance of no accessory
  "sunglasses",                     // ~6-7% each for accessories
  "cap",                   
  "bucket-hat",            
  "headphones",
  "scarf",
  "bandana",
  "flower-crown",
  "beanie",
  "bow-tie",
  "glasses",
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
  // Weighted: four-legged (40%), seated (25%), grazing (20%), leaning (15%)
  // NOTE: Bubbles is a sheep and must NEVER stand on two legs
  const resolvedPosture = useMemo<PostureType>(() => {
    if (posture === "random") {
      const roll = Math.random();
      if (roll < 0.40) return "four-legged";
      if (roll < 0.65) return "seated";
      if (roll < 0.85) return "grazing";
      return "leaning";
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
      {/* Large Wicklow landscape with dynamic weather and interactive controls */}
      <WicklowHeroLandscape weather="random" showTrees showWeatherControl />

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
// Weather type for cloud shape selection
type CloudWeather = 'calm' | 'windy' | 'rainy' | 'misty' | 'stormy';

// Cloud shapes organized by weather influence
const WEATHER_CLOUD_PATHS: Record<CloudWeather, Array<{
  main: string;
  highlight: string;
  name: string;
}>> = {
  // CALM: Classic fluffy, rounded clouds - peaceful Wicklow morning
  calm: [
    {
      name: "Classic fluffy",
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
    {
      name: "Wide puffy",
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
    {
      name: "Compact rounded",
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
  ],

  // WINDY: Stretched, swept, trailing wisps - Atlantic breeze
  windy: [
    {
      name: "Wind-swept drift",
      main: `M 5 58
             C -2 52, 2 38, 18 35
             C 25 22, 50 18, 75 22
             C 95 15, 125 12, 155 18
             C 180 12, 200 20, 210 38
             C 218 50, 212 62, 195 68
             C 175 78, 140 82, 105 78
             C 70 85, 35 82, 15 72
             C 0 68, -2 62, 5 58
             Z`,
      highlight: `M 25 48
                  C 18 44, 28 32, 48 30
                  C 72 22, 110 20, 145 26
                  C 175 22, 195 30, 200 42`,
    },
    {
      name: "Wispy trailing",
      main: `M 8 60
             C 0 55, 5 42, 22 40
             C 18 28, 42 20, 68 24
             C 92 16, 128 14, 160 22
             C 188 16, 208 28, 212 45
             C 215 58, 205 68, 185 72
             C 158 80, 118 82, 80 76
             C 48 82, 20 75, 12 68
             C 2 65, 0 62, 8 60
             Z`,
      highlight: `M 28 50
                  C 20 46, 32 35, 55 34
                  C 85 26, 130 24, 168 32
                  C 192 35, 200 45, 195 52`,
    },
    {
      name: "Stretched cirrus",
      main: `M 2 55
             C -5 48, 5 35, 25 32
             C 35 20, 65 15, 100 20
             C 135 14, 175 18, 200 32
             C 218 42, 215 58, 198 65
             C 172 75, 130 78, 88 74
             C 50 80, 18 72, 8 65
             C -2 60, -5 55, 2 55
             Z`,
      highlight: `M 30 46
                  C 22 42, 38 32, 65 30
                  C 100 24, 150 25, 185 35
                  C 200 40, 202 48, 195 52`,
    },
  ],

  // RAINY: Heavy, dense, drooping bottoms - Irish soft day
  rainy: [
    {
      name: "Heavy nimbus",
      main: `M 18 75
             C 5 72, 2 55, 18 48
             C 12 35, 32 22, 58 26
             C 78 12, 108 10, 138 18
             C 165 10, 188 22, 192 40
             C 200 52, 198 68, 182 78
             C 162 88, 130 92, 100 90
             C 68 94, 38 90, 22 82
             C 8 80, 5 76, 18 75
             Z`,
      highlight: `M 35 55
                  C 25 50, 35 38, 55 36
                  C 78 28, 115 26, 145 34
                  C 170 30, 182 40, 178 50`,
    },
    {
      name: "Drooping cumulus",
      main: `M 15 78
             C 2 74, 0 58, 15 50
             C 8 38, 28 25, 55 28
             C 75 15, 105 12, 140 20
             C 168 12, 190 25, 195 45
             C 202 58, 198 72, 182 80
             C 158 90, 122 94, 88 90
             C 55 96, 28 88, 18 82
             C 5 80, 2 76, 15 78
             Z`,
      highlight: `M 32 56
                  C 22 52, 32 40, 52 38
                  C 75 30, 112 28, 148 36
                  C 175 32, 185 45, 180 55`,
    },
    {
      name: "Laden grey",
      main: `M 20 80
             C 5 76, 5 60, 20 52
             C 15 40, 38 28, 65 32
             C 88 18, 120 15, 152 24
             C 178 16, 195 32, 198 50
             C 205 65, 200 78, 180 85
             C 155 94, 115 96, 78 92
             C 45 98, 22 90, 16 84
             C 6 82, 5 78, 20 80
             Z`,
      highlight: `M 38 58
                  C 28 54, 40 42, 62 40
                  C 90 32, 130 30, 162 40
                  C 182 36, 190 48, 185 58`,
    },
  ],

  // MISTY: Soft edges, diffused, ethereal - morning bog fog
  misty: [
    {
      name: "Fog wisp",
      main: `M 12 62
             C 2 58, 8 45, 25 44
             C 22 35, 42 28, 65 32
             C 85 24, 115 22, 145 28
             C 172 22, 192 32, 195 48
             C 200 60, 195 70, 178 74
             C 155 82, 120 84, 85 80
             C 52 86, 25 78, 18 72
             C 5 68, 2 64, 12 62
             Z`,
      highlight: `M 32 52
                  C 24 48, 35 40, 55 40
                  C 80 34, 120 33, 155 40
                  C 178 38, 185 48, 180 55`,
    },
    {
      name: "Ethereal drift",
      main: `M 8 60
             C 0 56, 5 44, 22 42
             C 18 32, 40 25, 68 30
             C 95 22, 130 20, 162 28
             C 188 22, 205 35, 208 52
             C 212 65, 205 75, 185 78
             C 158 86, 118 88, 80 82
             C 45 88, 18 80, 12 72
             C 2 68, 0 62, 8 60
             Z`,
      highlight: `M 28 50
                  C 20 46, 32 38, 58 38
                  C 92 32, 138 31, 172 40
                  C 192 38, 198 50, 192 58`,
    },
    {
      name: "Valley mist",
      main: `M 10 65
             C 0 60, 5 48, 22 46
             C 18 36, 45 28, 75 34
             C 105 26, 145 24, 175 34
             C 198 28, 212 42, 212 58
             C 215 72, 205 80, 182 82
             C 150 90, 108 92, 68 86
             C 35 92, 12 82, 8 74
             C 0 70, -2 66, 10 65
             Z`,
      highlight: `M 30 54
                  C 22 50, 38 42, 65 42
                  C 102 36, 152 35, 185 45
                  C 200 45, 202 55, 195 60`,
    },
  ],

  // STORMY: Dramatic, turbulent edges, anvil shapes - Wicklow gale
  stormy: [
    {
      name: "Turbulent anvil",
      main: `M 15 72
             C 0 68, -2 50, 15 42
             C 8 28, 35 12, 65 18
             C 90 5, 130 2, 165 15
             C 195 5, 215 22, 218 45
             C 222 62, 212 78, 188 85
             C 158 95, 110 98, 65 90
             C 32 96, 8 85, 12 78
             C 2 75, 0 72, 15 72
             Z`,
      highlight: `M 35 52
                  C 22 46, 38 30, 62 28
                  C 95 18, 145 16, 180 28
                  C 202 25, 210 42, 205 55`,
    },
    {
      name: "Cumulonimbus tower",
      main: `M 20 78
             C 5 74, 0 55, 18 45
             C 10 30, 38 10, 72 18
             C 100 2, 145 0, 180 15
             C 210 5, 225 28, 222 52
             C 228 70, 215 85, 185 90
             C 148 100, 95 102, 55 92
             C 25 98, 5 88, 15 80
             C 2 78, 0 75, 20 78
             Z`,
      highlight: `M 40 55
                  C 25 48, 42 28, 70 26
                  C 105 15, 158 14, 192 28
                  C 212 25, 218 45, 210 58`,
    },
    {
      name: "Gale-torn",
      main: `M 10 70
             C -5 65, 0 48, 20 40
             C 12 25, 42 10, 78 18
             C 110 2, 155 0, 188 18
             C 218 8, 232 30, 228 55
             C 235 72, 218 88, 185 92
             C 145 102, 92 104, 50 94
             C 20 100, -2 85, 8 75
             C -5 72, -8 68, 10 70
             Z`,
      highlight: `M 35 52
                  C 20 45, 42 25, 75 24
                  C 115 14, 168 15, 200 30
                  C 220 28, 225 48, 218 60`,
    },
  ],
};

// Flatten for random selection (backwards compatible)
const CLOUD_PATHS = Object.values(WEATHER_CLOUD_PATHS).flat();

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

  // Randomized animation delay for natural staggering
  const morphDelayClass = useMemo(() => {
    const delays = ['', 'cloud-morph-delay-1', 'cloud-morph-delay-2', 'cloud-morph-delay-3'];
    return delays[Math.floor(Math.random() * delays.length)];
  }, []);

  return (
    <div className="relative">
      {/* Atmospheric glow - like fog around the thought */}
      <div 
        className="absolute inset-0 blur-xl rounded-full cloud-glow-pulse"
        style={{ 
          backgroundColor: style.fill, 
          opacity: style.glowOpacity,
          transform: "scale(1.3)",
        }}
      />
      
      {/* Organic cloud shape using SVG - randomized variant with morphing */}
      <div className={`relative cloud-morph ${morphDelayClass}`}>
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-auto"
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
          className="w-2.5 h-2.5 rounded-full blur-[0.3px] cloud-glow-pulse"
          style={{ backgroundColor: style.fill, opacity: 0.8 }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full blur-[0.2px] mt-1 cloud-glow-pulse"
          style={{ backgroundColor: style.fill, opacity: 0.6, animationDelay: '-2s' }}
        />
      </div>
    </div>
  );
}
