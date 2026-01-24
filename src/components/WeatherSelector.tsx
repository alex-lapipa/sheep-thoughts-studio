import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Zap,
  Snowflake, 
  CloudFog, 
  Wind,
  Sunrise,
  Moon,
  Sunset,
  Clock,
  Settings2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * WEATHER SELECTOR — Interactive weather and time control
 * 
 * Allows users to manually toggle between different weather conditions
 * and time of day settings on the Wicklow landscape.
 */

export type WeatherType = "sunny" | "cloudy" | "rainy" | "stormy" | "thunder" | "snowy" | "foggy" | "windy";
export type TimeOfDay = "dawn" | "midday" | "dusk" | "night";

interface WeatherSelectorProps {
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  onWeatherChange: (weather: WeatherType) => void;
  onTimeChange: (time: TimeOfDay) => void;
  className?: string;
}

const WEATHER_OPTIONS: { type: WeatherType; icon: React.ElementType; label: string; color: string }[] = [
  { type: "sunny", icon: Sun, label: "Sunny", color: "text-amber-400" },
  { type: "cloudy", icon: Cloud, label: "Cloudy", color: "text-slate-400" },
  { type: "rainy", icon: CloudRain, label: "Rainy", color: "text-blue-400" },
  { type: "stormy", icon: CloudLightning, label: "Stormy", color: "text-purple-400" },
  { type: "thunder", icon: Zap, label: "Thunder", color: "text-yellow-400" },
  { type: "snowy", icon: Snowflake, label: "Snowy", color: "text-cyan-300" },
  { type: "foggy", icon: CloudFog, label: "Foggy", color: "text-slate-300" },
  { type: "windy", icon: Wind, label: "Windy", color: "text-teal-400" },
];

const TIME_OPTIONS: { type: TimeOfDay; icon: React.ElementType; label: string; color: string }[] = [
  { type: "dawn", icon: Sunrise, label: "Dawn", color: "text-orange-400" },
  { type: "midday", icon: Sun, label: "Midday", color: "text-yellow-400" },
  { type: "dusk", icon: Sunset, label: "Dusk", color: "text-rose-400" },
  { type: "night", icon: Moon, label: "Night", color: "text-indigo-400" },
];

export function WeatherSelector({
  weather,
  timeOfDay,
  onWeatherChange,
  onTimeChange,
  className,
}: WeatherSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentWeather = WEATHER_OPTIONS.find(w => w.type === weather);
  const currentTime = TIME_OPTIONS.find(t => t.type === timeOfDay);

  return (
    <div className={cn("absolute z-30", className)}>
      {/* Toggle Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "gap-2 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg",
            "hover:bg-background/90 transition-all pointer-events-auto",
            isOpen && "ring-2 ring-primary/50"
          )}
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Settings2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Weather</span>
          {currentWeather && (
            <currentWeather.icon className={cn("w-4 h-4", currentWeather.color)} />
          )}
        </Button>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full mt-2 right-0 min-w-[280px]",
              "bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-xl",
              "p-4 pointer-events-auto"
            )}
          >
            {/* Weather Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Weather</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {WEATHER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = weather === option.type;
                  return (
                    <motion.button
                      key={option.type}
                      onClick={() => onWeatherChange(option.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                        "border border-transparent",
                        isActive 
                          ? "bg-primary/20 border-primary/40 shadow-md" 
                          : "bg-secondary/50 hover:bg-secondary/80"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-all",
                        isActive ? option.color : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Time Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time of Day</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TIME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = timeOfDay === option.type;
                  return (
                    <motion.button
                      key={option.type}
                      onClick={() => onTimeChange(option.type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                        "border border-transparent",
                        isActive 
                          ? "bg-primary/20 border-primary/40 shadow-md" 
                          : "bg-secondary/50 hover:bg-secondary/80"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-all",
                        isActive ? option.color : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-[10px] font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Current Conditions Label */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                {currentWeather && <currentWeather.icon className={cn("w-3 h-3", currentWeather.color)} />}
                <span>{currentWeather?.label}</span>
                <span className="text-border">•</span>
                {currentTime && <currentTime.icon className={cn("w-3 h-3", currentTime.color)} />}
                <span>{currentTime?.label}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
