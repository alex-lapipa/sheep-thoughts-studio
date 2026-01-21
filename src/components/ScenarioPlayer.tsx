import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type BubblesMode = "innocent" | "concerned" | "triggered" | "savage" | "nuclear";

interface Beat {
  mode: BubblesMode;
  action: string;
  thought: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  trigger_category: string;
  beats: Beat[];
}

// Mode color system: pastoral → urban transition
const MODE_STYLES: Record<BubblesMode, {
  bg: string;
  text: string;
  border: string;
  accent: string;
  label: string;
  icon: string;
}> = {
  innocent: {
    bg: "bg-wicklow-butter/20",
    text: "text-wicklow-peat",
    border: "border-wicklow-butter",
    accent: "bg-wicklow-butter",
    label: "Innocent",
    icon: "🌿",
  },
  concerned: {
    bg: "bg-wicklow-atlantic/20",
    text: "text-wicklow-peat",
    border: "border-wicklow-atlantic",
    accent: "bg-wicklow-atlantic",
    label: "Concerned",
    icon: "💭",
  },
  triggered: {
    bg: "bg-urban-metro/20",
    text: "text-foreground",
    border: "border-urban-metro",
    accent: "bg-urban-metro",
    label: "Triggered",
    icon: "⚡",
  },
  savage: {
    bg: "bg-urban-soho/20",
    text: "text-foreground",
    border: "border-urban-soho",
    accent: "bg-urban-soho",
    label: "Savage",
    icon: "🌃",
  },
  nuclear: {
    bg: "bg-urban-taxi/20",
    text: "text-foreground",
    border: "border-urban-taxi",
    accent: "bg-urban-taxi",
    label: "Nuclear",
    icon: "☢️",
  },
};

export function ScenarioPlayer() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        if (parsed.length > 0) {
          setSelectedScenario(parsed[0]);
        }
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
        setCurrentBeatIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 3000);

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
    setCurrentBeatIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  }, []);

  const handleNextBeat = useCallback(() => {
    if (selectedScenario) {
      setCurrentBeatIndex((prev) =>
        Math.min(selectedScenario.beats.length - 1, prev + 1)
      );
      setIsPlaying(false);
    }
  }, [selectedScenario]);

  const handleReset = useCallback(() => {
    setCurrentBeatIndex(0);
    setIsPlaying(false);
  }, []);

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

  const currentBeat = selectedScenario.beats[currentBeatIndex];
  const currentMode = currentBeat?.mode || "innocent";
  const modeStyle = MODE_STYLES[currentMode];

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{selectedScenario.title}</CardTitle>
            <CardDescription className="mt-1">
              {selectedScenario.description}
            </CardDescription>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            {selectedScenario.trigger_category}
          </span>
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
                  <span className="text-xs text-muted-foreground">
                    — {s.trigger_category}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {selectedScenario.beats.map((beat, index) => {
            const beatMode = beat.mode;
            const beatStyle = MODE_STYLES[beatMode];
            const isActive = index === currentBeatIndex;
            const isPast = index < currentBeatIndex;

            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentBeatIndex(index);
                  setIsPlaying(false);
                }}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-500 cursor-pointer",
                  isActive
                    ? beatStyle.accent
                    : isPast
                    ? `${beatStyle.accent} opacity-60`
                    : "bg-muted"
                )}
                title={`${beatStyle.label}: ${beat.thought.slice(0, 30)}...`}
              />
            );
          })}
        </div>

        {/* Mode Badge */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "px-4 py-2 rounded-full font-medium text-sm transition-all duration-500",
              modeStyle.accent,
              currentMode === "innocent" || currentMode === "concerned"
                ? "text-wicklow-peat"
                : "text-white"
            )}
          >
            {modeStyle.icon} {modeStyle.label} Mode
          </div>
        </div>

        {/* Beat Content */}
        <div
          className={cn(
            "rounded-xl p-6 border-2 transition-all duration-500",
            modeStyle.bg,
            modeStyle.border
          )}
        >
          {/* Action */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Scene
            </p>
            <p className={cn("text-sm", modeStyle.text)}>{currentBeat.action}</p>
          </div>

          {/* Thought Bubble */}
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Bubbles Thinks
            </p>
            <div
              className={cn(
                "relative p-4 rounded-2xl transition-all duration-500",
                modeStyle.accent,
                currentMode === "innocent" || currentMode === "concerned"
                  ? "text-wicklow-peat"
                  : "text-white"
              )}
            >
              <p className="text-lg font-medium italic">
                "{currentBeat.thought}"
              </p>

              {/* Bubble tail */}
              <div
                className={cn(
                  "absolute -bottom-2 left-6 w-4 h-4 rotate-45 transition-all duration-500",
                  modeStyle.accent
                )}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={currentBeatIndex === 0}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevBeat}
            disabled={currentBeatIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full transition-all duration-300",
              modeStyle.accent,
              currentMode === "innocent" || currentMode === "concerned"
                ? "text-wicklow-peat hover:opacity-90"
                : "text-white hover:opacity-90"
            )}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextBeat}
            disabled={currentBeatIndex === selectedScenario.beats.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Beat Counter */}
        <p className="text-center text-sm text-muted-foreground">
          Beat {currentBeatIndex + 1} of {selectedScenario.beats.length}
        </p>
      </CardContent>
    </Card>
  );
}
