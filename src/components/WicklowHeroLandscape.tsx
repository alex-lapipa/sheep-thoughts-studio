import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * WICKLOW HERO LANDSCAPE — DYNAMIC WEATHER, TERRAIN & TIME OF DAY
 * 
 * Large hero banner background featuring:
 * - Sky with dynamic weather (sun, clouds, rain, storm, thunder)
 * - Time-of-day lighting (dawn, midday, dusk)
 * - Sugarloaf Mountain with green lower slopes and stony grey top
 * - Random scattered trees on terrain
 * - Parallax layering for depth
 */

// Weather types for hero variation
export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "thunder";

// Time of day for lighting variation
export type TimeOfDay = "dawn" | "midday" | "dusk";

interface WicklowHeroLandscapeProps {
  weather?: WeatherType | "random";
  timeOfDay?: TimeOfDay | "auto" | "random";
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

// Determine time of day based on actual hour
function getTimeOfDayFromHour(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "dawn";      // 5am-10am: golden hour
  if (hour >= 10 && hour < 17) return "midday";   // 10am-5pm: bright day
  if (hour >= 17 && hour < 21) return "dusk";     // 5pm-9pm: sunset
  return "midday"; // Night defaults to midday look
}

function getRandomTimeOfDay(): TimeOfDay {
  const times: TimeOfDay[] = ["dawn", "midday", "dusk"];
  return times[Math.floor(Math.random() * times.length)];
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

// ============================================================================
// TIME OF DAY COLOR PALETTES
// ============================================================================
interface TimeOfDayPalette {
  sky: string;
  quartziteSummit: [string, string, string];
  heatherSlopes: [string, string, string];
  forestSlopes: [string, string, string];
  distantHills: [string, string];
  atmosphereOpacity: number;
}

const TIME_PALETTES: Record<TimeOfDay, TimeOfDayPalette> = {
  dawn: {
    // Golden hour: warm pinks, oranges, soft purples
    sky: `linear-gradient(to bottom, 
      hsl(280 40% 45%) 0%, 
      hsl(340 60% 65%) 20%,
      hsl(25 80% 70%) 50%,
      hsl(45 70% 80%) 80%,
      hsl(45 50% 88%) 100%
    )`,
    quartziteSummit: ["#5A4463", "#6A5473", "#7B6B7B"],
    heatherSlopes: ["#8B6B7B", "#9A7B7A", "#8A8B6A"],
    forestSlopes: ["#6A7B5A", "#5D6A4D", "#4A6C44"],
    distantHills: ["#9B7B9B", "#8A8B7A"],
    atmosphereOpacity: 0.25,
  },
  midday: {
    // Bright daylight: clear blues, vibrant greens
    sky: `linear-gradient(to bottom, 
      hsl(210 60% 75%) 0%, 
      hsl(200 50% 82%) 30%, 
      hsl(45 40% 90%) 70%,
      hsl(40 30% 92%) 100%
    )`,
    quartziteSummit: ["#4A4453", "#5A5463", "#6B5B6B"],
    heatherSlopes: ["#6B5B6B", "#7A6B6A", "#7A8B5A"],
    forestSlopes: ["#7A8B5A", "#5D7A3D", "#4A7C34"],
    distantHills: ["#8B7B8B", "#7A8B6A"],
    atmosphereOpacity: 0.15,
  },
  dusk: {
    // Sunset: deep purples, warm oranges, silhouette effects
    sky: `linear-gradient(to bottom, 
      hsl(250 35% 35%) 0%, 
      hsl(280 40% 45%) 15%,
      hsl(340 50% 55%) 35%,
      hsl(25 70% 60%) 60%,
      hsl(35 60% 75%) 85%,
      hsl(40 40% 85%) 100%
    )`,
    quartziteSummit: ["#3A3443", "#4A4453", "#5A5463"],
    heatherSlopes: ["#5B4B5B", "#6A5B5A", "#6A6B4A"],
    forestSlopes: ["#5A6B4A", "#4D5A3D", "#3A5C34"],
    distantHills: ["#7B5B7B", "#6A6B5A"],
    atmosphereOpacity: 0.3,
  },
};

export function WicklowHeroLandscape({
  weather = "random",
  timeOfDay = "auto",
  className,
  showTrees = true,
  intensity = 50,
}: WicklowHeroLandscapeProps) {
  // Stable random weather for component lifetime
  const resolvedWeather = useMemo<WeatherType>(() => {
    return weather === "random" ? getRandomWeather() : weather;
  }, [weather]);

  // Resolve time of day
  const resolvedTime = useMemo<TimeOfDay>(() => {
    if (timeOfDay === "auto") return getTimeOfDayFromHour();
    if (timeOfDay === "random") return getRandomTimeOfDay();
    return timeOfDay;
  }, [timeOfDay]);

  const palette = TIME_PALETTES[resolvedTime];

  // Stable tree positions
  const treeSeed = useMemo(() => Math.floor(Math.random() * 10000), []);
  const trees = useMemo(() => showTrees ? generateTrees(4 + Math.floor(Math.random() * 4), treeSeed) : [], [showTrees, treeSeed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* SKY LAYER */}
      <SkyLayer weather={resolvedWeather} timeOfDay={resolvedTime} palette={palette} intensity={intensity} />
      
      {/* WEATHER EFFECTS (top of hero) */}
      <WeatherEffects weather={resolvedWeather} intensity={intensity} />
      
      {/* DISTANT MOUNTAINS - Sugarloaf with stony top */}
      <SugarloafMountain palette={palette} />
      
      {/* MID-RANGE HILLS */}
      <RollingHills palette={palette} />
      
      {/* FOREGROUND BOG TERRAIN with trees */}
      <BogTerrain trees={trees} palette={palette} />
      
      {/* LOW MIST */}
      <MistLayer />
    </div>
  );
}

// ============================================================================
// SKY LAYER - Dynamic based on weather
// ============================================================================
function SkyLayer({ weather, timeOfDay, palette, intensity }: { 
  weather: WeatherType; 
  timeOfDay: TimeOfDay;
  palette: TimeOfDayPalette;
  intensity: number; 
}) {
  // Weather overrides for stormy conditions, otherwise use time-based palette
  const weatherOverrides: Partial<Record<WeatherType, string>> = {
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

  const skyGradient = weatherOverrides[weather] || palette.sky;

  return (
    <div 
      className="absolute inset-0 transition-all duration-1000"
      style={{ background: skyGradient }}
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
// SUGARLOAF MOUNTAIN - Sharp conical peak with quartzite summit
// Reference: Sugarloaf (Ó Cualann) - distinctive asymmetric cone
// ============================================================================
// Drifting cloud shadows across the mountain slopes
function CloudShadows() {
  const shadows = useMemo(() => 
    [...Array(4)].map((_, i) => ({
      id: i,
      delay: i * 8,
      duration: 25 + Math.random() * 15,
      yOffset: 80 + i * 60,
      size: 120 + Math.random() * 80,
      opacity: 0.12 + Math.random() * 0.08,
    })), []
  );

  return (
    <svg className="absolute bottom-0 left-0 w-full h-[70%] pointer-events-none" viewBox="0 0 1440 450" preserveAspectRatio="xMidYMax slice">
      <defs>
        {/* Cloud shadow gradient - soft dark patch */}
        <radialGradient id="cloudShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3A3443" stopOpacity="1" />
          <stop offset="60%" stopColor="#3A3443" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3A3443" stopOpacity="0" />
        </radialGradient>
        
        {/* Clip to mountain shape so shadows only appear on slopes */}
        <clipPath id="mountainClip">
          {/* Main Sugarloaf */}
          <path d="M480,450 Q520,380 580,340 L720,60 L860,320 Q920,360 960,450 Z" />
          {/* Secondary peak */}
          <path d="M1050,450 Q1100,380 1150,320 L1220,200 L1290,300 Q1340,360 1380,450 Z" />
          {/* Left foothills */}
          <path d="M0,450 L0,360 Q100,320 200,340 Q350,300 480,360 L480,450 Z" />
        </clipPath>
      </defs>
      
      {/* Shadow layer clipped to mountain */}
      <g clipPath="url(#mountainClip)">
        {shadows.map((shadow) => (
          <motion.ellipse
            key={shadow.id}
            cx="-200"
            cy={shadow.yOffset}
            rx={shadow.size}
            ry={shadow.size * 0.4}
            fill="url(#cloudShadow)"
            opacity={shadow.opacity}
            animate={{
              cx: [-200, 1640],
              opacity: [0, shadow.opacity, shadow.opacity, 0],
            }}
            transition={{
              duration: shadow.duration,
              repeat: Infinity,
              delay: shadow.delay,
              ease: "linear",
            }}
          />
        ))}
        
        {/* Larger, slower shadows for dramatic effect */}
        <motion.ellipse
          cx="-300"
          cy={200}
          rx={250}
          ry={100}
          fill="url(#cloudShadow)"
          opacity={0.15}
          animate={{
            cx: [-300, 1740],
            opacity: [0, 0.15, 0.15, 0],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            delay: 5,
            ease: "linear",
          }}
        />
      </g>
    </svg>
  );
}

function SugarloafMountain({ palette }: { palette: TimeOfDayPalette }) {
  return (
    <>
      <svg
        className="absolute bottom-0 left-0 w-full h-[70%]"
        viewBox="0 0 1440 450"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Quartzite summit - dynamic based on time of day */}
          <linearGradient id="quartziteSummit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.quartziteSummit[0]} />
            <stop offset="60%" stopColor={palette.quartziteSummit[1]} />
            <stop offset="100%" stopColor={palette.quartziteSummit[2]} />
          </linearGradient>
          
          {/* Upper slopes - heather, dynamic */}
          <linearGradient id="heatherSlopes" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.heatherSlopes[0]} />
            <stop offset="50%" stopColor={palette.heatherSlopes[1]} />
            <stop offset="100%" stopColor={palette.heatherSlopes[2]} />
          </linearGradient>
          
          {/* Lower slopes - forestry green, dynamic */}
          <linearGradient id="forestSlopes" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.forestSlopes[0]} />
            <stop offset="40%" stopColor={palette.forestSlopes[1]} />
            <stop offset="100%" stopColor={palette.forestSlopes[2]} />
          </linearGradient>
          
          {/* Distant hills - dynamic with atmospheric haze */}
          <linearGradient id="distantHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.distantHills[0]} />
            <stop offset="100%" stopColor={palette.distantHills[1]} />
          </linearGradient>
        </defs>
        
        {/* BACKGROUND: Distant rolling hills */}
        <path
          d="M0,450 L0,340 Q120,310 240,330 Q400,290 550,320 Q700,280 850,310 Q1000,270 1150,300 Q1300,260 1440,290 L1440,450 Z"
          fill="url(#distantHills)"
          opacity="0.4"
        />
        
        {/* SUGARLOAF: Sharp conical peak - the iconic silhouette */}
        {/* Main mountain body - green lower slopes */}
        <path
          d="M480,450 
             Q520,380 580,340 
             L720,60
             L860,320
             Q920,360 960,450 
             Z"
          fill="url(#forestSlopes)"
        />
        
        {/* Upper heather-covered slopes */}
        <path
          d="M560,340 
             Q600,280 660,200 
             L720,60
             L780,180
             Q840,260 880,320
             Q820,350 720,360
             Q620,355 560,340
             Z"
          fill="url(#heatherSlopes)"
          opacity="0.9"
        />
        
        {/* Sharp quartzite summit cap - the rocky peak */}
        <path
          d="M660,180 
             Q680,120 720,40
             L725,38
             Q770,100 800,170
             Q760,210 720,220
             Q680,215 660,180
             Z"
          fill="url(#quartziteSummit)"
        />
        
        {/* Summit rocky texture details */}
        <g opacity="0.4" stroke="#3A3443" strokeWidth="1.5">
          <path d="M700,80 Q710,100 705,130" fill="none" />
          <path d="M730,70 Q740,95 735,120" fill="none" />
          <path d="M715,50 L720,40 L725,48" fill="none" />
          <path d="M680,150 Q695,140 700,160" fill="none" />
          <path d="M745,140 Q755,155 750,170" fill="none" />
        </g>
        
        {/* SECONDARY PEAK: Smaller hill to the right */}
        <path
          d="M1050,450 
             Q1100,380 1150,320
             L1220,200
             L1290,300
             Q1340,360 1380,450
             Z"
          fill="url(#forestSlopes)"
          opacity="0.7"
        />
        
        {/* Secondary peak rocky top */}
        <path
          d="M1140,310
             Q1170,260 1220,190
             L1230,188
             Q1270,250 1300,300
             Q1260,320 1220,325
             Q1180,320 1140,310
             Z"
          fill="url(#heatherSlopes)"
          opacity="0.6"
        />
        
        {/* Small rocky cap on secondary */}
        <path
          d="M1190,250 L1220,185 L1250,240 Q1220,270 1190,250 Z"
          fill="url(#quartziteSummit)"
          opacity="0.5"
        />
        
        {/* LEFT SIDE: Rolling foothills */}
        <path
          d="M0,450 L0,360 Q100,320 200,340 Q350,300 480,360 L480,450 Z"
          fill="url(#forestSlopes)"
          opacity="0.5"
        />
        
        {/* Atmospheric haze at mountain base - intensity based on time */}
        <rect x="0" y="400" width="1440" height="50" fill="url(#distantHills)" opacity={palette.atmosphereOpacity} />
      </svg>
      
      {/* Cloud shadows drifting over slopes */}
      <CloudShadows />
    </>
  );
}

// ============================================================================
// ROLLING HILLS - Mid-range green terrain
// ============================================================================
function RollingHills({ palette }: { palette: TimeOfDayPalette }) {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-[50%]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={palette.forestSlopes[1]} />
          <stop offset="50%" stopColor={palette.forestSlopes[2]} />
          <stop offset="100%" stopColor={palette.forestSlopes[1]} />
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
// BOG TERRAIN - Foreground with trees, heather, gorse, and bog cotton
// ============================================================================
function BogTerrain({ trees, palette }: { 
  trees: Array<{ x: number; scale: number; variant: number }>;
  palette: TimeOfDayPalette;
}) {
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
        
        {/* HEATHER PATCHES - Purple-pink to brown-rust clusters */}
        <g className="heather-patches">
          {/* Left side heather cluster */}
          <ellipse cx="120" cy="110" rx="45" ry="12" fill="#8B668B" opacity="0.6" />
          <ellipse cx="100" cy="115" rx="30" ry="8" fill="#7A5A7A" opacity="0.5" />
          <ellipse cx="145" cy="108" rx="25" ry="6" fill="#9B789B" opacity="0.4" />
          
          {/* Center-left heather */}
          <ellipse cx="380" cy="95" rx="55" ry="14" fill="#8B668B" opacity="0.55" />
          <ellipse cx="355" cy="100" rx="35" ry="10" fill="#7A5A7A" opacity="0.45" />
          <ellipse cx="410" cy="92" rx="28" ry="7" fill="#9B789B" opacity="0.4" />
          
          {/* Center heather */}
          <ellipse cx="720" cy="75" rx="50" ry="12" fill="#8B668B" opacity="0.5" />
          <ellipse cx="690" cy="80" rx="32" ry="9" fill="#6B4A6B" opacity="0.45" />
          
          {/* Right side heather */}
          <ellipse cx="1050" cy="85" rx="60" ry="15" fill="#8B668B" opacity="0.55" />
          <ellipse cx="1020" cy="90" rx="40" ry="10" fill="#7A5A7A" opacity="0.5" />
          <ellipse cx="1085" cy="82" rx="30" ry="8" fill="#9B789B" opacity="0.4" />
          
          {/* Far right heather */}
          <ellipse cx="1320" cy="90" rx="45" ry="11" fill="#8B668B" opacity="0.5" />
          <ellipse cx="1345" cy="95" rx="28" ry="7" fill="#6B4A6B" opacity="0.4" />
        </g>
        
        {/* GORSE PATCHES - Brilliant yellow with dark green base */}
        <g className="gorse-patches">
          {/* Gorse cluster 1 - left */}
          <ellipse cx="200" cy="105" rx="25" ry="10" fill="#2A4A1A" opacity="0.7" />
          <ellipse cx="195" cy="100" rx="18" ry="7" fill="#E8B923" opacity="0.8" />
          <ellipse cx="210" cy="102" rx="12" ry="5" fill="#FFD93D" opacity="0.7" />
          
          {/* Gorse cluster 2 */}
          <ellipse cx="520" cy="88" rx="30" ry="12" fill="#2A4A1A" opacity="0.65" />
          <ellipse cx="515" cy="82" rx="22" ry="8" fill="#E8B923" opacity="0.75" />
          <ellipse cx="530" cy="84" rx="15" ry="6" fill="#FFD93D" opacity="0.65" />
          
          {/* Gorse cluster 3 - center-right */}
          <ellipse cx="880" cy="78" rx="28" ry="11" fill="#2A4A1A" opacity="0.7" />
          <ellipse cx="875" cy="72" rx="20" ry="7" fill="#E8B923" opacity="0.8" />
          <ellipse cx="890" cy="74" rx="14" ry="5" fill="#FFD93D" opacity="0.7" />
          
          {/* Gorse cluster 4 - right */}
          <ellipse cx="1200" cy="82" rx="32" ry="13" fill="#2A4A1A" opacity="0.65" />
          <ellipse cx="1195" cy="76" rx="24" ry="9" fill="#E8B923" opacity="0.75" />
          <ellipse cx="1212" cy="78" rx="16" ry="6" fill="#FFD93D" opacity="0.65" />
        </g>
        
        {/* BOG COTTON - White fluffy heads in wet areas */}
        <g className="bog-cotton">
          {/* Bog cotton cluster 1 */}
          <circle cx="60" cy="125" r="3" fill="#FFFEF0" opacity="0.9" />
          <circle cx="68" cy="122" r="2.5" fill="#FFFEF0" opacity="0.85" />
          <circle cx="55" cy="128" r="2" fill="#FFF8E7" opacity="0.8" />
          <circle cx="72" cy="127" r="2.5" fill="#FFFEF0" opacity="0.85" />
          
          {/* Bog cotton cluster 2 */}
          <circle cx="280" cy="102" r="3" fill="#FFFEF0" opacity="0.9" />
          <circle cx="290" cy="98" r="2.5" fill="#FFFEF0" opacity="0.85" />
          <circle cx="275" cy="106" r="2" fill="#FFF8E7" opacity="0.8" />
          <circle cx="295" cy="104" r="2" fill="#FFFEF0" opacity="0.8" />
          
          {/* Bog cotton cluster 3 */}
          <circle cx="620" cy="85" r="3" fill="#FFFEF0" opacity="0.9" />
          <circle cx="628" cy="82" r="2.5" fill="#FFFEF0" opacity="0.85" />
          <circle cx="615" cy="88" r="2" fill="#FFF8E7" opacity="0.8" />
          
          {/* Bog cotton cluster 4 */}
          <circle cx="980" cy="78" r="3" fill="#FFFEF0" opacity="0.9" />
          <circle cx="988" cy="75" r="2.5" fill="#FFFEF0" opacity="0.85" />
          <circle cx="975" cy="81" r="2" fill="#FFF8E7" opacity="0.8" />
          <circle cx="992" cy="80" r="2" fill="#FFFEF0" opacity="0.8" />
          
          {/* Bog cotton cluster 5 */}
          <circle cx="1380" cy="92" r="3" fill="#FFFEF0" opacity="0.9" />
          <circle cx="1388" cy="89" r="2.5" fill="#FFFEF0" opacity="0.85" />
          <circle cx="1375" cy="95" r="2" fill="#FFF8E7" opacity="0.8" />
        </g>
        
        {/* BRACKEN patches - russet-brown dead bracken */}
        <g className="bracken-patches">
          <ellipse cx="170" cy="118" rx="20" ry="6" fill="#8B7355" opacity="0.5" />
          <ellipse cx="450" cy="92" rx="25" ry="7" fill="#9B8365" opacity="0.45" />
          <ellipse cx="780" cy="82" rx="22" ry="6" fill="#8B7355" opacity="0.5" />
          <ellipse cx="1150" cy="88" rx="28" ry="8" fill="#9B8365" opacity="0.45" />
        </g>
        
        {/* GRAZING SHEEP - white dots scattered across pastures */}
        <g className="grazing-sheep">
          {/* Far field sheep (smaller, more distant) */}
          <ellipse cx="180" cy="85" rx="4" ry="2.5" fill="#F8F8F5" opacity="0.7" />
          <circle cx="178" cy="84" r="1.5" fill="#F0F0EC" opacity="0.6" />
          
          <ellipse cx="320" cy="78" rx="3.5" ry="2" fill="#F8F8F5" opacity="0.65" />
          <circle cx="318" cy="77" r="1.3" fill="#F0F0EC" opacity="0.55" />
          
          <ellipse cx="560" cy="72" rx="4" ry="2.5" fill="#F8F8F5" opacity="0.7" />
          <circle cx="558" cy="71" r="1.5" fill="#F0F0EC" opacity="0.6" />
          
          <ellipse cx="680" cy="68" rx="3.5" ry="2" fill="#F8F8F5" opacity="0.6" />
          
          <ellipse cx="850" cy="70" rx="4" ry="2.5" fill="#F8F8F5" opacity="0.7" />
          <circle cx="848" cy="69" r="1.5" fill="#F0F0EC" opacity="0.6" />
          
          <ellipse cx="1020" cy="72" rx="3.5" ry="2" fill="#F8F8F5" opacity="0.65" />
          
          <ellipse cx="1250" cy="75" rx="4" ry="2.5" fill="#F8F8F5" opacity="0.7" />
          <circle cx="1248" cy="74" r="1.5" fill="#F0F0EC" opacity="0.6" />
          
          {/* Mid-field sheep (medium size) */}
          <ellipse cx="95" cy="115" rx="5" ry="3" fill="#FAFAF7" opacity="0.8" />
          <circle cx="92" cy="113.5" r="2" fill="#F5F5F0" opacity="0.7" />
          
          <ellipse cx="240" cy="100" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.85" />
          <circle cx="237" cy="98.5" r="2.2" fill="#F5F5F0" opacity="0.75" />
          
          <ellipse cx="420" cy="94" rx="5" ry="3" fill="#FAFAF7" opacity="0.8" />
          <circle cx="417" cy="92.5" r="2" fill="#F5F5F0" opacity="0.7" />
          
          <ellipse cx="590" cy="88" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.85" />
          <circle cx="587" cy="86.5" r="2.2" fill="#F5F5F0" opacity="0.75" />
          
          <ellipse cx="760" cy="85" rx="5" ry="3" fill="#FAFAF7" opacity="0.8" />
          <circle cx="757" cy="83.5" r="2" fill="#F5F5F0" opacity="0.7" />
          
          <ellipse cx="920" cy="82" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.85" />
          <circle cx="917" cy="80.5" r="2.2" fill="#F5F5F0" opacity="0.75" />
          
          <ellipse cx="1100" cy="86" rx="5" ry="3" fill="#FAFAF7" opacity="0.8" />
          <circle cx="1097" cy="84.5" r="2" fill="#F5F5F0" opacity="0.7" />
          
          <ellipse cx="1300" cy="88" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.85" />
          <circle cx="1297" cy="86.5" r="2.2" fill="#F5F5F0" opacity="0.75" />
          
          {/* Foreground sheep (larger, grazing poses) */}
          <ellipse cx="150" cy="135" rx="7" ry="4" fill="#FFFFFF" opacity="0.9" />
          <circle cx="145" cy="132.5" r="3" fill="#FAFAF7" opacity="0.85" />
          <ellipse cx="142" cy="133" rx="1.2" ry="0.8" fill="#4A4453" opacity="0.5" /> {/* ear */}
          
          <ellipse cx="480" cy="120" rx="6.5" ry="3.8" fill="#FFFFFF" opacity="0.88" />
          <circle cx="475" cy="117.5" r="2.8" fill="#FAFAF7" opacity="0.82" />
          <ellipse cx="473" cy="118" rx="1" ry="0.7" fill="#4A4453" opacity="0.45" />
          
          <ellipse cx="820" cy="115" rx="7" ry="4" fill="#FFFFFF" opacity="0.9" />
          <circle cx="815" cy="112.5" r="3" fill="#FAFAF7" opacity="0.85" />
          <ellipse cx="812" cy="113" rx="1.2" ry="0.8" fill="#4A4453" opacity="0.5" />
          
          <ellipse cx="1180" cy="118" rx="6.5" ry="3.8" fill="#FFFFFF" opacity="0.88" />
          <circle cx="1175" cy="115.5" r="2.8" fill="#FAFAF7" opacity="0.82" />
          <ellipse cx="1172" cy="116" rx="1" ry="0.7" fill="#4A4453" opacity="0.45" />
          
          {/* Pair of sheep together */}
          <ellipse cx="650" cy="105" rx="6" ry="3.5" fill="#FAFAF7" opacity="0.85" />
          <circle cx="646" cy="103" r="2.5" fill="#F5F5F0" opacity="0.78" />
          <ellipse cx="668" cy="108" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.82" />
          <circle cx="664" cy="106" r="2.3" fill="#F5F5F0" opacity="0.75" />
          
          {/* Small flock in distance */}
          <ellipse cx="1380" cy="95" rx="4" ry="2.2" fill="#F5F5F0" opacity="0.7" />
          <ellipse cx="1395" cy="97" rx="3.5" ry="2" fill="#F5F5F0" opacity="0.65" />
          <ellipse cx="1410" cy="94" rx="4" ry="2.2" fill="#F5F5F0" opacity="0.7" />
        </g>
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
