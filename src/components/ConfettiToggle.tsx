import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, Sparkles } from "lucide-react";
import { ConfettiRain } from "./ConfettiRain";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bubbles-celebration-mode";

export const ConfettiToggle = () => {
  const [celebrationMode, setCelebrationMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, celebrationMode.toString());
  }, [celebrationMode]);

  return (
    <>
      <ConfettiRain enabled={celebrationMode} />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCelebrationMode(!celebrationMode)}
        className={cn(
          "relative transition-all duration-300",
          celebrationMode && "text-primary bg-primary/10 animate-pulse"
        )}
        title={celebrationMode ? "Disable celebration mode" : "Enable celebration mode"}
      >
        {celebrationMode ? (
          <Sparkles className="h-5 w-5 animate-scale-in" />
        ) : (
          <PartyPopper className="h-5 w-5" />
        )}
        {celebrationMode && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </Button>
    </>
  );
};
