import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type BubblesMode = "innocent" | "concerned" | "triggered" | "savage" | "nuclear";

interface Scenario {
  id: string;
  title: string;
  description: string;
  trigger_category: string | null;
  start_mode: BubblesMode;
  end_mode: BubblesMode;
}

const MODE_CONFIG: Record<BubblesMode, { label: string; hue: number; saturation: number; lightness: number }> = {
  innocent: { label: "Innocent", hue: 45, saturation: 75, lightness: 65 },
  concerned: { label: "Concerned", hue: 205, saturation: 45, lightness: 48 },
  triggered: { label: "Triggered", hue: 25, saturation: 100, lightness: 55 },
  savage: { label: "Savage", hue: 335, saturation: 100, lightness: 62 },
  nuclear: { label: "Nuclear", hue: 50, saturation: 100, lightness: 50 },
};

export function FeaturedScenarioCard() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedScenario() {
      const { data, error } = await supabase
        .from("bubbles_scenarios")
        .select("id, title, description, trigger_category, start_mode, end_mode")
        .limit(5);

      if (!error && data && data.length > 0) {
        // Pick a random scenario as "featured"
        const randomScenario = data[Math.floor(Math.random() * data.length)] as Scenario;
        setScenario(randomScenario);
      }
      setIsLoading(false);
    }
    fetchFeaturedScenario();
  }, []);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!scenario) return null;

  const startConfig = MODE_CONFIG[scenario.start_mode];
  const endConfig = MODE_CONFIG[scenario.end_mode];

  return (
    <Card 
      className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        borderColor: `hsl(${startConfig.hue}, ${startConfig.saturation}%, ${startConfig.lightness}% / 0.4)`,
      }}
    >
      {/* Mode gradient bar */}
      <div 
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, 
            hsl(${startConfig.hue}, ${startConfig.saturation}%, ${startConfig.lightness}%) 0%, 
            hsl(${endConfig.hue}, ${endConfig.saturation}%, ${endConfig.lightness}%) 100%)`
        }}
      />
      
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles 
              className="h-4 w-4 shrink-0" 
              style={{ color: `hsl(${startConfig.hue}, ${startConfig.saturation}%, ${startConfig.lightness}%)` }}
            />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Featured Escalation
            </span>
          </div>
          {scenario.trigger_category && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `hsl(${startConfig.hue}, ${startConfig.saturation}%, ${startConfig.lightness}% / 0.15)`,
                color: `hsl(${startConfig.hue}, ${startConfig.saturation}%, calc(${startConfig.lightness}% - 15%))`,
              }}
            >
              {scenario.trigger_category}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-display font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {scenario.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {scenario.description}
          </p>
        </div>

        {/* Mode Journey */}
        <div className="flex items-center gap-2 text-xs">
          <span 
            className="px-2 py-0.5 rounded font-medium"
            style={{
              backgroundColor: `hsl(${startConfig.hue}, ${startConfig.saturation}%, ${startConfig.lightness}%)`,
              color: startConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
            }}
          >
            {startConfig.label}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span 
            className={cn(
              "px-2 py-0.5 rounded font-medium",
              scenario.end_mode === "nuclear" && "animate-pulse"
            )}
            style={{
              backgroundColor: `hsl(${endConfig.hue}, ${endConfig.saturation}%, ${endConfig.lightness}%)`,
              color: endConfig.lightness > 60 ? "hsl(28, 45%, 16%)" : "white",
            }}
          >
            {endConfig.label}
          </span>
        </div>

        {/* CTA */}
        <Link to={`/scenarios?scenario=${scenario.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-1 text-xs font-display group-hover:bg-primary/10 transition-colors"
          >
            Watch Escalation
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
