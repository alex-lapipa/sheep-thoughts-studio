import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, Sparkles, Snowflake, Heart, Star, CircleDot } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CelebrationMode = "off" | "confetti" | "snow" | "hearts" | "stars" | "sheep";

const STORAGE_KEY = "bubbles-celebration-mode-v3";
const SEASONAL_PROMPT_KEY = "bubbles-seasonal-prompt-2025";

// Check if current date is in winter season (December - February)
const isWinterSeason = (): boolean => {
  const month = new Date().getMonth(); // 0-indexed: 0 = January, 11 = December
  return month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
};

// Custom heart shape for canvas-confetti
const heartShape = confetti.shapeFromPath({
  path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  matrix: [0.05, 0, 0, 0.05, -0.6, -0.5],
});

// Star shape (using built-in + custom)
const starShape = confetti.shapeFromPath({
  path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  matrix: [0.05, 0, 0, 0.05, -0.6, -0.5],
});

// Sheep shape (simplified wool cloud shape)
const sheepShape = confetti.shapeFromPath({
  path: "M12 4C8 4 5 6.5 5 9.5c0 .5.1 1 .2 1.5C3.3 11.5 2 13 2 15c0 2.2 1.8 4 4 4h12c2.2 0 4-1.8 4-4 0-2-1.3-3.5-3.2-4-.1-.5-.2-1-.2-1.5C18.5 6.5 16 4 12 4z",
  matrix: [0.05, 0, 0, 0.05, -0.6, -0.5],
});

interface ThemeConfig {
  icon: React.ReactNode;
  label: string;
  emoji: string;
  colors: string[];
  shapes: confetti.Shape[];
  gravity: number;
  decay: number;
  startVelocity: number;
  ticks: number;
  scalar: number;
  drift?: number;
  interval: number;
  particleCount: number;
  className: string;
  activeClass: string;
}

const themes: Record<Exclude<CelebrationMode, "off">, ThemeConfig> = {
  confetti: {
    icon: <Sparkles className="h-4 w-4" />,
    label: "Confetti Party",
    emoji: "🎉",
    colors: ["#4ade80", "#60a5fa", "#f472b6", "#facc15", "#a78bfa"],
    shapes: ["circle", "square"],
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    ticks: 200,
    scalar: 0.8,
    interval: 150,
    particleCount: 3,
    className: "text-primary bg-primary/10",
    activeClass: "bg-primary",
  },
  snow: {
    icon: <Snowflake className="h-4 w-4" />,
    label: "Winter Snow",
    emoji: "❄️",
    colors: ["#ffffff", "#e0f2fe", "#bae6fd", "#dbeafe"],
    shapes: ["circle"],
    gravity: 0.3,
    decay: 0.99,
    startVelocity: 8,
    ticks: 400,
    scalar: 0.6,
    drift: 0.5,
    interval: 200,
    particleCount: 2,
    className: "text-sky-400 bg-sky-400/10",
    activeClass: "bg-sky-400",
  },
  hearts: {
    icon: <Heart className="h-4 w-4" />,
    label: "Love Hearts",
    emoji: "💕",
    colors: ["#f472b6", "#ec4899", "#db2777", "#be185d", "#fda4af"],
    shapes: [heartShape],
    gravity: 0.5,
    decay: 0.96,
    startVelocity: 20,
    ticks: 300,
    scalar: 1.2,
    interval: 180,
    particleCount: 2,
    className: "text-pink-400 bg-pink-400/10",
    activeClass: "bg-pink-400",
  },
  stars: {
    icon: <Star className="h-4 w-4" />,
    label: "Starry Night",
    emoji: "⭐",
    colors: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7", "#ffffff"],
    shapes: [starShape, "star"],
    gravity: 0.4,
    decay: 0.95,
    startVelocity: 25,
    ticks: 350,
    scalar: 1.0,
    interval: 160,
    particleCount: 2,
    className: "text-amber-400 bg-amber-400/10",
    activeClass: "bg-amber-400",
  },
  sheep: {
    icon: <CircleDot className="h-4 w-4" />,
    label: "Fluffy Sheep",
    emoji: "🐑",
    colors: ["#f5f5f4", "#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c"],
    shapes: [sheepShape, "circle"],
    gravity: 0.6,
    decay: 0.95,
    startVelocity: 22,
    ticks: 280,
    scalar: 1.4,
    interval: 200,
    particleCount: 2,
    className: "text-stone-400 bg-stone-400/10",
    activeClass: "bg-stone-400",
  },
};

export const CelebrationToggle = () => {
  const [mode, setMode] = useState<CelebrationMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as CelebrationMode;
      if (saved && (saved === "off" || themes[saved as keyof typeof themes])) {
        return saved;
      }
      // Migrate from old storage
      const oldSaved = localStorage.getItem("bubbles-celebration-mode-v2");
      if (oldSaved === "confetti" || oldSaved === "snow") return oldSaved;
      const legacySaved = localStorage.getItem("bubbles-celebration-mode");
      if (legacySaved === "true") return "confetti";
      
      // Auto-enable snow mode during winter season for new users
      if (isWinterSeason()) {
        const hasSeenSeasonalPrompt = localStorage.getItem(SEASONAL_PROMPT_KEY);
        if (!hasSeenSeasonalPrompt) {
          localStorage.setItem(SEASONAL_PROMPT_KEY, "true");
          // Show toast after a brief delay to ensure component is mounted
          setTimeout(() => {
            toast("❄️ Bubbles has detected winter and enabled snow mode!", {
              description: "You can change this in the celebration menu.",
              duration: 5000,
            });
          }, 1000);
          return "snow";
        }
      }
    }
    return "off";
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Dispatch custom event for WinterThemeContext
    window.dispatchEvent(new CustomEvent("celebration-mode-change"));
  }, [mode]);

  const fireEffect = useCallback((theme: ThemeConfig) => {
    const origins = [
      { x: 0.1, angle: 70 },
      { x: 0.3, angle: 80 },
      { x: 0.5, angle: 90 },
      { x: 0.7, angle: 100 },
      { x: 0.9, angle: 110 },
    ];

    origins.forEach((origin, i) => {
      confetti({
        particleCount: theme.particleCount,
        angle: origin.angle,
        spread: 35,
        origin: { x: origin.x, y: 0 },
        colors: theme.colors,
        shapes: theme.shapes,
        gravity: theme.gravity + (i % 2) * 0.05,
        decay: theme.decay,
        startVelocity: theme.startVelocity + (i % 3) * 2,
        ticks: theme.ticks,
        scalar: theme.scalar,
        drift: theme.drift ?? (i % 2 === 0 ? 0.3 : -0.3),
      });
    });
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mode !== "off") {
      const theme = themes[mode];
      fireEffect(theme);
      intervalRef.current = setInterval(() => fireEffect(theme), theme.interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, fireEffect]);

  const currentTheme = mode !== "off" ? themes[mode] : null;

  const getIcon = () => {
    if (mode === "off") return <PartyPopper className="h-5 w-5" />;
    return (
      <span className="h-5 w-5 flex items-center justify-center animate-scale-in">
        {themes[mode].icon}
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative transition-all duration-300",
            currentTheme?.className,
            mode !== "off" && "animate-pulse"
          )}
          title={mode === "off" ? "Enable celebration mode" : `${themes[mode].label} active`}
        >
          {getIcon()}
          {mode !== "off" && (
            <span 
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping",
                currentTheme?.activeClass
              )} 
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Celebration Effects
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setMode("off")}
          className={cn(mode === "off" && "bg-muted")}
        >
          <PartyPopper className="h-4 w-4 mr-2" />
          Off
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {(Object.entries(themes) as [Exclude<CelebrationMode, "off">, ThemeConfig][]).map(([key, theme]) => (
          <DropdownMenuItem 
            key={key}
            onClick={() => setMode(key)}
            className={cn(mode === key && theme.className)}
          >
            {theme.icon}
            <span className="ml-2">{theme.label}</span>
            <span className="ml-auto">{theme.emoji}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
