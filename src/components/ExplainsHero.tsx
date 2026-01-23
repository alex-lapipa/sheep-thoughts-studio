import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { BubblesScholar } from "@/components/BubblesScholar";
import { useMemo } from "react";

// Mini Wicklow landscape for scholar backdrop
function ScholarLandscapeBackdrop() {
  // Randomize time of day for variety
  const timeOfDay = useMemo(() => {
    const times = ["dawn", "midday", "dusk"] as const;
    return times[Math.floor(Math.random() * times.length)];
  }, []);

  const palettes = {
    dawn: {
      sky: "from-pink-200/60 via-orange-100/50 to-yellow-50/40",
      mountain: "hsl(270 15% 45%)",
      hills: "hsl(120 25% 35%)",
      foreground: "hsl(35 40% 45%)",
    },
    midday: {
      sky: "from-sky-200/60 via-blue-100/50 to-slate-50/40",
      mountain: "hsl(220 10% 50%)",
      hills: "hsl(130 30% 40%)",
      foreground: "hsl(90 25% 50%)",
    },
    dusk: {
      sky: "from-purple-200/60 via-rose-100/50 to-amber-50/40",
      mountain: "hsl(280 20% 40%)",
      hills: "hsl(150 20% 30%)",
      foreground: "hsl(40 35% 40%)",
    },
  };

  const palette = palettes[timeOfDay];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Sky gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-b", palette.sky)} />
      
      {/* Distant mountains */}
      <svg 
        viewBox="0 0 400 200" 
        className="absolute bottom-0 left-0 w-full h-3/4"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Far distant hills */}
        <path 
          d="M 0 180 Q 50 140 100 160 Q 150 120 200 140 Q 280 100 350 130 Q 380 120 400 140 L 400 200 L 0 200 Z"
          fill={palette.mountain}
          opacity="0.4"
        />
        
        {/* Sugarloaf-inspired peak */}
        <path 
          d="M 120 200 L 180 100 L 200 95 L 220 100 L 280 200 Z"
          fill={palette.mountain}
          opacity="0.6"
        />
        {/* Rocky summit */}
        <path 
          d="M 160 150 L 180 100 L 200 95 L 220 100 L 240 150 Q 200 140 160 150 Z"
          fill="hsl(270 10% 55%)"
          opacity="0.7"
        />
        
        {/* Mid-ground rolling hills */}
        <path 
          d="M 0 200 Q 40 160 80 175 Q 130 155 180 170 Q 250 150 320 165 Q 370 155 400 170 L 400 200 Z"
          fill={palette.hills}
          opacity="0.7"
        />
        
        {/* Foreground bog/heather */}
        <path 
          d="M 0 200 Q 60 180 120 190 Q 200 175 280 185 Q 350 175 400 190 L 400 200 Z"
          fill={palette.foreground}
          opacity="0.5"
        />
        
        {/* Heather dots */}
        <circle cx="50" cy="195" r="3" fill="hsl(300 30% 50%)" opacity="0.4" />
        <circle cx="120" cy="192" r="2" fill="hsl(300 35% 55%)" opacity="0.3" />
        <circle cx="200" cy="190" r="2.5" fill="hsl(300 30% 50%)" opacity="0.35" />
        <circle cx="300" cy="193" r="2" fill="hsl(300 35% 55%)" opacity="0.3" />
        <circle cx="350" cy="195" r="3" fill="hsl(300 30% 50%)" opacity="0.4" />
        
        {/* Gorse bushes */}
        <circle cx="80" cy="188" r="4" fill="hsl(50 70% 50%)" opacity="0.25" />
        <circle cx="250" cy="185" r="5" fill="hsl(50 70% 50%)" opacity="0.2" />
        <circle cx="370" cy="190" r="3" fill="hsl(50 70% 50%)" opacity="0.25" />
      </svg>
      
      {/* Soft mist overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/30 to-transparent" />
      
      {/* Warm vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-primary/10" />
    </div>
  );
}

interface ExplainsHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

// Academic equations and symbols for floating background
const FLOATING_EQUATIONS = [
  { text: "E = mc²", delay: 0, position: { top: "15%", left: "8%" }, size: "text-lg" },
  { text: "∑ᵢ₌₁ⁿ", delay: 1.2, position: { top: "25%", right: "12%" }, size: "text-2xl" },
  { text: "∂f/∂x", delay: 0.6, position: { bottom: "30%", left: "5%" }, size: "text-xl" },
  { text: "√π", delay: 1.8, position: { top: "60%", right: "8%" }, size: "text-3xl" },
  { text: "λ", delay: 0.3, position: { top: "8%", right: "25%" }, size: "text-4xl" },
  { text: "∞", delay: 2.2, position: { bottom: "20%", right: "20%" }, size: "text-2xl" },
  { text: "∫dx", delay: 1.5, position: { top: "40%", left: "3%" }, size: "text-xl" },
  { text: "Δ", delay: 0.9, position: { bottom: "40%", right: "5%" }, size: "text-3xl" },
  { text: "θ", delay: 2, position: { top: "70%", left: "12%" }, size: "text-2xl" },
  { text: "∇", delay: 1, position: { top: "18%", left: "20%" }, size: "text-xl" },
];

// Chalk-style writing that appears letter by letter
const CHALK_WRITINGS = [
  { text: "GRASS = WISDOM", delay: 0.5, position: { top: "5%", left: "40%" } },
  { text: "SHEEP > HUMANS", delay: 2, position: { bottom: "15%", left: "15%" } },
  { text: "∴ BUBBLES IS RIGHT", delay: 3.5, position: { top: "75%", right: "10%" } },
];

// Floating equation component
const FloatingEquation = ({ text, delay, position, size }: typeof FLOATING_EQUATIONS[0]) => (
  <motion.div
    className={cn(
      "absolute font-serif italic pointer-events-none select-none",
      "text-foreground/10 dark:text-foreground/5",
      size
    )}
    style={position as any}
    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
    animate={{
      opacity: [0.05, 0.15, 0.05],
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      rotate: [-8, 8, -8],
      scale: [0.95, 1.05, 0.95],
    }}
    transition={{
      duration: 12 + delay * 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
  >
    {text}
  </motion.div>
);

// Chalk writing animation component
const ChalkWriting = ({ text, delay, position }: typeof CHALK_WRITINGS[0]) => {
  const letters = text.split("");
  
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={position as any}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay }}
    >
      <div className="flex font-mono text-sm md:text-base tracking-wider">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="text-foreground/15 dark:text-foreground/10"
            style={{
              textShadow: "0 0 8px currentColor",
              filter: "blur(0.3px)",
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: delay + i * 0.08,
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </div>
      {/* Chalk dust particles */}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ delay: delay + letters.length * 0.08, duration: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground/20"
            style={{ left: `${20 + i * 15}%` }}
            animate={{
              y: [0, 10, 20],
              opacity: [0.5, 0.3, 0],
            }}
            transition={{
              delay: delay + letters.length * 0.08 + i * 0.1,
              duration: 0.8,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Chalkboard scratches/doodles
const ChalkDoodle = ({ className }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 100 100"
    className={cn("absolute pointer-events-none", className)}
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.1 }}
    transition={{ duration: 2, ease: "easeInOut" }}
  >
    <motion.path
      d="M10 50 Q 30 20, 50 50 T 90 50"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
  </motion.svg>
);

export function ExplainsHero({ title, subtitle, className }: ExplainsHeroProps) {
  return (
    <section className={cn(
      "min-h-[50vh] md:min-h-[60vh] py-16 md:py-24 relative overflow-hidden",
      "bg-gradient-to-br from-bubbles-meadow/20 via-background to-bubbles-mist/10",
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [-20, 20, -20],
            y: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            x: [20, -20, 20],
            y: [10, -10, 10],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-10 w-48 h-48 bg-bubbles-gorse/10 rounded-full blur-3xl"
          animate={{ 
            y: [-15, 15, -15],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Floating equations */}
      {FLOATING_EQUATIONS.map((eq, i) => (
        <FloatingEquation key={i} {...eq} />
      ))}

      {/* Chalk writings */}
      {CHALK_WRITINGS.map((writing, i) => (
        <ChalkWriting key={i} {...writing} />
      ))}

      {/* Chalkboard doodles */}
      <ChalkDoodle className="w-32 h-32 text-foreground/5 top-[10%] right-[30%]" />
      <ChalkDoodle className="w-24 h-24 text-foreground/5 bottom-[25%] left-[25%] rotate-45" />

      {/* Floating decorative icons */}
      <motion.div
        className="absolute top-16 left-[10%] text-primary/20"
        animate={{ 
          y: [-10, 10, -10],
          rotate: [-5, 5, -5],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BookOpen className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-[15%] text-accent/20"
        animate={{ 
          y: [10, -10, 10],
          rotate: [5, -5, 5],
        }}
        transition={{ duration: 7, repeat: Infinity }}
      >
        <GraduationCap className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 left-[5%] text-bubbles-gorse/30"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Scholar Bubbles - looking right */}
          <motion.div 
            className="relative flex-shrink-0 order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Wicklow landscape backdrop */}
            <div className="absolute -inset-8 md:-inset-12 -z-10 rounded-3xl overflow-hidden shadow-xl">
              <ScholarLandscapeBackdrop />
            </div>
            
            {/* Subtle glow effect on top */}
            <div className="absolute inset-0 -z-5 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 rounded-full blur-2xl scale-105" />
            
            {/* The scholar Bubbles image */}
            <motion.div
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 relative"
              animate={{ 
                y: [-5, 5, -5],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <BubblesScholar 
                size="hero" 
                accessory="random"
                animated={false}
                className="w-full h-full drop-shadow-2xl"
              />
              
              {/* Sparkle accents around Bubbles */}
              <motion.div
                className="absolute -top-2 -right-2 text-bubbles-gorse"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 15, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <motion.div
                className="absolute bottom-4 -left-4 text-accent"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </motion.div>

            {/* Thought bubble with scholarly quote */}
            <motion.div
              className="absolute -top-4 right-0 md:-right-8 max-w-[200px] md:max-w-[240px]"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [0, -5, 0],
              }}
              transition={{ 
                opacity: { delay: 0.5, duration: 0.6 },
                scale: { delay: 0.5, duration: 0.6 },
                y: { delay: 1, duration: 3, repeat: Infinity },
              }}
            >
              <div className="relative bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg">
                <p className="text-sm italic text-foreground/80">
                  "I have studied extensively. In fields. With grass."
                </p>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card/90 border-r border-b border-border rotate-45" />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero text - now on the right */}
          <div className="text-center md:text-left flex-1 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Distinguished Scholar</span>
            </motion.div>
            
            <motion.h1
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
            
            {subtitle && (
              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Credentials badge */}
            <motion.div
              className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                Field Studies Expert
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Confidence: Absolute
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
