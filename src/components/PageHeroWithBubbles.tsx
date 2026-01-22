import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BubblesBog } from "@/components/BubblesBog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];
type PostureType = "four-legged" | "two-legged" | "half-upright" | "leaning";
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
  // Weighted: four-legged (35%), two-legged (35%), transitional (30%)
  const resolvedPosture = useMemo<PostureType>(() => {
    if (posture === "random") {
      const roll = Math.random();
      if (roll < 0.35) return "four-legged";
      if (roll < 0.70) return "two-legged";
      if (roll < 0.85) return "half-upright";
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
      "py-12 md:py-20 bg-gradient-to-b from-secondary/40 to-background relative overflow-hidden",
      className
    )}>
      {/* Wicklow weather effects - Sugarloaf Mountain, Killough */}
      <WicklowWeatherEffects />

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

// Weather types for Sugarloaf Mountain, Killough - famously eclectic!
type WeatherType = "cloudy" | "rainy" | "sunny" | "thunderstorm" | "misty";

// Weighted weather - rain and clouds more common (it's Ireland after all!)
const WEATHER_POOL: WeatherType[] = [
  "cloudy", "cloudy", "cloudy",
  "rainy", "rainy", "rainy", "rainy",
  "misty", "misty",
  "sunny",
  "thunderstorm",
];

// Wicklow weather system - Sugarloaf Mountain edition
function WicklowWeatherEffects() {
  // Random weather on mount
  const weather = useMemo<WeatherType>(() => 
    WEATHER_POOL[Math.floor(Math.random() * WEATHER_POOL.length)], []
  );

  // Generate clouds
  const clouds = useMemo(() =>
    Array.from({ length: weather === "sunny" ? 2 : 5 }, (_, i) => ({
      id: i,
      width: 80 + Math.random() * 120,
      height: 25 + Math.random() * 20,
      top: 5 + Math.random() * 25,
      duration: 25 + Math.random() * 20,
      delay: Math.random() * 15,
      opacity: weather === "thunderstorm" ? 0.4 : weather === "sunny" ? 0.15 : 0.25,
    })), [weather]
  );

  // Rain drops (more intense for thunderstorm)
  const rainDrops = useMemo(() => {
    if (weather !== "rainy" && weather !== "thunderstorm") return [];
    const count = weather === "thunderstorm" ? 30 : 15;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: weather === "thunderstorm" ? 0.6 + Math.random() * 0.4 : 1.2 + Math.random() * 0.8,
      delay: Math.random() * 2,
      height: weather === "thunderstorm" ? 15 + Math.random() * 20 : 8 + Math.random() * 12,
      angle: weather === "thunderstorm" ? 15 : 5,
    }));
  }, [weather]);

  // Mist layers
  const mistLayers = useMemo(() => {
    if (weather !== "misty" && weather !== "cloudy") return [];
    return Array.from({ length: weather === "misty" ? 6 : 3 }, (_, i) => ({
      id: i,
      width: 150 + Math.random() * 150,
      height: 40 + Math.random() * 30,
      top: 30 + Math.random() * 50,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * 10,
      opacity: weather === "misty" ? 0.08 : 0.04,
    }));
  }, [weather]);

  // Sun rays for sunny weather
  const sunRays = useMemo(() => {
    if (weather !== "sunny") return [];
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      rotation: -30 + i * 15,
      delay: i * 0.2,
    }));
  }, [weather]);

  // Lightning flashes for thunderstorm
  const [lightningFlash, setLightningFlash] = useState(false);
  
  useEffect(() => {
    if (weather !== "thunderstorm") return;
    
    const triggerLightning = () => {
      setLightningFlash(true);
      setTimeout(() => setLightningFlash(false), 150);
    };

    // Random lightning every 3-8 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) triggerLightning();
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [weather]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Sky gradient based on weather */}
      <div className={cn(
        "absolute inset-0 transition-colors duration-1000",
        weather === "sunny" && "bg-gradient-to-b from-sky-200/30 via-transparent to-transparent",
        weather === "cloudy" && "bg-gradient-to-b from-slate-300/20 via-transparent to-transparent",
        weather === "rainy" && "bg-gradient-to-b from-slate-400/25 via-slate-300/10 to-transparent",
        weather === "thunderstorm" && "bg-gradient-to-b from-slate-600/40 via-slate-500/20 to-transparent",
        weather === "misty" && "bg-gradient-to-b from-slate-200/30 via-slate-100/15 to-transparent",
      )} />

      {/* Lightning flash overlay */}
      <AnimatePresence>
        {lightningFlash && (
          <motion.div
            className="absolute inset-0 bg-white/30 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.3, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Sun (only for sunny weather) */}
      {weather === "sunny" && (
        <div className="absolute top-4 right-[15%] md:right-[20%]">
          {/* Sun disc */}
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-300 shadow-lg"
            style={{ boxShadow: "0 0 60px 20px rgba(253, 224, 71, 0.4)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Sun rays */}
          {sunRays.map((ray) => (
            <motion.div
              key={ray.id}
              className="absolute top-1/2 left-1/2 w-1 h-24 md:h-32 bg-gradient-to-b from-yellow-300/60 to-transparent origin-top"
              style={{ transform: `rotate(${ray.rotation}deg)`, marginLeft: -2 }}
              animate={{ opacity: [0.3, 0.7, 0.3], scaleY: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, delay: ray.delay }}
            />
          ))}
        </div>
      )}

      {/* Clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={`cloud-${cloud.id}`}
          className={cn(
            "absolute rounded-full blur-md",
            weather === "thunderstorm" ? "bg-slate-500/50" : "bg-white/40"
          )}
          style={{
            width: cloud.width,
            height: cloud.height,
            top: `${cloud.top}%`,
            opacity: cloud.opacity,
          }}
          initial={{ x: "-20vw" }}
          animate={{ x: "110vw" }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: "linear",
          }}
        >
          {/* Cloud puffs for more realistic shape */}
          <div className="absolute -top-2 left-1/4 w-1/2 h-full rounded-full bg-inherit" />
          <div className="absolute -top-3 left-1/2 w-1/3 h-3/4 rounded-full bg-inherit" />
        </motion.div>
      ))}

      {/* Rain drops */}
      {rainDrops.map((drop) => (
        <motion.div
          key={`rain-${drop.id}`}
          className={cn(
            "absolute w-px",
            weather === "thunderstorm" 
              ? "bg-gradient-to-b from-transparent via-slate-400/50 to-slate-300/30"
              : "bg-gradient-to-b from-transparent via-muted-foreground/30 to-muted-foreground/10"
          )}
          style={{
            left: `${drop.left}%`,
            height: drop.height,
            top: -30,
            transform: `rotate(${drop.angle}deg)`,
          }}
          animate={{
            y: [0, 500],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Mist layers */}
      {mistLayers.map((mist) => (
        <motion.div
          key={`mist-${mist.id}`}
          className="absolute rounded-full bg-muted-foreground/10 blur-3xl"
          style={{
            width: mist.width,
            height: mist.height,
            top: `${mist.top}%`,
            opacity: mist.opacity,
          }}
          initial={{ x: "-30vw" }}
          animate={{ x: "110vw" }}
          transition={{
            duration: mist.duration,
            repeat: Infinity,
            delay: mist.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Bog cotton puffs (always present - it's a bog!) */}
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={`cotton-${i}`}
          className="absolute rounded-full bg-bubbles-cream/50 blur-[1px]"
          style={{
            width: 4 + Math.random() * 5,
            height: 4 + Math.random() * 5,
            top: `${40 + Math.random() * 40}%`,
          }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: [0, 400],
            y: [0, -20, 10, -10, 0],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 3 + Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

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
function OrganicThoughtBubble({ text, mode }: { text: string; mode: BubblesMode }) {
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
      
      {/* Organic cloud shape using SVG */}
      <div className="relative">
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 4px 12px rgba(44, 44, 44, 0.08))" }}
        >
          {/* Organic cloud path - soft, irregular edges */}
          <path
            d="M 20 70 
               C 5 65, 5 45, 20 40
               C 15 25, 35 15, 55 20
               C 65 8, 90 5, 110 15
               C 130 5, 160 10, 175 25
               C 195 30, 198 50, 185 65
               C 195 80, 175 90, 155 85
               C 140 95, 100 98, 70 90
               C 45 95, 15 85, 20 70
               Z"
            fill={style.fill}
            stroke="hsl(28 15% 75%)"
            strokeWidth="0.5"
            opacity="0.95"
          />
          
          {/* Inner highlight for depth */}
          <path
            d="M 35 55 
               C 25 50, 30 35, 45 35
               C 50 25, 70 22, 90 28
               C 105 20, 130 22, 145 32
               C 160 35, 165 48, 158 58"
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
