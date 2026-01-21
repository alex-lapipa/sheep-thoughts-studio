import { createContext, useContext, useState, ReactNode } from "react";
import type { Database } from "@/integrations/supabase/types";

type BubblesMode = Database['public']['Enums']['bubbles_mode'];

interface MoodContextType {
  currentMode: BubblesMode;
  setCurrentMode: (mode: BubblesMode) => void;
  modeIntensity: number; // 0-100 for smooth transitions
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Mode intensity mapping (pastoral calm → urban chaos)
const MODE_INTENSITY: Record<BubblesMode, number> = {
  innocent: 0,
  concerned: 25,
  triggered: 50,
  savage: 75,
  nuclear: 100,
};

export function MoodProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<BubblesMode>("innocent");

  const modeIntensity = MODE_INTENSITY[currentMode];

  return (
    <MoodContext.Provider value={{ currentMode, setCurrentMode, modeIntensity }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
}

// Hook to get interpolated color values based on mood
export function useMoodColors() {
  const { modeIntensity } = useMood();
  
  // Interpolate between pastoral (0) and urban (100) colors
  const t = modeIntensity / 100;
  
  return {
    // Sky: mist → dark urban
    skyFrom: t < 0.5 
      ? `hsl(210 30% ${95 - t * 20}% / ${0.3 + t * 0.2})` 
      : `hsl(260 40% ${85 - t * 30}% / ${0.4 + t * 0.3})`,
    
    // Mountains: heather → metro/purple
    mountainColor: t < 0.5
      ? `hsl(300 ${15 + t * 30}% ${47 - t * 10}% / ${0.4 + t * 0.2})`
      : `hsl(280 ${40 + t * 20}% ${40 - t * 10}% / ${0.5 + t * 0.3})`,
    
    // Accent glow: butter → neon
    accentGlow: t < 0.3
      ? "hsl(45 82% 53%)" // butter
      : t < 0.6
      ? "hsl(20 100% 60%)" // metro orange
      : t < 0.8
      ? "hsl(330 100% 71%)" // soho pink
      : "hsl(68 100% 50%)", // nuclear yellow
    
    // Mist: white → colored haze
    mistColor: t < 0.5
      ? `hsl(210 30% 97% / ${0.4 - t * 0.2})`
      : `hsl(280 30% 70% / ${0.2 + t * 0.2})`,
    
    // Overall saturation boost for urban chaos
    saturationBoost: 1 + t * 0.5,
    
    // Intensity for effects
    intensity: t,
  };
}
