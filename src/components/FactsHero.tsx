import { useMemo } from "react";
import { motion } from "framer-motion";
import { BubblesScientist } from "./BubblesScientist";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * FACTS HERO — Laboratory-themed hero for the Facts page
 * Features BubblesScientist with a lab backdrop and floating molecules
 */

interface FactsHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

// Lab color palettes for different "experiment states"
type LabState = "stable" | "bubbling" | "glowing";

// Laboratory backdrop with beakers, molecules, and equipment
function LaboratoryBackdrop() {
  const labState = useMemo<LabState>(() => {
    const states: LabState[] = ["stable", "bubbling", "glowing"];
    return states[Math.floor(Math.random() * states.length)];
  }, []);

  const palettes = {
    stable: {
      bg: "from-slate-100/80 via-slate-50/60 to-white/40",
      accent: "hsl(200 60% 50%)",
      glow: "hsl(200 50% 70%)",
      liquid1: "hsl(280 60% 55%)",
      liquid2: "hsl(120 55% 50%)",
    },
    bubbling: {
      bg: "from-emerald-50/80 via-teal-50/60 to-cyan-50/40",
      accent: "hsl(160 60% 45%)",
      glow: "hsl(160 50% 65%)",
      liquid1: "hsl(120 65% 50%)",
      liquid2: "hsl(180 60% 45%)",
    },
    glowing: {
      bg: "from-purple-50/80 via-pink-50/60 to-rose-50/40",
      accent: "hsl(280 60% 55%)",
      glow: "hsl(280 50% 70%)",
      liquid1: "hsl(300 65% 55%)",
      liquid2: "hsl(340 60% 50%)",
    },
  };

  const palette = palettes[labState];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.bg}`} />

      {/* Lab grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="labGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#labGrid)" className="text-slate-400" />
      </svg>

      {/* Beaker left */}
      <svg className="absolute left-8 bottom-12 w-20 h-32 opacity-40" viewBox="0 0 60 100">
        <path d="M 15 10 L 12 75 Q 10 90 30 90 Q 50 90 48 75 L 45 10 Z" fill="hsl(200 20% 92%)" opacity="0.8" />
        <rect x="12" y="5" width="36" height="8" rx="2" fill="hsl(200 15% 85%)" />
        <path d="M 14 50 L 12 75 Q 10 90 30 90 Q 50 90 48 75 L 46 50 Z" fill={palette.liquid1} opacity="0.6" />
        <motion.circle
          cx="25"
          cy="60"
          r="3"
          fill={palette.liquid1}
          opacity="0.8"
          animate={{ cy: [60, 45, 60], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="35"
          cy="55"
          r="2"
          fill={palette.liquid1}
          opacity="0.6"
          animate={{ cy: [55, 42, 55], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>

      {/* Test tubes right */}
      <svg className="absolute right-12 top-16 w-16 h-28 opacity-35" viewBox="0 0 50 90">
        <rect x="5" y="10" width="12" height="50" rx="6" fill="hsl(200 20% 90%)" opacity="0.8" />
        <rect x="5" y="5" width="12" height="8" rx="2" fill="hsl(0 0% 70%)" />
        <ellipse cx="11" cy="48" rx="5" ry="8" fill={palette.liquid2} opacity="0.7" />
        
        <rect x="25" y="15" width="12" height="45" rx="6" fill="hsl(200 20% 90%)" opacity="0.8" />
        <rect x="25" y="10" width="12" height="8" rx="2" fill="hsl(0 0% 70%)" />
        <ellipse cx="31" cy="50" rx="5" ry="6" fill={palette.liquid1} opacity="0.7" />
      </svg>

      {/* Floating molecules */}
      <motion.div
        className="absolute top-1/4 left-1/4"
        animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-30">
          <circle cx="20" cy="20" r="6" fill={palette.accent} />
          <circle cx="8" cy="12" r="4" fill={palette.glow} />
          <circle cx="32" cy="12" r="4" fill={palette.glow} />
          <circle cx="20" cy="35" r="4" fill={palette.glow} />
          <line x1="20" y1="20" x2="8" y2="12" stroke={palette.accent} strokeWidth="2" />
          <line x1="20" y1="20" x2="32" y2="12" stroke={palette.accent} strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="35" stroke={palette.accent} strokeWidth="2" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/3"
        animate={{ y: [5, -5, 5], rotate: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" className="opacity-25">
          <circle cx="15" cy="15" r="5" fill={palette.liquid2} />
          <circle cx="5" cy="15" r="3" fill={palette.glow} />
          <circle cx="25" cy="15" r="3" fill={palette.glow} />
          <line x1="15" y1="15" x2="5" y2="15" stroke={palette.liquid2} strokeWidth="2" />
          <line x1="15" y1="15" x2="25" y2="15" stroke={palette.liquid2} strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Atom decoration top-right */}
      <motion.svg
        className="absolute top-8 right-20 w-16 h-16 opacity-20"
        viewBox="0 0 60 60"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <ellipse cx="30" cy="30" rx="25" ry="8" fill="none" stroke={palette.accent} strokeWidth="1.5" />
        <ellipse cx="30" cy="30" rx="25" ry="8" fill="none" stroke={palette.accent} strokeWidth="1.5" transform="rotate(60 30 30)" />
        <ellipse cx="30" cy="30" rx="25" ry="8" fill="none" stroke={palette.accent} strokeWidth="1.5" transform="rotate(120 30 30)" />
        <circle cx="30" cy="30" r="4" fill={palette.accent} />
      </motion.svg>

      {/* Formula scribbles */}
      <div className="absolute bottom-8 left-20 text-xs font-mono opacity-20 text-slate-500">
        E = mc² (probably)
      </div>
      <div className="absolute top-12 left-32 text-xs font-mono opacity-15 text-slate-500">
        H₂O = wet
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
    </div>
  );
}

export function FactsHero({ title, subtitle, className }: FactsHeroProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className || ""}`}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Lab backdrop */}
          <LaboratoryBackdrop />

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 md:py-16">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  🔬 Peer-reviewed by grass
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

              {/* Lab credentials */}
              <motion.div
                className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  0% Accuracy Guaranteed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  100% Confidence
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  Bog-Certified
                </span>
              </motion.div>
            </div>

            {/* Scientist Bubbles */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Glow effect behind Bubbles */}
              <div className="absolute inset-0 blur-3xl bg-gradient-radial from-primary/20 to-transparent scale-150" />
              
              {/* Thought bubble */}
              <motion.div
                className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-background/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-border/50 max-w-[180px]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <p className="text-xs italic text-muted-foreground">
                  "The data is clear. I made it up myself."
                </p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-background/90 rotate-45 border-r border-b border-border/50" />
              </motion.div>

              <BubblesScientist size="hero" accessory="random" animated />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
