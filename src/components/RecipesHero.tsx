import { useMemo } from "react";
import { motion } from "framer-motion";
import { BubblesChef } from "./BubblesChef";
import { Utensils, ChefHat, Flame } from "lucide-react";

/**
 * RECIPES HERO — Kitchen-themed hero for the Recipes page
 * Features BubblesChef with a warm kitchen backdrop
 */

interface RecipesHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

type KitchenMood = "morning" | "afternoon" | "evening";

function KitchenBackdrop() {
  const mood = useMemo<KitchenMood>(() => {
    const moods: KitchenMood[] = ["morning", "afternoon", "evening"];
    return moods[Math.floor(Math.random() * moods.length)];
  }, []);

  const palettes = {
    morning: {
      bg: "from-amber-50/80 via-orange-50/60 to-yellow-50/40",
      counter: "hsl(25 30% 45%)",
      accent: "hsl(35 70% 55%)",
      steam: "hsl(0 0% 95%)",
    },
    afternoon: {
      bg: "from-orange-50/80 via-amber-50/60 to-rose-50/40",
      counter: "hsl(20 35% 40%)",
      accent: "hsl(15 65% 50%)",
      steam: "hsl(0 0% 90%)",
    },
    evening: {
      bg: "from-rose-50/80 via-orange-50/60 to-amber-50/40",
      counter: "hsl(15 30% 35%)",
      accent: "hsl(25 60% 45%)",
      steam: "hsl(0 0% 85%)",
    },
  };

  const palette = palettes[mood];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Warm gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.bg}`} />

      {/* Tile pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-8">
        <defs>
          <pattern id="tiles" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tiles)" className="text-amber-300" />
      </svg>

      {/* Wooden counter at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 opacity-30"
        style={{ background: `linear-gradient(to top, ${palette.counter}, transparent)` }}
      />

      {/* Hanging pot silhouette left */}
      <svg className="absolute left-6 top-4 w-12 h-20 opacity-20" viewBox="0 0 40 60">
        <line x1="20" y1="0" x2="20" y2="15" stroke="currentColor" strokeWidth="2" className="text-amber-800" />
        <ellipse cx="20" cy="35" rx="15" ry="12" fill="currentColor" className="text-amber-900" />
        <ellipse cx="20" cy="28" rx="15" ry="5" fill="currentColor" className="text-amber-800" />
        <rect x="5" y="22" width="30" height="3" rx="1" fill="currentColor" className="text-amber-700" />
      </svg>

      {/* Hanging garlic/herbs right */}
      <svg className="absolute right-10 top-6 w-10 h-16 opacity-25" viewBox="0 0 30 50">
        <line x1="15" y1="0" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" className="text-amber-700" />
        <circle cx="10" cy="18" r="6" fill="hsl(50 30% 85%)" />
        <circle cx="18" cy="20" r="5" fill="hsl(50 30% 88%)" />
        <circle cx="14" cy="28" r="5" fill="hsl(50 30% 82%)" />
        <ellipse cx="22" cy="30" rx="3" ry="8" fill="hsl(120 30% 45%)" transform="rotate(15 22 30)" />
        <ellipse cx="8" cy="32" rx="2" ry="6" fill="hsl(120 35% 40%)" transform="rotate(-10 8 32)" />
      </svg>

      {/* Steaming pot */}
      <svg className="absolute left-1/4 bottom-16 w-16 h-20 opacity-25" viewBox="0 0 50 60">
        <ellipse cx="25" cy="45" rx="20" ry="10" fill={palette.counter} />
        <rect x="8" y="30" width="34" height="18" rx="3" fill={palette.counter} />
        <ellipse cx="25" cy="30" rx="17" ry="5" fill={palette.accent} opacity="0.5" />
        {/* Steam */}
        <motion.path
          d="M 20 25 Q 18 18 22 12"
          stroke={palette.steam}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          animate={{ y: [-2, -8, -2], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 28 23 Q 30 16 26 10"
          stroke={palette.steam}
          strokeWidth="2"
          fill="none"
          opacity="0.5"
          animate={{ y: [-3, -10, -3], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>

      {/* Floating ingredients */}
      <motion.div
        className="absolute top-1/4 right-1/4"
        animate={{ y: [-3, 3, -3], rotate: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-full bg-green-400/30 flex items-center justify-center">
          <span className="text-lg">🌿</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/3"
        animate={{ y: [3, -3, 3], rotate: [5, -5, 5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-6 h-6 rounded-full bg-amber-400/30 flex items-center justify-center">
          <span className="text-sm">🧈</span>
        </div>
      </motion.div>

      {/* Recipe card floating */}
      <motion.div
        className="absolute top-16 right-24 w-20 h-24 bg-background/60 backdrop-blur-sm rounded-lg shadow-lg opacity-30 rotate-6"
        animate={{ rotate: [6, 3, 6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="p-2">
          <div className="h-1 w-12 bg-foreground/20 rounded mb-1" />
          <div className="h-1 w-10 bg-foreground/15 rounded mb-1" />
          <div className="h-1 w-14 bg-foreground/20 rounded" />
        </div>
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
    </div>
  );
}

export function RecipesHero({ title, subtitle, className }: RecipesHeroProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className || ""}`}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden">
          <KitchenBackdrop />

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
                  <ChefHat className="w-3 h-3" />
                  Grass-forward cuisine
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

              {/* Culinary credentials */}
              <motion.div
                className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Utensils className="w-3 h-3" />
                  Self-Taught
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Flame className="w-3 h-3" />
                  Zero Burns
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  Grass Sommelier
                </span>
              </motion.div>
            </div>

            {/* Chef Bubbles */}
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
                  "The secret ingredient is always more grass."
                </p>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-background/90 rotate-45 border-r border-b border-border/50" />
              </motion.div>

              <BubblesChef size="hero" accessory="random" animated />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
