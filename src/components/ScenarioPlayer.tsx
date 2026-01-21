import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Sparkles, Shuffle, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

// Mode configuration with HSL values for CSS animations
const MODE_CONFIG: Record<BubblesMode, {
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  glowIntensity: number;
  pulseSpeed: number;
  bgOpacity: number;
}> = {
  innocent: {
    label: "Innocent",
    hue: 45,
    saturation: 75,
    lightness: 65,
    glowIntensity: 0,
    pulseSpeed: 0,
    bgOpacity: 0.15,
  },
  concerned: {
    label: "Concerned",
    hue: 205,
    saturation: 45,
    lightness: 48,
    glowIntensity: 0.2,
    pulseSpeed: 4,
    bgOpacity: 0.2,
  },
  triggered: {
    label: "Triggered",
    hue: 25,
    saturation: 100,
    lightness: 55,
    glowIntensity: 0.4,
    pulseSpeed: 2,
    bgOpacity: 0.25,
  },
  savage: {
    label: "Savage",
    hue: 335,
    saturation: 100,
    lightness: 62,
    glowIntensity: 0.6,
    pulseSpeed: 1.5,
    bgOpacity: 0.3,
  },
  nuclear: {
    label: "Nuclear",
    hue: 50,
    saturation: 100,
    lightness: 50,
    glowIntensity: 1,
    pulseSpeed: 0.8,
    bgOpacity: 0.4,
  },
};

const MODE_ORDER: BubblesMode[] = ["innocent", "concerned", "triggered", "savage", "nuclear"];

export function ScenarioPlayer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch scenarios from database
  useEffect(() => {
    async function fetchScenarios() {
      const { data, error } = await supabase
        .from("bubbles_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const parsed = data.map((s) => ({
          ...s,
          beats: (Array.isArray(s.beats) ? s.beats : []) as unknown as Beat[],
        }));
        setScenarios(parsed);
        
        // Check for scenario ID in URL params
        const scenarioId = searchParams.get("scenario");
        const urlScenario = scenarioId ? parsed.find(s => s.id === scenarioId) : null;
        
        if (urlScenario) {
          setSelectedScenario(urlScenario);
          setIsPlaying(true); // Auto-play when loaded from URL
        } else if (parsed.length > 0) {
          setSelectedScenario(parsed[0]);
        }
      }
      setIsLoading(false);
    }
    fetchScenarios();
  }, [searchParams]);

  // Auto-play through beats
  useEffect(() => {
    if (!isPlaying || !selectedScenario) return;

    const timer = setTimeout(() => {
      if (currentBeatIndex < selectedScenario.beats.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentBeatIndex((prev) => prev + 1);
          setIsTransitioning(false);
        }, 300);
      } else {
        setIsPlaying(false);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentBeatIndex, selectedScenario]);

  const handleSelectScenario = (id: string) => {
    const scenario = scenarios.find((s) => s.id === id);
    if (scenario) {
      setSelectedScenario(scenario);
      setCurrentBeatIndex(0);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePrevBeat = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBeatIndex((prev) => Math.max(0, prev - 1));
      setIsTransitioning(false);
    }, 150);
    setIsPlaying(false);
  }, []);

  const handleNextBeat = useCallback(() => {
    if (selectedScenario) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBeatIndex((prev) =>
          Math.min(selectedScenario.beats.length - 1, prev + 1)
        );
        setIsTransitioning(false);
      }, 150);
      setIsPlaying(false);
    }
  }, [selectedScenario]);

  const handleReset = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBeatIndex(0);
      setIsTransitioning(false);
    }, 150);
    setIsPlaying(false);
  }, []);

  const handleShuffle = useCallback(() => {
    if (scenarios.length < 2) return;
    let randomIndex = Math.floor(Math.random() * scenarios.length);
    // Ensure we get a different scenario
    while (scenarios[randomIndex]?.id === selectedScenario?.id && scenarios.length > 1) {
      randomIndex = Math.floor(Math.random() * scenarios.length);
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedScenario(scenarios[randomIndex]);
      setCurrentBeatIndex(0);
      setIsTransitioning(false);
      setIsPlaying(true); // Auto-play the new scenario
    }, 200);
  }, [scenarios, selectedScenario]);

  const handleShare = useCallback(async () => {
    if (!selectedScenario) return;
    
    const shareUrl = `${window.location.origin}/scenarios?scenario=${selectedScenario.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!", {
        description: `Share "${selectedScenario.title}" with others`,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy link");
    }
  }, [selectedScenario]);

  const currentBeat = selectedScenario?.beats[currentBeatIndex];
  const currentMode = currentBeat?.mode || "innocent";
  const modeConfig = MODE_CONFIG[currentMode];
  const modeIndex = MODE_ORDER.indexOf(currentMode);
  const escalationProgress = (modeIndex / (MODE_ORDER.length - 1)) * 100;

  // Generate dynamic CSS custom properties for reactive styling
  const modeStyles = useMemo(() => ({
    "--mode-hue": modeConfig.hue,
    "--mode-saturation": `${modeConfig.saturation}%`,
    "--mode-lightness": `${modeConfig.lightness}%`,
    "--mode-glow": modeConfig.glowIntensity,
    "--mode-pulse-speed": `${modeConfig.pulseSpeed}s`,
    "--mode-bg-opacity": modeConfig.bgOpacity,
    "--escalation-progress": `${escalationProgress}%`,
  } as React.CSSProperties), [modeConfig, escalationProgress]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">
            Loading scenarios...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedScenario || scenarios.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No scenarios available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full max-w-2xl mx-auto overflow-hidden relative"
      style={modeStyles}
    >
      {/* Animated background glow */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-700 pointer-events-none",
          currentMode === "nuclear" && "animate-pulse"
        )}
        style={{
          background: `radial-gradient(ellipse at center, 
            hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / var(--mode-bg-opacity)) 0%, 
            transparent 70%)`,
          opacity: modeConfig.glowIntensity > 0 ? 1 : 0,
        }}
      />

      {/* Mode escalation indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
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

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-display">{selectedScenario.title}</CardTitle>
            <CardDescription className="mt-1">
              {selectedScenario.description}
            </CardDescription>
          </div>
          {selectedScenario.trigger_category && (
            <span 
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-500"
              style={{
                backgroundColor: `hsl(var(--mode-hue) var(--mode-saturation) var(--mode-lightness) / 0.15)`,
                color: `hsl(var(--mode-hue) var(--mode-saturation) calc(var(--mode-lightness) - 20%))`,
              }}
            >
              {selectedScenario.trigger_category}
            </span>
          )}
        </div>

        {/* Scenario Selector */}
        <Select
          value={selectedScenario.id}
          onValueChange={handleSelectScenario}
        >
          <SelectTrigger className="mt-3">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.title}</span>
                  {s.trigger_category && (
                    <span className="text-xs text-muted-foreground">
                      — {s.trigger_category}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Beat Progress Timeline */}
        <div className="relative">
          <div className="flex items-center gap-1.5">
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
                    "flex-1 h-3 rounded-full transition-all duration-500 cursor-pointer relative overflow-hidden",
                    isActive && "ring-2 ring-offset-2 ring-offset-background scale-110"
                  )}
                  style={{
                    backgroundColor: isActive || isPast 
                      ? `hsl(${beatConfig.hue}, ${beatConfig.saturation}%, ${beatConfig.lightness}%)`
                      : "hsl(var(--muted))",
                    opacity: isPast ? 0.6 : 1,
                    // @ts-expect-error CSS custom property for ring color
                    "--tw-ring-color": isActive 
                      ? `hsl(${beatConfig.hue}, ${beatConfig.saturation}%, ${beatConfig.lightness}%)`
                      : undefined,
                  }}
                  title={`${beatConfig.label}: ${beat.text.slice(0, 40)}...`}
                >
                  {isActive && isPlaying && (
                    <div 
                      className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                        animation: "shimmer 2s infinite",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Badge with Animation */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "px-5 py-2.5 rounded-full font-display font-semibold text-sm transition-all duration-500 flex items-center gap-2",
              currentMode === "nuclear" && "animate-pulse shadow-lg"
            )}
            style={{
              backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
              color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
              boxShadow: modeConfig.glowIntensity > 0 
                ? `0 0 ${20 * modeConfig.glowIntensity}px hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.5)`
                : undefined,
            }}
          >
            {currentMode === "nuclear" && <Sparkles className="w-4 h-4 animate-spin" />}
            {modeConfig.label} Mode
            {currentMode === "nuclear" && <Sparkles className="w-4 h-4 animate-spin" />}
          </div>
        </div>

        {/* Beat Content with Transition */}
        <div
          className={cn(
            "rounded-2xl p-6 border-2 transition-all duration-500 relative overflow-hidden",
            isTransitioning && "opacity-0 scale-95"
          )}
          style={{
            backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.1)`,
            borderColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.3)`,
          }}
        >
          {/* Background pattern for escalated modes */}
          {modeIndex >= 3 && (
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, 
                  hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%) 0%, 
                  transparent 50%),
                  radial-gradient(circle at 80% 20%, 
                  hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%) 0%, 
                  transparent 50%)`,
              }}
            />
          )}

          {/* Scene context (if available) */}
          {currentBeat?.action && (
            <div className="mb-4 relative z-10">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-display">
                Scene
              </p>
              <p className="text-sm text-foreground/80">{currentBeat.action}</p>
            </div>
          )}

          {/* Thought Bubble */}
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-display">
              Bubbles Thinks
            </p>
            <div
              className={cn(
                "relative p-5 rounded-2xl transition-all duration-500",
                currentMode === "nuclear" && "animate-pulse"
              )}
              style={{
                backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
                color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
                boxShadow: modeConfig.glowIntensity > 0.3
                  ? `0 4px ${30 * modeConfig.glowIntensity}px hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.4)`
                  : "0 4px 20px hsl(0 0% 0% / 0.1)",
              }}
            >
              <p className={cn(
                "text-lg font-medium italic font-display leading-relaxed",
                currentMode === "nuclear" && "text-xl"
              )}>
                "{currentBeat?.text}"
              </p>

              {/* Bubble tail */}
              <div
                className="absolute -bottom-3 left-8 w-6 h-6 rotate-45 transition-all duration-500"
                style={{
                  backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Share Button */}
          <Button
            variant="outline"
            onClick={handleShare}
            className={cn(
              "transition-all duration-300 gap-2 font-display hover:scale-105",
              isCopied && "border-primary text-primary"
            )}
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share"}</span>
          </Button>
          
          {/* Shuffle Button */}
          {scenarios.length > 1 && (
            <Button
              variant="outline"
              onClick={handleShuffle}
              className="transition-all duration-300 gap-2 font-display hover:scale-105"
            >
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Shuffle</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={currentBeatIndex === 0}
            className="transition-all duration-300"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevBeat}
            disabled={currentBeatIndex === 0}
            className="transition-all duration-300"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all duration-500",
              isPlaying && "scale-110"
            )}
            style={{
              backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
              color: modeConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
              boxShadow: isPlaying 
                ? `0 0 20px hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.5)`
                : undefined,
            }}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextBeat}
            disabled={currentBeatIndex === selectedScenario.beats.length - 1}
            className="transition-all duration-300"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Beat Counter */}
        <p className="text-center text-sm text-muted-foreground font-display">
          Beat {currentBeatIndex + 1} of {selectedScenario.beats.length}
        </p>
      </CardContent>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Card>
  );
}
