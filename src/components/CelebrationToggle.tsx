import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, Sparkles, Snowflake } from "lucide-react";
import { ConfettiRain } from "./ConfettiRain";
import { SnowfallEffect } from "./SnowfallEffect";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CelebrationMode = "off" | "confetti" | "snow";

const STORAGE_KEY = "bubbles-celebration-mode-v2";

export const CelebrationToggle = () => {
  const [mode, setMode] = useState<CelebrationMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "confetti" || saved === "snow") return saved;
      // Migrate from old storage
      const oldSaved = localStorage.getItem("bubbles-celebration-mode");
      if (oldSaved === "true") return "confetti";
    }
    return "off";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const cycleMode = () => {
    setMode((current) => {
      if (current === "off") return "confetti";
      if (current === "confetti") return "snow";
      return "off";
    });
  };

  const getIcon = () => {
    switch (mode) {
      case "confetti":
        return <Sparkles className="h-5 w-5 animate-scale-in" />;
      case "snow":
        return <Snowflake className="h-5 w-5 animate-scale-in" />;
      default:
        return <PartyPopper className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "confetti":
        return "Confetti mode active (click for snow)";
      case "snow":
        return "Snow mode active (click to disable)";
      default:
        return "Enable celebration mode";
    }
  };

  return (
    <>
      <ConfettiRain enabled={mode === "confetti"} />
      <SnowfallEffect enabled={mode === "snow"} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative transition-all duration-300",
              mode === "confetti" && "text-primary bg-primary/10 animate-pulse",
              mode === "snow" && "text-sky-400 bg-sky-400/10"
            )}
            title={getTitle()}
          >
            {getIcon()}
            {mode !== "off" && (
              <span 
                className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping",
                  mode === "confetti" && "bg-primary",
                  mode === "snow" && "bg-sky-400"
                )} 
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => setMode("off")}
            className={cn(mode === "off" && "bg-muted")}
          >
            <PartyPopper className="h-4 w-4 mr-2" />
            Off
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setMode("confetti")}
            className={cn(mode === "confetti" && "bg-primary/10 text-primary")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Confetti Party 🎉
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setMode("snow")}
            className={cn(mode === "snow" && "bg-sky-400/10 text-sky-500")}
          >
            <Snowflake className="h-4 w-4 mr-2" />
            Winter Snow ❄️
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
