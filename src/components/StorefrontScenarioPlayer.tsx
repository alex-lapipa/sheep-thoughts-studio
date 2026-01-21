import { useState, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, ChevronRight, ChevronLeft, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type BubblesMode = "innocent" | "concerned" | "triggered" | "savage" | "nuclear";

interface Beat {
  mode: BubblesMode;
  text: string;
  action?: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  trigger_category: string | null;
  beats: Beat[];
}

const MODE_CONFIG: Record<BubblesMode, {
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  intensity: number;
  emoji: string;
}> = {
  innocent: {
    label: "Innocent",
    hue: 45,
    saturation: 75,
    lightness: 65,
    intensity: 0,
    emoji: "🌿",
  },
  concerned: {
    label: "Concerned",
    hue: 205,
    saturation: 45,
    lightness: 48,
    intensity: 0.25,
    emoji: "🤔",
  },
  triggered: {
    label: "Triggered",
    hue: 25,
    saturation: 100,
    lightness: 55,
    intensity: 0.5,
    emoji: "😤",
  },
  savage: {
    label: "Savage",
    hue: 335,
    saturation: 100,
    lightness: 62,
    intensity: 0.75,
    emoji: "🔥",
  },
  nuclear: {
    label: "Nuclear",
    hue: 50,
    saturation: 100,
    lightness: 50,
    intensity: 1,
    emoji: "☢️",
  },
};

const MODE_ORDER: BubblesMode[] = ["innocent", "concerned", "triggered", "savage", "nuclear"];

interface StorefrontScenarioPlayerProps {
  autoPlay?: boolean;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

export function StorefrontScenarioPlayer({ 
  autoPlay = true, 
  showTitle = true,
  compact = false,
  className 
}: StorefrontScenarioPlayerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const selectedScenario = scenarios[currentScenarioIndex];
  const currentBeat = selectedScenario?.beats[currentBeatIndex];
  const currentMode = currentBeat?.mode || "innocent";
  const modeConfig = MODE_CONFIG[currentMode];
  const modeIndex = MODE_ORDER.indexOf(currentMode);
  const escalationProgress = (modeIndex / (MODE_ORDER.length - 1)) * 100;

  // Fetch scenarios
  useEffect(() => {
    async function fetchScenarios() {
      const { data, error } = await supabase
        .from("bubbles_scenarios")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        const parsed = data
          .map((s) => ({
            ...s,
            beats: (Array.isArray(s.beats) ? s.beats : []) as unknown as Beat[],
          }))
          .filter((s) => s.beats.length > 0);
        
        setScenarios(parsed);
      }
      setIsLoading(false);
    }
    fetchScenarios();
  }, []);

  // Auto-play through beats
  useEffect(() => {
    if (!isPlaying || !selectedScenario) return;

    const timer = setTimeout(() => {
      if (currentBeatIndex < selectedScenario.beats.length - 1) {
        // Next beat
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentBeatIndex((prev) => prev + 1);
          setIsTransitioning(false);
        }, 200);
      } else if (scenarios.length > 1) {
        // Move to next scenario
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
          setCurrentBeatIndex(0);
          setIsTransitioning(false);
        }, 400);
      } else {
        // Loop current scenario
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentBeatIndex(0);
          setIsTransitioning(false);
        }, 400);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentBeatIndex, selectedScenario, scenarios.length]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentBeatIndex > 0) {
        setCurrentBeatIndex((prev) => prev - 1);
      } else if (scenarios.length > 1) {
        const prevIndex = (currentScenarioIndex - 1 + scenarios.length) % scenarios.length;
        setCurrentScenarioIndex(prevIndex);
        setCurrentBeatIndex((scenarios[prevIndex]?.beats.length || 1) - 1);
      }
      setIsTransitioning(false);
    }, 150);
    setIsPlaying(false);
  }, [currentBeatIndex, currentScenarioIndex, scenarios]);

  const handleNext = useCallback(() => {
    if (!selectedScenario) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentBeatIndex < selectedScenario.beats.length - 1) {
        setCurrentBeatIndex((prev) => prev + 1);
      } else if (scenarios.length > 1) {
        setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
        setCurrentBeatIndex(0);
      } else {
        setCurrentBeatIndex(0);
      }
      setIsTransitioning(false);
    }, 150);
    setIsPlaying(false);
  }, [selectedScenario, currentBeatIndex, scenarios.length]);

  const handleShuffle = useCallback(() => {
    if (scenarios.length < 2) return;
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScenarioIndex(randomIndex);
      setCurrentBeatIndex(0);
      setIsTransitioning(false);
      setIsPlaying(true);
    }, 200);
  }, [scenarios.length]);

  // Dynamic styles
  const containerStyles = useMemo(() => ({
    "--mode-hue": modeConfig.hue,
    "--mode-saturation": `${modeConfig.saturation}%`,
    "--mode-lightness": `${modeConfig.lightness}%`,
    "--mode-intensity": modeConfig.intensity,
    "--escalation": `${escalationProgress}%`,
  } as React.CSSProperties), [modeConfig, escalationProgress]);

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl bg-card border p-8 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/3 mx-auto mb-4" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!selectedScenario || scenarios.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden transition-all duration-500",
        compact ? "p-4" : "p-6 md:p-8",
        className
      )}
      style={{
        ...containerStyles,
        background: `linear-gradient(135deg, 
          hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / 0.08) 0%,
          hsl(var(--card)) 50%,
          hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / 0.05) 100%)`,
        border: `1px solid hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / 0.2)`,
      }}
    >
      {/* Ambient glow */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-700",
          currentMode === "nuclear" && "animate-pulse"
        )}
        style={{
          background: `radial-gradient(ellipse at 50% 0%, 
            hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / ${0.1 + modeConfig.intensity * 0.15}) 0%, 
            transparent 60%)`,
        }}
      />

      {/* Escalation progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/50 overflow-hidden">
        <div 
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${escalationProgress}%`,
            background: `linear-gradient(90deg, 
              hsl(45, 75%, 65%) 0%, 
              hsl(205, 45%, 48%) 25%, 
              hsl(25, 100%, 55%) 50%, 
              hsl(335, 100%, 62%) 75%, 
              hsl(50, 100%, 50%) 100%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Header */}
        {showTitle && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-display font-bold truncate transition-all duration-300",
                compact ? "text-base" : "text-lg"
              )}>
                {selectedScenario.title}
              </h3>
              {selectedScenario.trigger_category && !compact && (
                <p className="text-xs text-muted-foreground">
                  {selectedScenario.trigger_category}
                </p>
              )}
            </div>
            
            {/* Mode badge */}
            <div
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full font-display font-semibold text-xs transition-all duration-500 flex items-center gap-1.5",
                currentMode === "nuclear" && "animate-pulse shadow-lg"
              )}
              style={{
                backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
                color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
                boxShadow: modeConfig.intensity > 0.5 
                  ? `0 0 ${12 * modeConfig.intensity}px hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.4)`
                  : undefined,
              }}
            >
              {currentMode === "nuclear" && <Sparkles className="w-3 h-3" />}
              {modeConfig.label}
            </div>
          </div>
        )}

        {/* Beat timeline */}
        <div className="flex items-center gap-1">
          {selectedScenario.beats.map((beat, index) => {
            const beatConfig = MODE_CONFIG[beat.mode];
            const isActive = index === currentBeatIndex;
            const isPast = index < currentBeatIndex;

            return (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentBeatIndex(index);
                    setIsTransitioning(false);
                  }, 150);
                  setIsPlaying(false);
                }}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer",
                  isActive && "ring-1 ring-offset-1 ring-offset-background scale-y-125"
                )}
                style={{
                  backgroundColor: isActive || isPast 
                    ? `hsl(${beatConfig.hue}, ${beatConfig.saturation}%, ${beatConfig.lightness}%)`
                    : "hsl(var(--muted))",
                  opacity: isPast ? 0.5 : 1,
                }}
              />
            );
          })}
        </div>

        {/* Thought bubble */}
        <div
          className={cn(
            "relative rounded-xl transition-all duration-500",
            compact ? "p-4" : "p-5",
            isTransitioning && "opacity-0 scale-95 translate-y-2"
          )}
          style={{
            backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
            color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
            boxShadow: modeConfig.intensity > 0.25
              ? `0 4px ${20 + 20 * modeConfig.intensity}px hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.3)`
              : "0 4px 20px hsl(0 0% 0% / 0.08)",
          }}
        >
          {/* Scene context */}
          {currentBeat?.action && !compact && (
            <p className="text-xs opacity-75 mb-2 font-medium uppercase tracking-wide">
              {currentBeat.action}
            </p>
          )}
          
          {/* Thought text */}
          <p className={cn(
            "font-display font-medium italic leading-relaxed",
            compact ? "text-sm" : "text-base md:text-lg",
            currentMode === "nuclear" && "font-bold"
          )}>
            "{currentBeat?.text}"
          </p>

          {/* Bubble tail */}
          <div
            className="absolute -bottom-2 left-6 w-4 h-4 rotate-45 transition-colors duration-500"
            style={{
              backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-all duration-300",
              isPlaying && "scale-105"
            )}
            style={{
              backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
              color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
            }}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {scenarios.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={handleShuffle}
              title="Random scenario"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Beat counter */}
        <p className="text-center text-xs text-muted-foreground">
          Beat {currentBeatIndex + 1}/{selectedScenario.beats.length}
          {scenarios.length > 1 && (
            <span className="mx-2">•</span>
          )}
          {scenarios.length > 1 && (
            <span>Scenario {currentScenarioIndex + 1}/{scenarios.length}</span>
          )}
        </p>
      </div>
    </div>
  );
}
