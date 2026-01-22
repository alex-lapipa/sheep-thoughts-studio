import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BubblesMascotProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  popOut?: boolean;
  expression?: "neutral" | "confident" | "skeptical" | "smug";
}

const sizes = {
  sm: { container: "w-20 h-20", viewBox: "0 0 120 120" },
  md: { container: "w-32 h-32", viewBox: "0 0 120 120" },
  lg: { container: "w-48 h-48", viewBox: "0 0 120 120" },
  xl: { container: "w-64 h-64", viewBox: "0 0 120 120" },
  hero: { container: "w-80 h-80 md:w-96 md:h-96", viewBox: "0 0 120 120" },
};

// Expression-based eye variations
const expressions = {
  neutral: { leftBrow: 0, rightBrow: 0, eyeSquint: 0 },
  confident: { leftBrow: -2, rightBrow: 2, eyeSquint: 0.1 },
  skeptical: { leftBrow: 3, rightBrow: -2, eyeSquint: 0 },
  smug: { leftBrow: -1, rightBrow: -1, eyeSquint: 0.15 },
};

export function BubblesMascot({ 
  size = "lg", 
  className, 
  animated = true,
  popOut = false,
  expression = "confident"
}: BubblesMascotProps) {
  const { container, viewBox } = sizes[size];
  const expr = expressions[expression];

  const MascotSVG = (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Definitions for gradients and filters */}
      <defs>
        {/* Wool texture gradient */}
        <radialGradient id="woolGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(48 100% 96%)" />
          <stop offset="100%" stopColor="hsl(48 70% 88%)" />
        </radialGradient>
        
        {/* Face gradient - warm beige */}
        <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(40 60% 94%)" />
          <stop offset="100%" stopColor="hsl(35 50% 88%)" />
        </radialGradient>
        
        {/* Subtle shadow */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        
        {/* Eye shine */}
        <radialGradient id="eyeShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="hsl(0 0% 20%)" />
          <stop offset="100%" stopColor="hsl(0 0% 8%)" />
        </radialGradient>
      </defs>

      {/* Wool - stylized, modern puffs with depth */}
      <g filter="url(#softShadow)">
        {/* Back wool layer */}
        <ellipse cx="25" cy="70" rx="14" ry="12" fill="url(#woolGradient)" opacity="0.9" />
        <ellipse cx="95" cy="70" rx="14" ry="12" fill="url(#woolGradient)" opacity="0.9" />
        
        {/* Main wool crown - asymmetric for character */}
        <ellipse cx="60" cy="32" rx="42" ry="28" fill="url(#woolGradient)" />
        
        {/* Wool detail puffs - organic, not perfectly circular */}
        <ellipse cx="30" cy="45" rx="16" ry="14" fill="url(#woolGradient)" />
        <ellipse cx="90" cy="45" rx="16" ry="14" fill="url(#woolGradient)" />
        <ellipse cx="45" cy="28" rx="14" ry="12" fill="url(#woolGradient)" />
        <ellipse cx="75" cy="28" rx="14" ry="12" fill="url(#woolGradient)" />
        <ellipse cx="60" cy="22" rx="12" ry="10" fill="url(#woolGradient)" />
        
        {/* Top accent puffs */}
        <ellipse cx="50" cy="18" rx="8" ry="7" fill="hsl(48 100% 97%)" />
        <ellipse cx="70" cy="18" rx="8" ry="7" fill="hsl(48 100% 97%)" />
      </g>

      {/* Ears - distinctive, slightly folded */}
      <g>
        {/* Left ear */}
        <ellipse 
          cx="20" cy="55" rx="12" ry="7" 
          fill="url(#faceGradient)"
          transform="rotate(-35 20 55)"
        />
        <ellipse 
          cx="20" cy="55" rx="7" ry="4" 
          fill="hsl(320 30% 75%)"
          opacity="0.4"
          transform="rotate(-35 20 55)"
        />
        
        {/* Right ear */}
        <ellipse 
          cx="100" cy="55" rx="12" ry="7" 
          fill="url(#faceGradient)"
          transform="rotate(35 100 55)"
        />
        <ellipse 
          cx="100" cy="55" rx="7" ry="4" 
          fill="hsl(320 30% 75%)"
          opacity="0.4"
          transform="rotate(35 100 55)"
        />
      </g>

      {/* Face - elongated, sophisticated sheep face */}
      <ellipse cx="60" cy="68" rx="28" ry="32" fill="url(#faceGradient)" filter="url(#softShadow)" />
      
      {/* Eyebrows - subtle, expressive */}
      <path 
        d={`M 42 ${54 + expr.leftBrow} Q 48 ${51 + expr.leftBrow} 54 ${53 + expr.leftBrow}`}
        stroke="hsl(30 30% 50%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path 
        d={`M 66 ${53 + expr.rightBrow} Q 72 ${51 + expr.rightBrow} 78 ${54 + expr.rightBrow}`}
        stroke="hsl(30 30% 50%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Eyes - intelligent, knowing look */}
      <g>
        {/* Left eye */}
        <ellipse 
          cx="48" cy="62" 
          rx="7" ry={8 - expr.eyeSquint * 8} 
          fill="url(#eyeShine)" 
        />
        {/* Highlight */}
        <ellipse cx="46" cy="60" rx="2.5" ry="2" fill="white" opacity="0.9" />
        <circle cx="50" cy="64" r="1" fill="white" opacity="0.5" />
        
        {/* Right eye */}
        <ellipse 
          cx="72" cy="62" 
          rx="7" ry={8 - expr.eyeSquint * 8} 
          fill="url(#eyeShine)" 
        />
        {/* Highlight */}
        <ellipse cx="70" cy="60" rx="2.5" ry="2" fill="white" opacity="0.9" />
        <circle cx="74" cy="64" r="1" fill="white" opacity="0.5" />
      </g>

      {/* Nose - refined, characteristic sheep nose */}
      <ellipse cx="60" cy="80" rx="10" ry="6" fill="hsl(320 25% 65%)" />
      <ellipse cx="60" cy="79" rx="8" ry="4" fill="hsl(320 30% 72%)" />
      
      {/* Nostrils */}
      <ellipse cx="56" cy="80" rx="2" ry="1.5" fill="hsl(320 20% 45%)" opacity="0.6" />
      <ellipse cx="64" cy="80" rx="2" ry="1.5" fill="hsl(320 20% 45%)" opacity="0.6" />

      {/* Mouth - subtle, knowing smile */}
      <path 
        d="M 52 88 Q 60 93 68 88" 
        stroke="hsl(30 25% 45%)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      
      {/* Dimple hint */}
      <path 
        d="M 50 87 Q 49 89 50 90" 
        stroke="hsl(30 25% 45%)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      <path 
        d="M 70 87 Q 71 89 70 90" 
        stroke="hsl(30 25% 45%)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />

      {/* Subtle cheek warmth */}
      <ellipse cx="38" cy="72" rx="6" ry="4" fill="hsl(10 60% 80%)" opacity="0.25" />
      <ellipse cx="82" cy="72" rx="6" ry="4" fill="hsl(10 60% 80%)" opacity="0.25" />
    </svg>
  );

  if (!animated && !popOut) {
    return <div className={cn(container, className)}>{MascotSVG}</div>;
  }

  if (popOut) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {/* Container that clips the bottom */}
        <div className="relative" style={{ height: "70%" }}>
          <motion.div
            className={cn(container, "relative")}
            initial={{ y: "40%" }}
            animate={{ y: "0%" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.3,
            }}
          >
            {MascotSVG}
          </motion.div>
        </div>
        
        {/* Pop-out base/surface */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background to-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(container, className)}
      animate={animated ? {
        y: [0, -8, 0],
        rotate: [0, 1, -1, 0],
      } : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      {MascotSVG}
    </motion.div>
  );
}

// Hero version with pop-out effect
export function BubblesMascotHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect behind */}
      <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-br from-accent/40 via-bubbles-gold/30 to-bubbles-heather/20" />
      
      {/* Main mascot */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          delay: 0.2,
        }}
      >
        <BubblesMascot 
          size="hero" 
          animated={true}
          expression="confident"
        />
      </motion.div>
      
      {/* Subtle floating particles around */}
      <motion.div
        className="absolute top-4 right-8 w-3 h-3 rounded-full bg-bubbles-gold/40"
        animate={{
          y: [0, -10, 0],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute bottom-16 left-4 w-2 h-2 rounded-full bg-bubbles-heather/30"
        animate={{
          y: [0, -8, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 1,
        }}
      />
    </div>
  );
}
