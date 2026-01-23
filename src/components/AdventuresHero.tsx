import { useMemo } from "react";
import { motion } from "framer-motion";
import { BubblesExplorer } from "./BubblesExplorer";
import { Compass, Mountain, Map } from "lucide-react";

/**
 * ADVENTURES HERO — Wicklow wilderness-themed hero
 * Features BubblesExplorer with mountain/nature backdrop
 */

interface AdventuresHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

type TerrainMood = "sunny" | "misty" | "golden";

function WildernessBackdrop() {
  const mood = useMemo<TerrainMood>(() => {
    const moods: TerrainMood[] = ["sunny", "misty", "golden"];
    return moods[Math.floor(Math.random() * moods.length)];
  }, []);

  const palettes = {
    sunny: {
      sky: "from-sky-100/80 via-blue-50/60 to-cyan-50/40",
      mountain: "hsl(220 15% 45%)",
      hill: "hsl(120 25% 45%)",
      grass: "hsl(100 40% 50%)",
    },
    misty: {
      sky: "from-slate-100/80 via-gray-100/60 to-slate-50/40",
      mountain: "hsl(220 10% 55%)",
      hill: "hsl(120 15% 50%)",
      grass: "hsl(100 30% 55%)",
    },
    golden: {
      sky: "from-amber-50/80 via-orange-50/60 to-yellow-50/40",
      mountain: "hsl(30 20% 45%)",
      hill: "hsl(80 30% 45%)",
      grass: "hsl(70 40% 50%)",
    },
  };

  const palette = palettes[mood];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Sky gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${palette.sky}`} />

      {/* Mountains silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 h-3/4 opacity-40" viewBox="0 0 400 200" preserveAspectRatio="none">
        {/* Far mountain range */}
        <path 
          d="M 0 200 L 0 120 Q 40 80 80 110 Q 120 60 160 100 Q 200 50 240 90 Q 280 70 320 100 Q 360 80 400 120 L 400 200 Z" 
          fill={palette.mountain}
          opacity="0.5"
        />
        {/* Sugarloaf-inspired peak */}
        <path 
          d="M 120 200 L 120 140 Q 150 60 180 140 L 180 200 Z" 
          fill={palette.mountain}
          opacity="0.7"
        />
        {/* Rolling hills */}
        <path 
          d="M 0 200 L 0 160 Q 50 140 100 155 Q 150 130 200 150 Q 250 135 300 155 Q 350 145 400 160 L 400 200 Z" 
          fill={palette.hill}
          opacity="0.6"
        />
        {/* Foreground grass */}
        <path 
          d="M 0 200 L 0 180 Q 100 170 200 178 Q 300 168 400 180 L 400 200 Z" 
          fill={palette.grass}
          opacity="0.5"
        />
      </svg>

      {/* Floating clouds */}
      <motion.div
        className="absolute top-12 left-1/4 w-24 h-8 bg-white/30 rounded-full blur-sm"
        animate={{ x: [-10, 10, -10] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-8 right-1/3 w-16 h-6 bg-white/25 rounded-full blur-sm"
        animate={{ x: [10, -10, 10] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Flying birds */}
      <motion.svg
        className="absolute top-16 left-1/3 w-8 h-4 opacity-30"
        viewBox="0 0 30 10"
        animate={{ x: [0, 50, 0], y: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M 0 5 Q 5 2 10 5" stroke="currentColor" strokeWidth="1" fill="none" className="text-foreground" />
        <path d="M 10 5 Q 15 8 20 5" stroke="currentColor" strokeWidth="1" fill="none" className="text-foreground" />
      </motion.svg>

      {/* Trail markers */}
      <div className="absolute bottom-20 left-12 opacity-20">
        <div className="w-4 h-8 bg-amber-700 rounded-t-sm" />
        <div className="w-6 h-3 bg-amber-600 -ml-1" />
      </div>
      <div className="absolute bottom-24 right-16 opacity-15">
        <div className="w-3 h-6 bg-amber-700 rounded-t-sm" />
        <div className="w-5 h-2 bg-amber-600 -ml-1" />
      </div>

      {/* Compass rose decoration */}
      <motion.svg
        className="absolute top-8 right-12 w-12 h-12 opacity-15"
        viewBox="0 0 50 50"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
        <path d="M 25 8 L 27 25 L 25 42 L 23 25 Z" fill="currentColor" className="text-foreground" opacity="0.5" />
        <path d="M 8 25 L 25 23 L 42 25 L 25 27 Z" fill="currentColor" className="text-foreground" opacity="0.3" />
        <circle cx="25" cy="25" r="3" fill="currentColor" className="text-foreground" opacity="0.4" />
      </motion.svg>

      {/* Map fragment */}
      <motion.div
        className="absolute bottom-16 right-20 w-16 h-12 bg-amber-100/40 rounded rotate-12 opacity-20"
        animate={{ rotate: [12, 8, 12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-2 left-2 w-8 h-px bg-amber-600/50" />
        <div className="absolute top-4 left-3 w-6 h-px bg-amber-600/40" />
        <div className="absolute top-6 left-2 w-10 h-px bg-amber-600/50" />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
    </div>
  );
}

export function AdventuresHero({ title, subtitle, className }: AdventuresHeroProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className || ""}`}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden">
          <WildernessBackdrop />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 md:py-16">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 justify-center md:justify-start mb-4"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  <Compass className="w-3 h-3" />
                  Directionally challenged
                </span>
              </motion.div>

              <motion.h1
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  className="text-lg md:text-xl text-muted-foreground max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Explorer credentials */}
              <motion.div
                className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Mountain className="w-3 h-3" />
                  Never Lost
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Map className="w-3 h-3" />
                  Maps Optional
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  Wicklow Native
                </span>
              </motion.div>
            </div>

            {/* Explorer Bubbles */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 blur-3xl bg-gradient-radial from-primary/15 to-transparent scale-150" />
              
              {/* Thought bubble */}
              <motion.div
                className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-background/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-border/50 max-w-[180px]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <p className="text-xs italic text-muted-foreground">
                  "North is wherever I'm facing. This is basic navigation."
                </p>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-background/90 rotate-45 border-r border-b border-border/50" />
              </motion.div>

              <BubblesExplorer size="hero" accessory="random" animated />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
