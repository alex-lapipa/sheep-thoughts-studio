import { cn } from "@/lib/utils";
import { BubbleMode } from "@/data/thoughtBubbles";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

// Cloud path variants - organic, irregular shapes inspired by Wicklow mist
const CLOUD_PATHS = {
  // Standard cumulus-like cloud
  cumulus: "M 20 70 C 5 65, 5 45, 20 40 C 15 25, 35 15, 55 20 C 65 8, 90 5, 110 15 C 130 5, 160 10, 175 25 C 195 30, 198 50, 185 65 C 195 80, 175 90, 155 85 C 140 95, 100 98, 70 90 C 45 95, 15 85, 20 70 Z",
  
  // Wispy, wind-swept cloud
  wispy: "M 15 68 C 2 60, 8 42, 25 38 C 22 22, 45 12, 68 18 C 80 5, 105 2, 125 12 C 148 3, 172 8, 185 22 C 198 28, 195 52, 182 62 C 192 78, 168 88, 148 82 C 132 92, 95 95, 62 88 C 38 93, 12 82, 15 68 Z",
  
  // Heavy, rain-laden cloud
  heavy: "M 18 72 C 4 68, 6 48, 22 42 C 18 28, 38 18, 58 22 C 68 10, 92 6, 112 14 C 132 6, 158 12, 172 28 C 192 32, 196 54, 184 68 C 194 82, 172 92, 152 88 C 138 98, 98 100, 68 92 C 42 98, 14 88, 18 72 Z",
  
  // Misty, diffuse cloud
  misty: "M 22 66 C 8 62, 10 46, 24 42 C 20 28, 42 16, 60 22 C 72 10, 95 8, 115 16 C 135 8, 162 14, 178 28 C 195 34, 194 52, 182 64 C 190 76, 170 86, 150 82 C 135 90, 100 94, 68 88 C 44 92, 16 80, 22 66 Z",
  
  // Puffy, cotton-like cloud
  puffy: "M 18 68 C 3 62, 4 44, 18 38 C 12 22, 32 10, 52 16 C 62 4, 88 2, 108 12 C 128 2, 158 6, 175 22 C 196 28, 200 52, 186 66 C 198 82, 176 94, 154 88 C 138 98, 98 100, 66 92 C 40 98, 12 84, 18 68 Z",
};

type CloudVariant = keyof typeof CLOUD_PATHS;

const CLOUD_SEQUENCE: CloudVariant[] = ['cumulus', 'wispy', 'misty', 'puffy', 'heavy', 'cumulus'];

// Mode-based fill colors (atmospheric Wicklow palette)
const MODE_FILLS: Record<BubbleMode, { fill: string; glow: string }> = {
  innocent: { fill: "hsl(45 30% 92%)", glow: "hsl(45 30% 85%)" },
  concerned: { fill: "hsl(210 25% 88%)", glow: "hsl(210 25% 82%)" },
  triggered: { fill: "hsl(35 35% 85%)", glow: "hsl(35 35% 78%)" },
  savage: { fill: "hsl(330 25% 88%)", glow: "hsl(330 25% 82%)" },
};

interface MorphingCloudBubbleProps {
  children: React.ReactNode;
  mode?: BubbleMode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  enableMorphing?: boolean;
  morphInterval?: number; // ms between morphs
  enableParallaxDrift?: boolean;
}

export function MorphingCloudBubble({
  children,
  mode = 'innocent',
  className,
  size = 'md',
  enableMorphing = true,
  morphInterval = 6000,
  enableParallaxDrift = true,
}: MorphingCloudBubbleProps) {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const controls = useAnimation();
  
  const sizeConfig = useMemo(() => ({
    sm: { width: 180, height: 90, padding: 'p-3', text: 'text-sm' },
    md: { width: 220, height: 110, padding: 'p-4', text: 'text-base' },
    lg: { width: 280, height: 140, padding: 'p-6', text: 'text-lg' },
  }), []);

  const { fill, glow } = MODE_FILLS[mode];
  const config = sizeConfig[size];

  // Path morphing cycle
  useEffect(() => {
    if (!enableMorphing) return;

    const interval = setInterval(() => {
      setCurrentPathIndex((prev) => (prev + 1) % CLOUD_SEQUENCE.length);
    }, morphInterval);

    return () => clearInterval(interval);
  }, [enableMorphing, morphInterval]);

  // Parallax drift animation
  const driftAnimation = enableParallaxDrift ? {
    y: [0, -6, -3, -9, -5, 0],
    x: [0, 2, -1, 2.5, -1.5, 0],
    rotate: [0, 0.4, -0.2, 0.3, -0.15, 0],
  } : {};

  const driftTransition = enableParallaxDrift ? {
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
  } : undefined;

  const currentPath = CLOUD_SEQUENCE[currentPathIndex];

  return (
    <motion.div
      className={cn("relative inline-block", className)}
      animate={driftAnimation}
      transition={driftTransition}
    >
      {/* SVG Cloud Shape */}
      <svg
        viewBox="0 0 200 100"
        className="absolute inset-0 w-full h-full"
        style={{ width: config.width, height: config.height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Atmospheric glow filter */}
          <filter id={`cloud-glow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor={glow} floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Subtle inner shadow for depth */}
          <filter id={`cloud-inner-${mode}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>
        </defs>
        
        {/* Main cloud path with morphing animation */}
        <motion.path
          d={CLOUD_PATHS[currentPath]}
          fill={fill}
          filter={`url(#cloud-glow-${mode})`}
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          initial={false}
          animate={{ d: CLOUD_PATHS[currentPath] }}
          transition={{
            d: {
              duration: 2,
              ease: [0.4, 0, 0.2, 1], // Custom bezier for organic feel
            },
          }}
        />
        
        {/* Subtle highlight layer */}
        <motion.path
          d={CLOUD_PATHS[currentPath]}
          fill="white"
          fillOpacity="0.15"
          initial={false}
          animate={{ d: CLOUD_PATHS[currentPath] }}
          transition={{
            d: {
              duration: 2,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          style={{ transform: 'translate(-2px, -2px) scale(0.95)', transformOrigin: 'center' }}
        />
      </svg>
      
      {/* Text content overlay */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center text-center font-display",
          config.padding,
          config.text
        )}
        style={{ 
          width: config.width, 
          height: config.height,
          color: 'hsl(var(--foreground))',
        }}
      >
        <span className="max-w-[85%] leading-relaxed">{children}</span>
      </div>
    </motion.div>
  );
}

// Export cloud paths for external use
export { CLOUD_PATHS, type CloudVariant };
