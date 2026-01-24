import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WeatherSelector } from "./WeatherSelector";

/**
 * WICKLOW HERO LANDSCAPE — DYNAMIC WEATHER, TERRAIN & TIME OF DAY
 * 
 * Large hero banner background featuring:
 * - Sky with dynamic weather (sun, clouds, rain, storm, thunder, snow, fog)
 * - Time-of-day lighting (dawn, midday, dusk, night)
 * - Sugarloaf Mountain with green lower slopes and stony grey top
 * - Random scattered trees on terrain
 * - Parallax layering for depth
 * - Enhanced animated weather effects
 * - Optional interactive weather selector control
 */

// Weather types for hero variation - extended set
export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "thunder" | "snowy" | "foggy" | "windy";

// Time of day for lighting variation - including night
export type TimeOfDay = "dawn" | "midday" | "dusk" | "night";

interface WicklowHeroLandscapeProps {
  weather?: WeatherType | "random";
  timeOfDay?: TimeOfDay | "auto" | "random";
  className?: string;
  showTrees?: boolean;
  intensity?: number; // 0-100 for weather intensity
  enableSnow?: boolean;
  enableFog?: boolean;
  showWeatherControl?: boolean; // Show interactive weather selector
}

// Random weather selection with weights
// Irish-appropriate weather weights with new types
const WEATHER_WEIGHTS: { type: WeatherType; weight: number }[] = [
  { type: "cloudy", weight: 28 },
  { type: "rainy", weight: 22 },
  { type: "sunny", weight: 15 },
  { type: "foggy", weight: 12 },
  { type: "windy", weight: 10 },
  { type: "stormy", weight: 6 },
  { type: "thunder", weight: 4 },
  { type: "snowy", weight: 3 },
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
  if (hour >= 5 && hour < 9) return "dawn";       // 5am-9am: golden hour
  if (hour >= 9 && hour < 17) return "midday";    // 9am-5pm: bright day
  if (hour >= 17 && hour < 21) return "dusk";     // 5pm-9pm: sunset
  return "night";                                  // 9pm-5am: night
}

function getRandomTimeOfDay(): TimeOfDay {
  const times: TimeOfDay[] = ["dawn", "midday", "dusk", "night"];
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
  night: {
    // Night: deep blues, silhouettes, moonlit atmosphere
    sky: `linear-gradient(to bottom, 
      hsl(230 35% 15%) 0%, 
      hsl(220 30% 22%) 30%,
      hsl(215 25% 28%) 60%,
      hsl(210 20% 35%) 100%
    )`,
    quartziteSummit: ["#252530", "#303040", "#3A3A4A"],
    heatherSlopes: ["#2A2A3A", "#353545", "#404050"],
    forestSlopes: ["#1A2A1A", "#253025", "#2A3A2A"],
    distantHills: ["#3A3A4A", "#353545"],
    atmosphereOpacity: 0.4,
  },
};

export function WicklowHeroLandscape({
  weather = "random",
  timeOfDay = "auto",
  className,
  showTrees = true,
  intensity = 50,
  enableSnow = true,
  enableFog = true,
  showWeatherControl = false,
}: WicklowHeroLandscapeProps) {
  // Manual override state for interactive control
  const [manualWeather, setManualWeather] = useState<WeatherType | null>(null);
  const [manualTime, setManualTime] = useState<TimeOfDay | null>(null);

  // Stable random weather for component lifetime
  const initialWeather = useMemo<WeatherType>(() => {
    if (weather === "random") {
      const random = getRandomWeather();
      // Respect enable flags
      if (random === "snowy" && !enableSnow) return "cloudy";
      if (random === "foggy" && !enableFog) return "cloudy";
      return random;
    }
    return weather;
  }, [weather, enableSnow, enableFog]);

  // Resolve time of day
  const initialTime = useMemo<TimeOfDay>(() => {
    if (timeOfDay === "auto") return getTimeOfDayFromHour();
    if (timeOfDay === "random") return getRandomTimeOfDay();
    return timeOfDay;
  }, [timeOfDay]);

  // Use manual overrides if set, otherwise use initial values
  const resolvedWeather = manualWeather ?? initialWeather;
  const resolvedTime = manualTime ?? initialTime;

  const palette = TIME_PALETTES[resolvedTime];

  // Handlers for weather selector
  const handleWeatherChange = useCallback((newWeather: WeatherType) => {
    setManualWeather(newWeather);
  }, []);

  const handleTimeChange = useCallback((newTime: TimeOfDay) => {
    setManualTime(newTime);
  }, []);

  // Stable tree positions
  const treeSeed = useMemo(() => Math.floor(Math.random() * 10000), []);
  const trees = useMemo(() => showTrees ? generateTrees(4 + Math.floor(Math.random() * 4), treeSeed) : [], [showTrees, treeSeed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Weather Control UI */}
      {showWeatherControl && (
        <WeatherSelector
          weather={resolvedWeather}
          timeOfDay={resolvedTime}
          onWeatherChange={handleWeatherChange}
          onTimeChange={handleTimeChange}
          className="top-4 right-4"
        />
      )}

      {/* SKY LAYER */}
      <SkyLayer weather={resolvedWeather} timeOfDay={resolvedTime} palette={palette} intensity={intensity} />
      
      {/* DISTANT V-FORMATION FLOCK */}
      <VFormationFlock weather={resolvedWeather} />
      
      {/* FLYING BIRDS */}
      <FlyingBirds weather={resolvedWeather} />
      
      {/* WEATHER EFFECTS (top of hero) */}
      <WeatherEffectsLayer weather={resolvedWeather} intensity={intensity} timeOfDay={resolvedTime} />
      
      {/* DISTANT MOUNTAINS - Sugarloaf with stony top */}
      <SugarloafMountain palette={palette} />
      
      {/* MID-RANGE HILLS */}
      <RollingHills palette={palette} />
      
      {/* FOREGROUND BOG TERRAIN with trees */}
      <BogTerrain trees={trees} palette={palette} />
      
      {/* LOW MIST - Enhanced for foggy/night */}
      <MistLayer weather={resolvedWeather} timeOfDay={resolvedTime} />
      
      {/* SNOW ACCUMULATION (subtle) */}
      {resolvedWeather === "snowy" && <SnowAccumulation />}
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
// FLYING BIRDS - Occasional silhouettes crossing the sky
// ============================================================================
function FlyingBirds({ weather }: { weather: WeatherType }) {
  // Fewer/no birds during storms
  const birdCount = weather === "thunder" || weather === "stormy" ? 0 : weather === "rainy" ? 2 : 4;
  
  const birds = useMemo(() => {
    return Array.from({ length: birdCount }, (_, i) => ({
      id: i,
      startY: 8 + Math.random() * 25, // 8-33% from top
      duration: 15 + Math.random() * 20, // 15-35 seconds to cross
      delay: Math.random() * 12, // Staggered start
      scale: 0.5 + Math.random() * 0.5, // Size variation
      direction: Math.random() > 0.3 ? 1 : -1, // Mostly left-to-right
      flapSpeed: 0.3 + Math.random() * 0.3, // Wing flap variation
    }));
  }, [birdCount]);

  if (birdCount === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {birds.map((bird) => (
        <motion.div
          key={bird.id}
          className="absolute"
          style={{
            top: `${bird.startY}%`,
            left: bird.direction === 1 ? "-5%" : "105%",
          }}
          animate={{
            x: bird.direction === 1 ? ["0vw", "110vw"] : ["0vw", "-110vw"],
            y: [0, -10, 5, -8, 0], // Slight vertical bobbing
          }}
          transition={{
            x: {
              duration: bird.duration,
              repeat: Infinity,
              delay: bird.delay,
              ease: "linear",
            },
            y: {
              duration: bird.duration / 4,
              repeat: Infinity,
              delay: bird.delay,
              ease: "easeInOut",
            },
          }}
        >
          {/* Bird silhouette SVG */}
          <svg
            width={24 * bird.scale}
            height={12 * bird.scale}
            viewBox="0 0 24 12"
            className="opacity-60"
            style={{ transform: bird.direction === -1 ? "scaleX(-1)" : undefined }}
          >
            {/* Wings that flap */}
            <motion.path
              d="M12 6 Q6 2, 0 4 Q6 4, 12 6"
              fill="none"
              stroke="hsl(220 15% 20%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{
                d: [
                  "M12 6 Q6 2, 0 4 Q6 4, 12 6",
                  "M12 6 Q6 6, 0 6 Q6 6, 12 6",
                  "M12 6 Q6 9, 0 7 Q6 7, 12 6",
                  "M12 6 Q6 6, 0 6 Q6 6, 12 6",
                  "M12 6 Q6 2, 0 4 Q6 4, 12 6",
                ],
              }}
              transition={{
                duration: bird.flapSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M12 6 Q18 2, 24 4 Q18 4, 12 6"
              fill="none"
              stroke="hsl(220 15% 20%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{
                d: [
                  "M12 6 Q18 2, 24 4 Q18 4, 12 6",
                  "M12 6 Q18 6, 24 6 Q18 6, 12 6",
                  "M12 6 Q18 9, 24 7 Q18 7, 12 6",
                  "M12 6 Q18 6, 24 6 Q18 6, 12 6",
                  "M12 6 Q18 2, 24 4 Q18 4, 12 6",
                ],
              }}
              transition={{
                duration: bird.flapSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Body */}
            <ellipse cx="12" cy="6" rx="3" ry="1.5" fill="hsl(220 15% 20%)" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// V-FORMATION FLOCK - Distant birds occasionally crossing the horizon
// ============================================================================
function VFormationFlock({ weather }: { weather: WeatherType }) {
  // No flocks during bad weather
  const showFlock = weather === "sunny" || weather === "cloudy";
  
  // Random chance to show flock (about 60% of the time for good weather)
  const shouldShow = useMemo(() => showFlock && Math.random() > 0.4, [showFlock]);
  
  const flockConfig = useMemo(() => ({
    direction: Math.random() > 0.5 ? 1 : -1, // Left or right
    y: 12 + Math.random() * 10, // 12-22% from top (near horizon)
    duration: 45 + Math.random() * 30, // 45-75 seconds (slow, distant)
    delay: 3 + Math.random() * 8, // Slight delay before appearing
    birdCount: 7 + Math.floor(Math.random() * 6), // 7-12 birds
    scale: 0.25 + Math.random() * 0.15, // Small, distant birds
  }), []);

  // Generate V-formation positions
  const birds = useMemo(() => {
    const positions: { x: number; y: number; delay: number }[] = [];
    const { birdCount } = flockConfig;
    
    // Leader at front
    positions.push({ x: 0, y: 0, delay: 0 });
    
    // Wings of the V
    for (let i = 1; i < birdCount; i++) {
      const side = i % 2 === 0 ? 1 : -1; // Alternate sides
      const row = Math.ceil(i / 2);
      positions.push({
        x: row * 12 * side, // Spread horizontally
        y: row * 8, // Offset back
        delay: row * 0.05, // Slight wing flap delay
      });
    }
    
    return positions;
  }, [flockConfig.birdCount]);

  if (!shouldShow) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          top: `${flockConfig.y}%`,
          left: flockConfig.direction === 1 ? "-10%" : "110%",
        }}
        initial={{ x: 0, opacity: 0 }}
        animate={{
          x: flockConfig.direction === 1 ? "120vw" : "-120vw",
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{
          x: {
            duration: flockConfig.duration,
            delay: flockConfig.delay,
            ease: "linear",
          },
          opacity: {
            duration: flockConfig.duration,
            delay: flockConfig.delay,
            times: [0, 0.05, 0.9, 0.95, 1],
          },
        }}
      >
        <svg
          width={150 * flockConfig.scale}
          height={100 * flockConfig.scale}
          viewBox="-60 -10 120 80"
          className="opacity-40"
          style={{ transform: flockConfig.direction === -1 ? "scaleX(-1)" : undefined }}
        >
          {birds.map((bird, i) => (
            <g key={i} transform={`translate(${bird.x}, ${bird.y})`}>
              {/* Simple distant bird shape - just a curved line */}
              <motion.path
                d="M-4 0 Q0 -2, 4 0 Q0 2, -4 0"
                fill="none"
                stroke="hsl(220 20% 25%)"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M-4 0 Q0 -2, 4 0",
                    "M-4 0 Q0 0, 4 0",
                    "M-4 0 Q0 1, 4 0",
                    "M-4 0 Q0 0, 4 0",
                    "M-4 0 Q0 -2, 4 0",
                  ],
                }}
                transition={{
                  duration: 0.6 + bird.delay,
                  repeat: Infinity,
                  delay: bird.delay,
                  ease: "easeInOut",
                }}
              />
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}

// ============================================================================
// WEATHER EFFECTS LAYER - Enhanced with all weather types
// ============================================================================
function WeatherEffectsLayer({ weather, intensity, timeOfDay }: { weather: WeatherType; intensity: number; timeOfDay: TimeOfDay }) {
  return (
    <div className="absolute inset-0">
      {/* SUN with rays (sunny/cloudy during day) */}
      {(weather === "sunny" || weather === "cloudy") && timeOfDay !== "night" && <SunWithRays timeOfDay={timeOfDay} />}
      
      {/* MOON for night */}
      {timeOfDay === "night" && <MoonGlow />}
      
      {/* CLOUDS - all weather types have some clouds */}
      <CloudLayer weather={weather} />
      
      {/* RAIN */}
      {(weather === "rainy" || weather === "stormy" || weather === "thunder") && (
        <RainEffect intensity={weather === "stormy" || weather === "thunder" ? 80 : intensity} />
      )}
      
      {/* SNOW */}
      {weather === "snowy" && <SnowEffect intensity={intensity} />}
      
      {/* FOG layers */}
      {weather === "foggy" && <FogEffect intensity={intensity} />}
      
      {/* STORM WIND */}
      {(weather === "stormy" || weather === "thunder" || weather === "windy") && <WindStreaks intensity={intensity} />}
      
      {/* LIGHTNING */}
      {weather === "thunder" && <LightningEffect />}
    </div>
  );
}

// Keep legacy export for backwards compatibility
function WeatherEffects({ weather, intensity }: { weather: WeatherType; intensity: number }) {
  return <WeatherEffectsLayer weather={weather} intensity={intensity} timeOfDay="midday" />;
}

// Sun with radiating rays - time-aware
function SunWithRays({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const sunColors = {
    dawn: { core: "hsl(35 90% 65%)", glow: "hsl(25 80% 60% / 0.4)" },
    midday: { core: "hsl(45 95% 70%)", glow: "hsl(45 80% 65% / 0.3)" },
    dusk: { core: "hsl(20 85% 55%)", glow: "hsl(15 75% 50% / 0.5)" },
    night: { core: "hsl(45 10% 90%)", glow: "hsl(45 10% 85% / 0.2)" },
  }[timeOfDay];
  
  return (
    <div className="absolute top-8 right-[15%] md:right-[20%]">
      {/* Sun glow */}
      <div 
        className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" 
        style={{ background: `radial-gradient(circle, ${sunColors.glow}, transparent 70%)` }}
      />
      
      {/* Sun core */}
      <motion.div 
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full"
        style={{
          background: `radial-gradient(circle, ${sunColors.core} 0%, ${sunColors.core} 60%, ${sunColors.core} 100%)`,
          boxShadow: `0 0 60px 20px ${sunColors.glow}, 0 0 100px 40px ${sunColors.glow}`,
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

// Moon glow for night
function MoonGlow() {
  return (
    <div className="absolute top-12 right-[18%]">
      <motion.div
        className="absolute w-20 h-20 rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, hsl(45 10% 90% / 0.3), transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="relative w-10 h-10 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, hsl(45 15% 92%), hsl(45 10% 85%))",
          boxShadow: "0 0 30px 10px hsl(45 10% 85% / 0.2)",
        }}
      />
    </div>
  );
}

// Cloud layer - varies by weather (now supports all types)
function CloudLayer({ weather }: { weather: WeatherType }) {
  const cloudConfigs: Record<WeatherType, { count: number; opacity: number; dark: boolean }> = {
    sunny: { count: 3, opacity: 0.6, dark: false },
    cloudy: { count: 6, opacity: 0.8, dark: false },
    rainy: { count: 8, opacity: 0.9, dark: true },
    stormy: { count: 10, opacity: 0.95, dark: true },
    thunder: { count: 12, opacity: 1, dark: true },
    snowy: { count: 7, opacity: 0.85, dark: false },
    foggy: { count: 10, opacity: 0.7, dark: false },
    windy: { count: 5, opacity: 0.65, dark: false },
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

// Wind streaks for storms - now takes intensity
function WindStreaks({ intensity }: { intensity: number }) {
  const streakCount = 4 + Math.floor(intensity / 20);
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(streakCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5"
          style={{
            top: `${15 + i * 12}%`,
            width: `${100 + i * 50}px`,
            background: "linear-gradient(90deg, transparent, hsl(200 20% 85% / 0.25), transparent)",
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

// Snow effect with falling flakes
function SnowEffect({ intensity }: { intensity: number }) {
  const flakeCount = Math.floor(intensity / 2);
  const flakes = useMemo(() => 
    Array.from({ length: flakeCount }, (_, i) => ({
      id: i,
      x: (i * 4.3) % 100,
      size: 2 + Math.random() * 4,
      speed: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      drift: 15 + Math.random() * 30,
    })), [flakeCount]
  );

  return (
    <div className="absolute inset-0">
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            width: flake.size,
            height: flake.size,
            backgroundColor: "hsl(0 0% 98%)",
            boxShadow: "0 0 4px 1px hsl(0 0% 100% / 0.3)",
          }}
          animate={{
            y: ["-5%", "105%"],
            x: [0, flake.drift, -flake.drift / 2, flake.drift / 2, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: flake.speed, repeat: Infinity, delay: flake.delay, ease: "linear" },
            x: { duration: flake.speed * 0.8, repeat: Infinity, delay: flake.delay, ease: "easeInOut" },
            rotate: { duration: flake.speed * 1.2, repeat: Infinity, delay: flake.delay, ease: "linear" },
          }}
        />
      ))}
    </div>
  );
}

// Fog effect with rolling layers
function FogEffect({ intensity }: { intensity: number }) {
  const layers = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      y: 30 + i * 15,
      speed: 30 + i * 10,
      opacity: 0.15 + (intensity / 400) + i * 0.05,
      height: 80 + i * 20,
    })), [intensity]
  );

  return (
    <div className="absolute inset-0">
      {layers.map((layer) => (
        <motion.div
          key={layer.id}
          className="absolute left-0 right-0 blur-xl"
          style={{
            top: `${layer.y}%`,
            height: layer.height,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(200 15% 90% / ${layer.opacity}) 20%,
              hsl(200 10% 92% / ${layer.opacity * 1.2}) 50%,
              hsl(200 15% 90% / ${layer.opacity}) 80%,
              transparent 100%
            )`,
          }}
          animate={{ x: ["-10%", "10%", "-10%"] }}
          transition={{
            duration: layer.speed,
            repeat: Infinity,
            ease: "easeInOut",
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
        
        {/* GORSE PATCHES - Brilliant yellow with dark green base, swaying in wind */}
        <g className="gorse-patches">
          {/* Gorse cluster 1 - left */}
          <ellipse cx="200" cy="105" rx="25" ry="10" fill="#2A4A1A" opacity="0.7" />
          <ellipse cx="195" cy="100" rx="18" ry="7" fill="#E8B923" opacity="0.8">
            <animate attributeName="cx" values="195;197;194;196;195" dur="4s" repeatCount="indefinite" />
            <animate attributeName="ry" values="7;7.3;6.8;7.1;7" dur="3.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="210" cy="102" rx="12" ry="5" fill="#FFD93D" opacity="0.7">
            <animate attributeName="cx" values="210;212;209;211;210" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="ry" values="5;5.2;4.8;5.1;5" dur="2.8s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Gorse cluster 2 */}
          <ellipse cx="520" cy="88" rx="30" ry="12" fill="#2A4A1A" opacity="0.65" />
          <ellipse cx="515" cy="82" rx="22" ry="8" fill="#E8B923" opacity="0.75">
            <animate attributeName="cx" values="515;518;513;516;515" dur="4.5s" repeatCount="indefinite" />
            <animate attributeName="ry" values="8;8.4;7.7;8.2;8" dur="3.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="530" cy="84" rx="15" ry="6" fill="#FFD93D" opacity="0.65">
            <animate attributeName="cx" values="530;533;528;531;530" dur="3s" repeatCount="indefinite" />
            <animate attributeName="ry" values="6;6.3;5.7;6.1;6" dur="2.6s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Gorse cluster 3 - center-right */}
          <ellipse cx="880" cy="78" rx="28" ry="11" fill="#2A4A1A" opacity="0.7" />
          <ellipse cx="875" cy="72" rx="20" ry="7" fill="#E8B923" opacity="0.8">
            <animate attributeName="cx" values="875;878;873;876;875" dur="5s" repeatCount="indefinite" />
            <animate attributeName="ry" values="7;7.4;6.7;7.2;7" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="890" cy="74" rx="14" ry="5" fill="#FFD93D" opacity="0.7">
            <animate attributeName="cx" values="890;893;888;891;890" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="ry" values="5;5.3;4.7;5.1;5" dur="2.9s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Gorse cluster 4 - right */}
          <ellipse cx="1200" cy="82" rx="32" ry="13" fill="#2A4A1A" opacity="0.65" />
          <ellipse cx="1195" cy="76" rx="24" ry="9" fill="#E8B923" opacity="0.75">
            <animate attributeName="cx" values="1195;1198;1192;1196;1195" dur="4.2s" repeatCount="indefinite" />
            <animate attributeName="ry" values="9;9.5;8.6;9.2;9" dur="3.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="1212" cy="78" rx="16" ry="6" fill="#FFD93D" opacity="0.65">
            <animate attributeName="cx" values="1212;1215;1210;1213;1212" dur="3.3s" repeatCount="indefinite" />
            <animate attributeName="ry" values="6;6.4;5.6;6.2;6" dur="2.7s" repeatCount="indefinite" />
          </ellipse>
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
          
          {/* Foreground sheep (larger, grazing poses with head-bobbing) */}
          {/* Sheep 1 - slow grazer */}
          <g className="foreground-sheep-1">
            <ellipse cx="150" cy="135" rx="7" ry="4" fill="#FFFFFF" opacity="0.9" />
            <g className="sheep-head" style={{ transformOrigin: '145px 132.5px' }}>
              <circle cx="145" cy="132.5" r="3" fill="#FAFAF7" opacity="0.85">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.5; 0,2; 0,1.5; 0,0"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </circle>
              <ellipse cx="142" cy="133" rx="1.2" ry="0.8" fill="#4A4453" opacity="0.5">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.5; 0,2; 0,1.5; 0,0"
                  dur="4s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </ellipse>
            </g>
          </g>
          
          {/* Sheep 2 - medium pace */}
          <g className="foreground-sheep-2">
            <ellipse cx="480" cy="120" rx="6.5" ry="3.8" fill="#FFFFFF" opacity="0.88" />
            <g className="sheep-head" style={{ transformOrigin: '475px 117.5px' }}>
              <circle cx="475" cy="117.5" r="2.8" fill="#FAFAF7" opacity="0.82">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.2; 0,1.8; 0,1.2; 0,0"
                  dur="3.2s"
                  begin="0.8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </circle>
              <ellipse cx="473" cy="118" rx="1" ry="0.7" fill="#4A4453" opacity="0.45">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.2; 0,1.8; 0,1.2; 0,0"
                  dur="3.2s"
                  begin="0.8s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </ellipse>
            </g>
          </g>
          
          {/* Sheep 3 - fastest nibbler */}
          <g className="foreground-sheep-3">
            <ellipse cx="820" cy="115" rx="7" ry="4" fill="#FFFFFF" opacity="0.9" />
            <g className="sheep-head" style={{ transformOrigin: '815px 112.5px' }}>
              <circle cx="815" cy="112.5" r="3" fill="#FAFAF7" opacity="0.85">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1; 0,1.5; 0,1; 0,0"
                  dur="2.5s"
                  begin="1.5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </circle>
              <ellipse cx="812" cy="113" rx="1.2" ry="0.8" fill="#4A4453" opacity="0.5">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1; 0,1.5; 0,1; 0,0"
                  dur="2.5s"
                  begin="1.5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </ellipse>
            </g>
          </g>
          
          {/* Sheep 4 - contemplative grazer */}
          <g className="foreground-sheep-4">
            <ellipse cx="1180" cy="118" rx="6.5" ry="3.8" fill="#FFFFFF" opacity="0.88" />
            <g className="sheep-head" style={{ transformOrigin: '1175px 115.5px' }}>
              <circle cx="1175" cy="115.5" r="2.8" fill="#FAFAF7" opacity="0.82">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.3; 0,2; 0,1.3; 0,0"
                  dur="5s"
                  begin="2.2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </circle>
              <ellipse cx="1172" cy="116" rx="1" ry="0.7" fill="#4A4453" opacity="0.45">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1.3; 0,2; 0,1.3; 0,0"
                  dur="5s"
                  begin="2.2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </ellipse>
            </g>
          </g>
          
          {/* Pair of sheep together - one grazing, one looking up */}
          <g className="sheep-pair">
            <ellipse cx="650" cy="105" rx="6" ry="3.5" fill="#FAFAF7" opacity="0.85" />
            <g className="sheep-head" style={{ transformOrigin: '646px 103px' }}>
              <circle cx="646" cy="103" r="2.5" fill="#F5F5F0" opacity="0.78">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 0,1; 0,1.5; 0,1; 0,0"
                  dur="3.5s"
                  begin="0.5s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
                />
              </circle>
            </g>
            {/* Second sheep - static (looking around) */}
            <ellipse cx="668" cy="108" rx="5.5" ry="3.2" fill="#FAFAF7" opacity="0.82" />
            <circle cx="664" cy="106" r="2.3" fill="#F5F5F0" opacity="0.75" />
          </g>
          
          {/* Small flock in distance (static - too far for visible animation) */}
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
function MistLayer({ weather, timeOfDay }: { weather: WeatherType; timeOfDay: TimeOfDay }) {
  const mistIntensity = weather === "foggy" ? 0.6 : timeOfDay === "dawn" ? 0.4 : timeOfDay === "night" ? 0.35 : 0.25;
  
  return (
    <>
      <div
        className="absolute bottom-[12%] left-0 w-full h-32 blur-lg"
        style={{
          background: `linear-gradient(to top, 
            hsl(200 15% 90% / ${mistIntensity}), 
            transparent
          )`,
        }}
      />
      
      {/* Drifting mist wisps */}
      {[...Array(weather === "foggy" ? 6 : 4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: `${100 + i * 40}px`,
            height: `${30 + i * 10}px`,
            left: `${10 + i * 18}%`,
            bottom: `${8 + (i % 2) * 8}%`,
            backgroundColor: `hsl(200 12% 88% / ${mistIntensity * 0.6})`,
          }}
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

// Snow accumulation effect on ground
function SnowAccumulation() {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 h-[15%]"
      style={{
        background: "linear-gradient(to top, hsl(0 0% 98% / 0.4) 0%, hsl(0 0% 95% / 0.2) 50%, transparent 100%)",
      }}
    />
  );
}

export default WicklowHeroLandscape;
