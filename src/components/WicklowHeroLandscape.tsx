import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * WICKLOW HERO LANDSCAPE — DYNAMIC WEATHER & TERRAIN
 * 
 * Large hero banner background featuring:
 * - Sky with dynamic weather (sun, clouds, rain, storm, thunder)
 * - Sugarloaf Mountain with green lower slopes and stony grey top
 * - Random scattered trees on terrain
 * - Parallax layering for depth
 */

// Weather types for hero variation
export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "thunder";

interface WicklowHeroLandscapeProps {
  weather?: WeatherType | "random";
  className?: string;
  showTrees?: boolean;
  intensity?: number; // 0-100 for weather intensity
}

// Random weather selection with weights
const WEATHER_WEIGHTS: { type: WeatherType; weight: number }[] = [
  { type: "cloudy", weight: 35 },
  { type: "sunny", weight: 25 },
  { type: "rainy", weight: 20 },
  { type: "stormy", weight: 12 },
  { type: "thunder", weight: 8 },
];

function getRandomWeather(): WeatherType {
  const total = WEATHER_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const w of WEATHER_WEIGHTS) {
    roll -= w.weight;
    if (roll <= 0) return w.type;
  }
  return "cloudy";
}

// Generate random tree positions
function generateTrees(count: number, seed: number): Array<{ x: number; scale: number; variant: number }> {
  const trees: Array<{ x: number; scale: number; variant: number }> = [];
  const rng = (i: number) => Math.abs(Math.sin(seed * 9999 + i * 1234) * 10000) % 1;
  
  for (let i = 0; i < count; i++) {
    trees.push({
      x: 5 + rng(i) * 90, // 5-95% across
      scale: 0.5 + rng(i + 100) * 0.6, // 0.5-1.1 scale
      variant: Math.floor(rng(i + 200) * 3), // 0, 1, or 2
    });
  }
  
  return trees.sort((a, b) => a.scale - b.scale); // Smaller trees in back
}

export function WicklowHeroLandscape({
  weather = "random",
  className,
  showTrees = true,
  intensity = 50,
}: WicklowHeroLandscapeProps) {
  // Stable random weather for component lifetime
  const resolvedWeather = useMemo<WeatherType>(() => {
    return weather === "random" ? getRandomWeather() : weather;
  }, [weather]);

  // Stable tree positions
  const treeSeed = useMemo(() => Math.floor(Math.random() * 10000), []);
  const trees = useMemo(() => showTrees ? generateTrees(4 + Math.floor(Math.random() * 4), treeSeed) : [], [showTrees, treeSeed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* SKY LAYER */}
      <SkyLayer weather={resolvedWeather} intensity={intensity} />
      
      {/* WEATHER EFFECTS (top of hero) */}
      <WeatherEffects weather={resolvedWeather} intensity={intensity} />
      
      {/* DISTANT MOUNTAINS - Sugarloaf with stony top */}
      <SugarloafMountain />
      
      {/* MID-RANGE HILLS */}
      <RollingHills />
      
      {/* FOREGROUND BOG TERRAIN with trees */}
      <BogTerrain trees={trees} />
      
      {/* LOW MIST */}
      <MistLayer />
    </div>
  );
}

// ============================================================================
// SKY LAYER - Dynamic based on weather
// ============================================================================
function SkyLayer({ weather, intensity }: { weather: WeatherType; intensity: number }) {
  const skyGradients: Record<WeatherType, string> = {
    sunny: `linear-gradient(to bottom, 
      hsl(210 60% 75%) 0%, 
      hsl(200 50% 82%) 30%, 
      hsl(45 40% 90%) 70%,
      hsl(40 30% 92%) 100%
    )`,
    cloudy: `linear-gradient(to bottom, 
      hsl(210 20% 78%) 0%, 
      hsl(200 15% 85%) 40%, 
      hsl(40 10% 90%) 100%
    )`,
    rainy: `linear-gradient(to bottom, 
      hsl(210 15% 55%) 0%, 
      hsl(200 12% 65%) 40%, 
      hsl(195 10% 75%) 100%
    )`,
    stormy: `linear-gradient(to bottom, 
      hsl(220 20% 35%) 0%, 
      hsl(210 15% 45%) 40%, 
      hsl(200 10% 60%) 100%
    )`,
    thunder: `linear-gradient(to bottom, 
      hsl(240 25% 25%) 0%, 
      hsl(220 20% 35%) 40%, 
      hsl(200 15% 50%) 100%
    )`,
  };

  return (
    <div 
      className="absolute inset-0 transition-all duration-1000"
      style={{ background: skyGradients[weather] }}
    />
  );
}

// ============================================================================
// WEATHER EFFECTS - Clouds, sun, rain, etc.
// ============================================================================
function WeatherEffects({ weather, intensity }: { weather: WeatherType; intensity: number }) {
  return (
    <div className="absolute inset-0">
      {/* SUN with rays */}
      {weather === "sunny" && <SunWithRays />}
      
      {/* CLOUDS - all weather types have some clouds */}
      <CloudLayer weather={weather} />
      
      {/* RAIN */}
      {(weather === "rainy" || weather === "stormy" || weather === "thunder") && (
        <RainEffect intensity={weather === "stormy" || weather === "thunder" ? 80 : intensity} />
      )}
      
      {/* STORM WIND */}
      {(weather === "stormy" || weather === "thunder") && <WindStreaks />}
      
      {/* LIGHTNING */}
      {weather === "thunder" && <LightningEffect />}
    </div>
  );
}

// Sun with radiating rays
function SunWithRays() {
  return (
    <div className="absolute top-8 right-[15%] md:right-[20%]">
      {/* Sun glow */}
      <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-yellow-200/60 via-yellow-100/20 to-transparent rounded-full blur-xl" />
      
      {/* Sun core */}
      <motion.div 
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 90% 70%) 0%, hsl(40 85% 60%) 60%, hsl(35 80% 55%) 100%)",
          boxShadow: "0 0 60px 20px hsl(45 80% 70% / 0.4), 0 0 100px 40px hsl(45 70% 60% / 0.2)",
        }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Sun rays */}
      <svg className="absolute inset-0 w-48 h-48 -translate-x-1/4 -translate-y-1/4 md:w-56 md:h-56" viewBox="0 0 200 200">
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1="100"
            y1="100"
            x2={100 + Math.cos((i * 30 * Math.PI) / 180) * 90}
            y2={100 + Math.sin((i * 30 * Math.PI) / 180) * 90}
            stroke="hsl(45 80% 65%)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.3 + (i % 2) * 0.15}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </svg>
    </div>
  );
}

// Cloud layer - varies by weather
function CloudLayer({ weather }: { weather: WeatherType }) {
  const cloudConfigs: Record<WeatherType, { count: number; opacity: number; dark: boolean }> = {
    sunny: { count: 3, opacity: 0.6, dark: false },
    cloudy: { count: 6, opacity: 0.8, dark: false },
    rainy: { count: 8, opacity: 0.9, dark: true },
    stormy: { count: 10, opacity: 0.95, dark: true },
    thunder: { count: 12, opacity: 1, dark: true },
  };

  const config = cloudConfigs[weather];

  return (
    <div className="absolute top-0 left-0 right-0 h-[40%]">
      {[...Array(config.count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${(i * 23 + 5) % 100}%`,
            top: `${5 + (i % 4) * 12}%`,
          }}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
        >
          <Cloud 
            size={60 + (i % 3) * 40} 
            opacity={config.opacity * (0.7 + (i % 3) * 0.1)} 
            dark={config.dark}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Individual cloud shape
function Cloud({ size, opacity, dark }: { size: number; opacity: number; dark: boolean }) {
  const baseColor = dark ? "hsl(210 10% 40%)" : "hsl(0 0% 95%)";
  const shadowColor = dark ? "hsl(220 15% 25%)" : "hsl(210 10% 85%)";
  
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 120 60" style={{ opacity }}>
      <defs>
        <linearGradient id={`cloudGrad-${size}-${dark}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={baseColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </linearGradient>
      </defs>
      <ellipse cx="35" cy="40" rx="25" ry="18" fill={`url(#cloudGrad-${size}-${dark})`} />
      <ellipse cx="55" cy="32" rx="30" ry="22" fill={`url(#cloudGrad-${size}-${dark})`} />
      <ellipse cx="80" cy="38" rx="25" ry="18" fill={`url(#cloudGrad-${size}-${dark})`} />
      <ellipse cx="60" cy="45" rx="35" ry="14" fill={shadowColor} opacity="0.5" />
    </svg>
  );
}

// Rain effect
function RainEffect({ intensity }: { intensity: number }) {
  const dropCount = Math.floor(intensity / 2);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(dropCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-transparent via-blue-200/40 to-blue-300/60 rounded-full"
          style={{
            left: `${(i * 7.3) % 100}%`,
            height: `${15 + (i % 5) * 8}px`,
          }}
          animate={{ 
            y: ["-10%", "110%"],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 0.8 + (i % 3) * 0.3,
            repeat: Infinity,
            delay: (i % 20) * 0.1,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Wind streaks for storms
function WindStreaks() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            top: `${15 + i * 15}%`,
            width: `${100 + i * 50}px`,
          }}
          animate={{ 
            x: ["-100%", "200%"],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 1.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Lightning flash effect
function LightningEffect() {
  return (
    <motion.div
      className="absolute inset-0 bg-white/20 pointer-events-none"
      animate={{ opacity: [0, 0, 0, 0.8, 0, 0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ============================================================================
// SUGARLOAF MOUNTAIN - Green slopes with stony grey top
// ============================================================================
function SugarloafMountain() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-[65%]"
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        {/* Stony top gradient - grey rocks */}
        <linearGradient id="stonyTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200 8% 45%)" />
          <stop offset="40%" stopColor="hsl(195 10% 50%)" />
          <stop offset="100%" stopColor="hsl(190 12% 55%)" />
        </linearGradient>
        
        {/* Green slopes gradient */}
        <linearGradient id="greenSlopes" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(135 25% 40%)" />
          <stop offset="50%" stopColor="hsl(140 30% 35%)" />
          <stop offset="100%" stopColor="hsl(130 25% 30%)" />
        </linearGradient>
        
        {/* Mask for stony top portion */}
        <clipPath id="stonyTopClip">
          <path d="M700,180 L850,80 L950,160 Q875,120 700,180 Z" />
        </clipPath>
      </defs>
      
      {/* Main mountain silhouette - green slopes */}
      <path
        d="M0,400 L0,320 Q200,280 400,300 Q550,220 700,260 L850,140 L950,220 Q1100,180 1250,240 Q1350,200 1440,260 L1440,400 Z"
        fill="url(#greenSlopes)"
        opacity="0.5"
      />
      
      {/* Sugarloaf peak - stony top (upper portion only) */}
      <path
        d="M650,280 Q700,200 850,80 L950,160 Q900,200 950,280 L650,280 Z"
        fill="url(#stonyTop)"
        opacity="0.6"
      />
      
      {/* Secondary peaks with stony tops */}
      <path
        d="M1050,260 Q1100,180 1180,140 L1250,180 Q1220,210 1260,260 L1050,260 Z"
        fill="url(#stonyTop)"
        opacity="0.45"
      />
      
      {/* Stone texture lines on peaks */}
      <g opacity="0.3">
        <line x1="800" y1="120" x2="820" y2="160" stroke="hsl(200 5% 35%)" strokeWidth="1" />
        <line x1="860" y1="100" x2="880" y2="150" stroke="hsl(200 5% 35%)" strokeWidth="1" />
        <line x1="900" y1="140" x2="910" y2="180" stroke="hsl(200 5% 35%)" strokeWidth="1" />
        <line x1="1140" y1="160" x2="1160" y2="200" stroke="hsl(200 5% 35%)" strokeWidth="1" />
        <line x1="1180" y1="150" x2="1200" y2="190" stroke="hsl(200 5% 35%)" strokeWidth="1" />
      </g>
    </svg>
  );
}

// ============================================================================
// ROLLING HILLS - Mid-range green terrain
// ============================================================================
function RollingHills() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-[50%]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(135 22% 38%)" />
          <stop offset="50%" stopColor="hsl(140 25% 35%)" />
          <stop offset="100%" stopColor="hsl(130 20% 32%)" />
        </linearGradient>
      </defs>
      <path
        d="M0,320 L0,260 Q150,220 300,240 Q500,180 700,220 Q900,160 1100,200 Q1280,170 1440,210 L1440,320 Z"
        fill="url(#hillsGrad)"
        opacity="0.55"
      />
    </svg>
  );
}

// ============================================================================
// BOG TERRAIN - Foreground with optional trees
// ============================================================================
function BogTerrain({ trees }: { trees: Array<{ x: number; scale: number; variant: number }> }) {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[35%]">
      {/* Bog grass layer */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="bogGrass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(135 28% 35%)" />
            <stop offset="60%" stopColor="hsl(130 25% 28%)" />
            <stop offset="100%" stopColor="hsl(28 35% 22%)" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,100 Q200,70 400,90 Q600,50 800,80 Q1000,60 1200,85 Q1350,65 1440,95 L1440,200 Z"
          fill="url(#bogGrass)"
          opacity="0.7"
        />
      </svg>
      
      {/* Peat earth base */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[40%]"
        style={{
          background: `linear-gradient(to top,
            hsl(28 40% 18%) 0%,
            hsl(30 35% 22%) 50%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Trees scattered on terrain */}
      {trees.map((tree, i) => (
        <div
          key={i}
          className="absolute bottom-[15%]"
          style={{
            left: `${tree.x}%`,
            transform: `scale(${tree.scale})`,
            opacity: 0.4 + tree.scale * 0.35,
            zIndex: Math.floor(tree.scale * 10),
          }}
        >
          <WicklowTree variant={tree.variant} />
        </div>
      ))}
    </div>
  );
}

// Wicklow-style tree (pine/fir silhouette)
function WicklowTree({ variant }: { variant: number }) {
  const treeStyles = [
    // Variant 0: Classic pine
    <svg key={0} width="40" height="60" viewBox="0 0 40 60">
      <polygon points="20,5 35,50 5,50" fill="hsl(140 35% 22%)" />
      <polygon points="20,15 32,45 8,45" fill="hsl(135 30% 28%)" />
      <rect x="17" y="48" width="6" height="10" fill="hsl(28 40% 20%)" />
    </svg>,
    // Variant 1: Tall narrow pine
    <svg key={1} width="30" height="70" viewBox="0 0 30 70">
      <polygon points="15,5 28,60 2,60" fill="hsl(138 32% 24%)" />
      <polygon points="15,20 24,55 6,55" fill="hsl(142 28% 30%)" />
      <rect x="12" y="58" width="6" height="10" fill="hsl(28 35% 18%)" />
    </svg>,
    // Variant 2: Bushy tree
    <svg key={2} width="50" height="55" viewBox="0 0 50 55">
      <ellipse cx="25" cy="25" rx="20" ry="22" fill="hsl(135 30% 25%)" />
      <ellipse cx="25" cy="20" rx="16" ry="18" fill="hsl(140 28% 30%)" />
      <rect x="22" y="42" width="6" height="12" fill="hsl(28 40% 18%)" />
    </svg>,
  ];
  
  return treeStyles[variant] || treeStyles[0];
}

// ============================================================================
// MIST LAYER - Low valley fog
// ============================================================================
function MistLayer() {
  return (
    <>
      <div
        className="absolute bottom-[12%] left-0 w-full h-32 blur-lg"
        style={{
          background: `linear-gradient(to top, 
            hsl(200 15% 90% / 0.4), 
            transparent
          )`,
        }}
      />
      
      {/* Drifting mist wisps */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: `${100 + i * 40}px`,
            height: `${30 + i * 10}px`,
            left: `${10 + i * 22}%`,
            bottom: `${8 + (i % 2) * 8}%`,
            backgroundColor: "hsl(200 12% 88% / 0.25)",
          }}
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

export default WicklowHeroLandscape;
