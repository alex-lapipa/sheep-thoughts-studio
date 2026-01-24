import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * ANIMATED WEATHER EFFECTS — Dynamic Wicklow Weather System
 * 
 * Provides realistic animated weather effects:
 * - Rain (light drizzle to heavy downpour)
 * - Snow (gentle flurries to blizzard)
 * - Fog/Mist (rolling atmospheric layers)
 * - Wind (visible gusts and streaks)
 * - Lightning (random flashes with fork effects)
 * - Sun rays (dynamic god rays)
 * - Falling leaves (autumn effect)
 */

export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "thunder" | "snowy" | "foggy" | "windy";
export type TimeOfDay = "dawn" | "midday" | "dusk" | "night";

interface WeatherEffectsProps {
  weather: WeatherType;
  intensity?: number; // 0-100
  timeOfDay?: TimeOfDay;
  showParticles?: boolean;
}

// Weather selection with Irish-appropriate weights
const WEATHER_WEIGHTS: { type: WeatherType; weight: number }[] = [
  { type: "cloudy", weight: 30 },
  { type: "rainy", weight: 25 },
  { type: "sunny", weight: 15 },
  { type: "foggy", weight: 12 },
  { type: "windy", weight: 8 },
  { type: "stormy", weight: 5 },
  { type: "thunder", weight: 3 },
  { type: "snowy", weight: 2 },
];

export function getRandomWeather(): WeatherType {
  const total = WEATHER_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const w of WEATHER_WEIGHTS) {
    roll -= w.weight;
    if (roll <= 0) return w.type;
  }
  return "cloudy";
}

export function getTimeOfDayFromHour(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 17) return "midday";
  if (hour >= 17 && hour < 21) return "dusk";
  return "night";
}

export function WeatherEffects({ 
  weather, 
  intensity = 50, 
  timeOfDay = "midday",
  showParticles = true 
}: WeatherEffectsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sun/Moon based on time */}
      {(weather === "sunny" || weather === "cloudy") && (
        <CelestialBody timeOfDay={timeOfDay} weather={weather} />
      )}
      
      {/* Clouds - present in most weather */}
      {weather !== "sunny" && <AnimatedClouds weather={weather} intensity={intensity} />}
      
      {/* Rain effects */}
      {(weather === "rainy" || weather === "stormy" || weather === "thunder") && (
        <RainParticles intensity={weather === "stormy" || weather === "thunder" ? 90 : intensity} />
      )}
      
      {/* Snow effects */}
      {weather === "snowy" && showParticles && <SnowParticles intensity={intensity} />}
      
      {/* Fog layers */}
      {weather === "foggy" && <FogLayers intensity={intensity} />}
      
      {/* Wind streaks */}
      {(weather === "windy" || weather === "stormy") && <WindStreaks intensity={intensity} />}
      
      {/* Lightning */}
      {weather === "thunder" && <LightningBolts />}
      
      {/* God rays for sunny/dawn/dusk */}
      {weather === "sunny" && (timeOfDay === "dawn" || timeOfDay === "dusk") && <GodRays />}
      
      {/* Falling leaves (occasional) */}
      {(weather === "windy" || weather === "cloudy") && Math.random() > 0.5 && (
        <FallingLeaves count={weather === "windy" ? 12 : 5} />
      )}
      
      {/* Mist at ground level */}
      <GroundMist weather={weather} timeOfDay={timeOfDay} />
    </div>
  );
}

// ============================================================================
// CELESTIAL BODY — Sun or Moon with glow
// ============================================================================
function CelestialBody({ timeOfDay, weather }: { timeOfDay: TimeOfDay; weather: WeatherType }) {
  const isMoon = timeOfDay === "night";
  const dimmed = weather === "cloudy";
  
  const position = {
    dawn: { top: "15%", right: "25%" },
    midday: { top: "8%", right: "20%" },
    dusk: { top: "20%", right: "15%" },
    night: { top: "12%", right: "18%" },
  }[timeOfDay];

  const sunColors = {
    dawn: { core: "hsl(35 90% 65%)", glow: "hsl(25 80% 60% / 0.4)" },
    midday: { core: "hsl(45 95% 70%)", glow: "hsl(45 80% 65% / 0.3)" },
    dusk: { core: "hsl(20 85% 55%)", glow: "hsl(15 75% 50% / 0.5)" },
    night: { core: "hsl(45 10% 90%)", glow: "hsl(45 10% 85% / 0.2)" },
  }[timeOfDay];

  return (
    <div className="absolute" style={position}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: isMoon ? "80px" : "120px",
          height: isMoon ? "80px" : "120px",
          background: `radial-gradient(circle, ${sunColors.glow}, transparent 70%)`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: dimmed ? [0.3, 0.4, 0.3] : [0.6, 0.8, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Core */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: isMoon ? "40px" : "60px",
          height: isMoon ? "40px" : "60px",
          background: `radial-gradient(circle at 30% 30%, ${sunColors.core}, ${sunColors.core})`,
          boxShadow: `0 0 40px 10px ${sunColors.glow}`,
          opacity: dimmed ? 0.6 : 1,
        }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Moon craters (only for night) */}
      {isMoon && (
        <svg className="absolute inset-0 w-10 h-10" viewBox="0 0 40 40">
          <circle cx="12" cy="15" r="3" fill="hsl(45 5% 75%)" opacity="0.3" />
          <circle cx="25" cy="22" r="4" fill="hsl(45 5% 70%)" opacity="0.25" />
          <circle cx="18" cy="28" r="2" fill="hsl(45 5% 72%)" opacity="0.2" />
        </svg>
      )}
    </div>
  );
}

// ============================================================================
// ANIMATED CLOUDS — Drifting with parallax
// ============================================================================
function AnimatedClouds({ weather, intensity }: { weather: WeatherType; intensity: number }) {
  const cloudCount = useMemo(() => {
    const baseCounts: Record<WeatherType, number> = {
      sunny: 2,
      cloudy: 5,
      rainy: 7,
      stormy: 9,
      thunder: 10,
      snowy: 6,
      foggy: 8,
      windy: 4,
    };
    return baseCounts[weather] || 5;
  }, [weather]);

  const isDark = ["rainy", "stormy", "thunder"].includes(weather);

  const clouds = useMemo(() => 
    Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      x: (i * 17 + Math.random() * 10) % 100,
      y: 5 + (i % 4) * 10 + Math.random() * 5,
      size: 80 + Math.random() * 60,
      speed: 20 + Math.random() * 15,
      opacity: 0.5 + (intensity / 200) + Math.random() * 0.2,
      layer: i % 3,
    })), [cloudCount, intensity]
  );

  return (
    <div className="absolute top-0 left-0 right-0 h-[50%]">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            zIndex: cloud.layer,
          }}
          animate={{ x: ["0%", "15%", "0%"] }}
          transition={{
            duration: cloud.speed,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <CloudShape size={cloud.size} opacity={cloud.opacity} dark={isDark} />
        </motion.div>
      ))}
    </div>
  );
}

function CloudShape({ size, opacity, dark }: { size: number; opacity: number; dark: boolean }) {
  const baseColor = dark ? "hsl(210 15% 35%)" : "hsl(0 0% 96%)";
  const shadowColor = dark ? "hsl(220 20% 20%)" : "hsl(210 10% 88%)";
  
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 140 70" style={{ opacity }}>
      <defs>
        <linearGradient id={`cloud-${size}-${dark ? 'd' : 'l'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={baseColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </linearGradient>
        <filter id="cloudBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <g filter="url(#cloudBlur)">
        <ellipse cx="40" cy="45" rx="28" ry="20" fill={`url(#cloud-${size}-${dark ? 'd' : 'l'})`} />
        <ellipse cx="65" cy="35" rx="35" ry="25" fill={`url(#cloud-${size}-${dark ? 'd' : 'l'})`} />
        <ellipse cx="95" cy="42" rx="30" ry="22" fill={`url(#cloud-${size}-${dark ? 'd' : 'l'})`} />
        <ellipse cx="70" cy="52" rx="40" ry="16" fill={shadowColor} opacity="0.4" />
      </g>
    </svg>
  );
}

// ============================================================================
// RAIN PARTICLES — Realistic falling droplets
// ============================================================================
function RainParticles({ intensity }: { intensity: number }) {
  const dropCount = Math.floor(intensity / 1.5);
  
  const drops = useMemo(() => 
    Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      x: (i * 3.7) % 100,
      length: 12 + (i % 5) * 6,
      speed: 0.4 + (i % 4) * 0.15,
      delay: (i % 25) * 0.08,
      opacity: 0.3 + Math.random() * 0.4,
    })), [dropCount]
  );

  return (
    <div className="absolute inset-0">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-[1px] rounded-full"
          style={{
            left: `${drop.x}%`,
            height: `${drop.length}px`,
            background: `linear-gradient(to bottom, transparent, hsl(200 40% 70% / ${drop.opacity}), hsl(200 50% 80% / ${drop.opacity * 0.8}))`,
          }}
          animate={{
            y: ["-5%", "105%"],
            opacity: [0, drop.opacity, drop.opacity, 0],
          }}
          transition={{
            duration: drop.speed,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Rain splash at bottom */}
      {intensity > 50 && <RainSplashes count={Math.floor(intensity / 10)} />}
    </div>
  );
}

function RainSplashes({ count }: { count: number }) {
  const splashes = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 5 + (i * 13) % 90,
      delay: Math.random() * 2,
      size: 3 + Math.random() * 2,
    })), [count]
  );

  return (
    <>
      {splashes.map((splash) => (
        <motion.div
          key={splash.id}
          className="absolute bottom-[5%] rounded-full border border-blue-200/30"
          style={{
            left: `${splash.x}%`,
            width: splash.size * 2,
            height: splash.size,
          }}
          animate={{
            scale: [0, 1.5, 2],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: splash.delay,
            repeatDelay: 0.8,
          }}
        />
      ))}
    </>
  );
}

// ============================================================================
// SNOW PARTICLES — Gentle floating flakes
// ============================================================================
function SnowParticles({ intensity }: { intensity: number }) {
  const flakeCount = Math.floor(intensity / 2);
  
  const flakes = useMemo(() => 
    Array.from({ length: flakeCount }, (_, i) => ({
      id: i,
      x: (i * 4.3) % 100,
      size: 2 + Math.random() * 4,
      speed: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      drift: 15 + Math.random() * 30,
      opacity: 0.5 + Math.random() * 0.4,
    })), [flakeCount]
  );

  return (
    <div className="absolute inset-0">
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            boxShadow: "0 0 4px 1px rgba(255,255,255,0.3)",
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

// ============================================================================
// FOG LAYERS — Rolling atmospheric mist
// ============================================================================
function FogLayers({ intensity }: { intensity: number }) {
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

// ============================================================================
// WIND STREAKS — Visible gusts
// ============================================================================
function WindStreaks({ intensity }: { intensity: number }) {
  const streakCount = 4 + Math.floor(intensity / 20);
  
  const streaks = useMemo(() => 
    Array.from({ length: streakCount }, (_, i) => ({
      id: i,
      y: 10 + i * 12,
      length: 80 + Math.random() * 100,
      speed: 1 + Math.random() * 0.8,
      delay: i * 0.3,
      opacity: 0.15 + Math.random() * 0.2,
    })), [streakCount]
  );

  return (
    <div className="absolute inset-0">
      {streaks.map((streak) => (
        <motion.div
          key={streak.id}
          className="absolute h-[1px]"
          style={{
            top: `${streak.y}%`,
            width: streak.length,
            background: `linear-gradient(90deg, transparent, hsl(200 20% 85% / ${streak.opacity}), transparent)`,
          }}
          animate={{
            x: ["-20%", "120%"],
            opacity: [0, streak.opacity, streak.opacity, 0],
          }}
          transition={{
            duration: streak.speed,
            repeat: Infinity,
            delay: streak.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// LIGHTNING BOLTS — Random dramatic flashes
// ============================================================================
function LightningBolts() {
  return (
    <>
      {/* Screen flash */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        animate={{
          opacity: [0, 0, 0, 0, 0.7, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Lightning bolt SVG */}
      <motion.svg
        className="absolute top-[10%] left-[30%] w-24 h-48"
        viewBox="0 0 100 200"
        animate={{
          opacity: [0, 0, 0, 0, 1, 0, 0.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M50 0 L35 70 L55 70 L25 200 L75 90 L50 90 L80 0 Z"
          fill="hsl(55 100% 85%)"
          filter="drop-shadow(0 0 10px hsl(55 100% 70%))"
        />
      </motion.svg>
    </>
  );
}

// ============================================================================
// GOD RAYS — Dramatic sunlight beams
// ============================================================================
function GodRays() {
  return (
    <div className="absolute top-0 right-[15%] w-[40%] h-full overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute origin-top"
          style={{
            top: 0,
            right: `${10 + i * 15}%`,
            width: "3px",
            height: "100%",
            background: `linear-gradient(to bottom, hsl(45 80% 70% / 0.3), transparent 70%)`,
            transform: `rotate(${-15 + i * 8}deg)`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// FALLING LEAVES — Autumn effect
// ============================================================================
function FallingLeaves({ count }: { count: number }) {
  const leaves = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 8 + Math.random() * 8,
      speed: 6 + Math.random() * 8,
      delay: Math.random() * 10,
      color: ["hsl(35 70% 45%)", "hsl(25 65% 40%)", "hsl(45 60% 50%)", "hsl(15 55% 35%)"][i % 4],
      rotation: Math.random() * 360,
    })), [count]
  );

  return (
    <div className="absolute inset-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            width: leaf.size,
            height: leaf.size * 0.7,
          }}
          animate={{
            y: ["-10%", "110%"],
            x: [0, 30, -20, 40, 0],
            rotate: [leaf.rotation, leaf.rotation + 720],
          }}
          transition={{
            y: { duration: leaf.speed, repeat: Infinity, delay: leaf.delay, ease: "linear" },
            x: { duration: leaf.speed * 0.6, repeat: Infinity, delay: leaf.delay, ease: "easeInOut" },
            rotate: { duration: leaf.speed * 0.8, repeat: Infinity, delay: leaf.delay, ease: "linear" },
          }}
        >
          <svg viewBox="0 0 20 14" width="100%" height="100%">
            <path
              d="M10 0 Q15 4 18 7 Q15 10 10 14 Q5 10 2 7 Q5 4 10 0"
              fill={leaf.color}
              opacity="0.8"
            />
            <line x1="10" y1="0" x2="10" y2="14" stroke="hsl(30 40% 30%)" strokeWidth="0.5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// GROUND MIST — Low-lying atmospheric effect
// ============================================================================
function GroundMist({ weather, timeOfDay }: { weather: WeatherType; timeOfDay: TimeOfDay }) {
  const showMist = ["foggy", "rainy", "dawn", "dusk"].some(
    (cond) => weather === cond || timeOfDay === cond
  ) || Math.random() > 0.6;
  
  if (!showMist) return null;

  const mistOpacity = weather === "foggy" ? 0.5 : timeOfDay === "dawn" ? 0.4 : 0.25;

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[20%] blur-md"
      style={{
        background: `linear-gradient(to top, 
          hsl(200 15% 92% / ${mistOpacity}), 
          hsl(200 10% 95% / ${mistOpacity * 0.5}),
          transparent
        )`,
      }}
      animate={{ opacity: [0.8, 1, 0.8], y: [0, -5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
