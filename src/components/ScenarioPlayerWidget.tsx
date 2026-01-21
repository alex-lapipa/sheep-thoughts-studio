import { useState, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface ScenarioBeat {
  mode: BubblesMode;
  thought: string;
  action?: string;
}

interface Scenario {
  id: string;
  title: string;
  beats: ScenarioBeat[];
}

const MODE_CONFIG: Record<BubblesMode, { 
  hue: number; 
  saturation: number; 
  lightness: number;
  emoji: string;
}> = {
  innocent: { hue: 45, saturation: 75, lightness: 65, emoji: "🌸" },
  concerned: { hue: 35, saturation: 65, lightness: 55, emoji: "😟" },
  triggered: { hue: 25, saturation: 80, lightness: 50, emoji: "😤" },
  savage: { hue: 15, saturation: 85, lightness: 45, emoji: "🔥" },
  nuclear: { hue: 50, saturation: 100, lightness: 50, emoji: "☢️" },
};

const BEAT_DURATION = 3500;

export function ScenarioPlayerWidget() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch scenarios
  useEffect(() => {
    async function fetchScenarios() {
      const { data, error } = await supabase
        .from('bubbles_scenarios')
        .select('id, title, beats')
        .limit(20);

      if (error) {
        console.error('Error fetching scenarios:', error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const parsed = data
          .filter(s => s.beats && Array.isArray(s.beats) && s.beats.length > 0)
          .map(s => ({
            id: s.id,
            title: s.title,
            beats: s.beats as unknown as ScenarioBeat[],
          }));
        setScenarios(parsed);
        if (parsed.length > 0) {
          const random = parsed[Math.floor(Math.random() * parsed.length)];
          setSelectedScenario(random);
          setIsPlaying(true);
        }
      }
      setIsLoading(false);
    }
    fetchScenarios();
  }, []);

  // Auto-advance beats
  useEffect(() => {
    if (!isPlaying || !selectedScenario) return;
    
    const timer = setInterval(() => {
      setCurrentBeatIndex(prev => {
        if (prev >= selectedScenario.beats.length - 1) {
          // Auto-shuffle to next scenario
          handleShuffle();
          return 0;
        }
        return prev + 1;
      });
    }, BEAT_DURATION);

    return () => clearInterval(timer);
  }, [isPlaying, selectedScenario]);

  const handleShuffle = useCallback(() => {
    if (scenarios.length < 1) return;
    let randomIndex = Math.floor(Math.random() * scenarios.length);
    while (scenarios[randomIndex]?.id === selectedScenario?.id && scenarios.length > 1) {
      randomIndex = Math.floor(Math.random() * scenarios.length);
    }
    setSelectedScenario(scenarios[randomIndex]);
    setCurrentBeatIndex(0);
    setIsPlaying(true);
  }, [scenarios, selectedScenario]);

  const currentBeat = selectedScenario?.beats[currentBeatIndex];
  const currentMode = currentBeat?.mode || "innocent";
  const modeConfig = MODE_CONFIG[currentMode];

  const progress = selectedScenario 
    ? ((currentBeatIndex + 1) / selectedScenario.beats.length) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="h-24 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedScenario || !currentBeat) {
    return null;
  }

  return (
    <div 
      className="relative rounded-xl p-4 transition-all duration-500 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.15), 
          hsl(${modeConfig.hue}, ${modeConfig.saturation - 20}%, ${modeConfig.lightness + 10}% / 0.08))`,
        borderColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.3)`,
        borderWidth: '1px',
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20">
        <div 
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        {/* Mode indicator */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300"
          style={{
            backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}% / 0.25)`,
          }}
        >
          {modeConfig.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p 
            className="text-sm font-medium italic leading-snug transition-opacity duration-300"
            style={{
              color: `hsl(${modeConfig.hue}, ${Math.min(modeConfig.saturation, 40)}%, ${Math.max(modeConfig.lightness - 30, 20)}%)`,
            }}
          >
            "{currentBeat.thought}"
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {selectedScenario.title}
          </p>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100"
            onClick={handleShuffle}
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Beat dots */}
      <div className="flex items-center justify-center gap-1 mt-3">
        {selectedScenario.beats.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              idx === currentBeatIndex ? "scale-125" : "opacity-40"
            )}
            style={{
              backgroundColor: `hsl(${modeConfig.hue}, ${modeConfig.saturation}%, ${modeConfig.lightness}%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
