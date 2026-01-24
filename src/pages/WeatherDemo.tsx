import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { WicklowHeroLandscape, WeatherType, TimeOfDay } from "@/components/WicklowHeroLandscape";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Cloud, CloudRain, CloudLightning, Zap, Snowflake, CloudFog, Wind,
  Sunrise, Moon, Sunset, Clock, Grid3X3, Layers, Maximize2, X
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WEATHER DEMO PAGE
 * 
 * Showcases all weather and time-of-day combinations for the Wicklow landscape.
 * Useful for testing, development, and demonstrating the atmospheric engine.
 */

const WEATHER_TYPES: { type: WeatherType; icon: React.ElementType; label: string; description: string }[] = [
  { type: "sunny", icon: Sun, label: "Sunny", description: "Clear skies with bright sun rays" },
  { type: "cloudy", icon: Cloud, label: "Cloudy", description: "Overcast with drifting clouds" },
  { type: "rainy", icon: CloudRain, label: "Rainy", description: "Falling rain with puddles" },
  { type: "stormy", icon: CloudLightning, label: "Stormy", description: "Dark clouds and heavy atmosphere" },
  { type: "thunder", icon: Zap, label: "Thunder", description: "Lightning strikes and rumbles" },
  { type: "snowy", icon: Snowflake, label: "Snowy", description: "Falling snow with accumulation" },
  { type: "foggy", icon: CloudFog, label: "Foggy", description: "Thick mist over the bogs" },
  { type: "windy", icon: Wind, label: "Windy", description: "Strong gusts across the hills" },
];

const TIME_OPTIONS: { type: TimeOfDay; icon: React.ElementType; label: string; hours: string }[] = [
  { type: "dawn", icon: Sunrise, label: "Dawn", hours: "5am - 9am" },
  { type: "midday", icon: Sun, label: "Midday", hours: "9am - 5pm" },
  { type: "dusk", icon: Sunset, label: "Dusk", hours: "5pm - 9pm" },
  { type: "night", icon: Moon, label: "Night", hours: "9pm - 5am" },
];

interface LandscapePreviewProps {
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  isSelected?: boolean;
}

function LandscapePreview({ weather, timeOfDay, size = "md", onClick, isSelected }: LandscapePreviewProps) {
  const weatherInfo = WEATHER_TYPES.find(w => w.type === weather);
  const timeInfo = TIME_OPTIONS.find(t => t.type === timeOfDay);
  
  const sizeClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/50 hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className={cn("relative", sizeClasses[size])}>
        <WicklowHeroLandscape 
          weather={weather} 
          timeOfDay={timeOfDay} 
          showTrees 
          showWeatherControl={false}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {weatherInfo && <weatherInfo.icon className="w-4 h-4 text-primary" />}
            <span className="text-sm font-medium">{weatherInfo?.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {timeInfo && <timeInfo.icon className="w-3 h-3 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{timeInfo?.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WeatherDemo() {
  const [viewMode, setViewMode] = useState<"grid" | "focus">("grid");
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>("sunny");
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>("midday");
  const [fullscreenCombo, setFullscreenCombo] = useState<{ weather: WeatherType; time: TimeOfDay } | null>(null);

  return (
    <Layout>
      <Helmet>
        <title>Weather Demo | Wicklow Atmospheric Engine</title>
        <meta name="description" content="Explore all weather and time-of-day combinations for the Wicklow landscape engine. From sunny dawns to stormy nights." />
      </Helmet>

      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4">Development Demo</Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Wicklow Atmospheric Engine
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore all {WEATHER_TYPES.length} weather conditions across {TIME_OPTIONS.length} times of day. 
              That's {WEATHER_TYPES.length * TIME_OPTIONS.length} unique atmospheric combinations.
            </p>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-6 border-b border-border bg-secondary/20">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid View
              </Button>
              <Button
                variant={viewMode === "focus" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("focus")}
                className="gap-2"
              >
                <Layers className="w-4 h-4" />
                Focus View
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click any preview to view fullscreen
            </p>
          </div>
        </div>
      </section>

      {/* Grid View */}
      {viewMode === "grid" && (
        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="dawn" className="space-y-8">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
                {TIME_OPTIONS.map((time) => (
                  <TabsTrigger key={time.type} value={time.type} className="gap-2">
                    <time.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{time.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {TIME_OPTIONS.map((time) => (
                <TabsContent key={time.type} value={time.type}>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <time.icon className="w-5 h-5 text-primary" />
                      {time.label} ({time.hours})
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      All weather conditions at {time.label.toLowerCase()}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {WEATHER_TYPES.map((weather) => (
                      <LandscapePreview
                        key={`${weather.type}-${time.type}`}
                        weather={weather.type}
                        timeOfDay={time.type}
                        size="md"
                        onClick={() => setFullscreenCombo({ weather: weather.type, time: time.type })}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      )}

      {/* Focus View */}
      {viewMode === "focus" && (
        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-[300px,1fr] gap-8">
              {/* Controls */}
              <div className="space-y-6">
                {/* Weather Selection */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Weather
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {WEATHER_TYPES.map((weather) => {
                        const isActive = selectedWeather === weather.type;
                        return (
                          <Button
                            key={weather.type}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedWeather(weather.type)}
                            className="justify-start gap-2"
                          >
                            <weather.icon className="w-4 h-4" />
                            {weather.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Selection */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time of Day
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_OPTIONS.map((time) => {
                        const isActive = selectedTime === time.type;
                        return (
                          <Button
                            key={time.type}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time.type)}
                            className="justify-start gap-2"
                          >
                            <time.icon className="w-4 h-4" />
                            {time.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {(() => {
                        const weather = WEATHER_TYPES.find(w => w.type === selectedWeather);
                        return weather ? (
                          <>
                            <weather.icon className="w-8 h-8 text-primary mt-1" />
                            <div>
                              <h4 className="font-medium">{weather.label}</h4>
                              <p className="text-sm text-muted-foreground">{weather.description}</p>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <div 
                  className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border cursor-pointer"
                  onClick={() => setFullscreenCombo({ weather: selectedWeather, time: selectedTime })}
                >
                  <WicklowHeroLandscape 
                    weather={selectedWeather} 
                    timeOfDay={selectedTime} 
                    showTrees 
                    showWeatherControl={false}
                  />
                  <div className="absolute top-4 right-4">
                    <Button variant="secondary" size="sm" className="gap-2 pointer-events-none">
                      <Maximize2 className="w-4 h-4" />
                      Click to fullscreen
                    </Button>
                  </div>
                </div>

                {/* Quick comparison strip */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {TIME_OPTIONS.map((time) => (
                    <motion.div
                      key={time.type}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                        selectedTime === time.type ? "border-primary" : "border-border/50"
                      )}
                      onClick={() => setSelectedTime(time.type)}
                    >
                      <div className="relative w-full h-full">
                        <WicklowHeroLandscape 
                          weather={selectedWeather} 
                          timeOfDay={time.type} 
                          showTrees={false}
                          showWeatherControl={false}
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-1">
                          <span className="text-[10px] font-medium bg-background/80 px-2 py-0.5 rounded">
                            {time.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Combination Matrix */}
      <section className="py-12 bg-secondary/20 border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Complete Matrix</h2>
          <p className="text-muted-foreground mb-8">
            All {WEATHER_TYPES.length * TIME_OPTIONS.length} combinations at a glance
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-2 text-left"></th>
                  {TIME_OPTIONS.map((time) => (
                    <th key={time.type} className="p-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <time.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{time.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEATHER_TYPES.map((weather) => (
                  <tr key={weather.type}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <weather.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{weather.label}</span>
                      </div>
                    </td>
                    {TIME_OPTIONS.map((time) => (
                      <td key={`${weather.type}-${time.type}`} className="p-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative h-20 rounded-lg overflow-hidden cursor-pointer border border-border/50 hover:border-primary/50"
                          onClick={() => setFullscreenCombo({ weather: weather.type, time: time.type })}
                        >
                          <WicklowHeroLandscape 
                            weather={weather.type} 
                            timeOfDay={time.type} 
                            showTrees={false}
                            showWeatherControl={false}
                          />
                        </motion.div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenCombo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
            onClick={() => setFullscreenCombo(null)}
          >
            <WicklowHeroLandscape 
              weather={fullscreenCombo.weather} 
              timeOfDay={fullscreenCombo.time} 
              showTrees
              showWeatherControl
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setFullscreenCombo(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-3 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border border-border shadow-lg">
                {(() => {
                  const weather = WEATHER_TYPES.find(w => w.type === fullscreenCombo.weather);
                  const time = TIME_OPTIONS.find(t => t.type === fullscreenCombo.time);
                  return (
                    <>
                      {weather && <weather.icon className="w-5 h-5 text-primary" />}
                      <span className="font-medium">{weather?.label}</span>
                      <span className="text-muted-foreground">•</span>
                      {time && <time.icon className="w-5 h-5 text-primary" />}
                      <span className="font-medium">{time?.label}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
