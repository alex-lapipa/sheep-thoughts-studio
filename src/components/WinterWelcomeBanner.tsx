import { useState, useEffect } from "react";
import { X, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BANNER_DISMISS_KEY = "bubbles-winter-banner-2026";

// Check if current date is in winter season (December - February)
const isWinterSeason = (): boolean => {
  const month = new Date().getMonth();
  return month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
};

const winterMessages = [
  "The humans keep talking about 'seasonal depression' but I think they just haven't tried standing very still in a field. Works every time.",
  "I've been told the snow is frozen water. This is obviously wrong — water is wet and snow is fluffy. Completely different substances.",
  "Apparently humans celebrate something called 'hygge' in winter. From what I understand, it's just sitting inside wearing wool. I've been doing that my whole life.",
  "The farmer says it's 'cold enough to freeze brass monkeys.' I've never seen a brass monkey, but I hope they're warm wherever they are.",
  "Winter is when humans finally understand the value of a good coat. They've been copying us sheep for centuries.",
];

export const WinterWelcomeBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message] = useState(() => 
    winterMessages[Math.floor(Math.random() * winterMessages.length)]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const isDismissed = localStorage.getItem(BANNER_DISMISS_KEY);
    if (!isDismissed && isWinterSeason()) {
      // Small delay for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_DISMISS_KEY, "true");
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-sky-100/90 via-blue-50/90 to-sky-100/90",
        "dark:from-sky-950/90 dark:via-blue-900/90 dark:to-sky-950/90",
        "border-b border-sky-200 dark:border-sky-800",
        "animate-fade-in"
      )}
    >
      {/* Decorative snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Snowflake className="absolute top-1 left-[5%] h-4 w-4 text-sky-300/50 dark:text-sky-400/30 animate-pulse" />
        <Snowflake className="absolute top-2 left-[25%] h-3 w-3 text-sky-200/60 dark:text-sky-500/40 animate-pulse delay-100" />
        <Snowflake className="absolute bottom-1 left-[45%] h-5 w-5 text-sky-300/40 dark:text-sky-400/20 animate-pulse delay-200" />
        <Snowflake className="absolute top-1 right-[30%] h-4 w-4 text-sky-200/50 dark:text-sky-500/30 animate-pulse delay-300" />
        <Snowflake className="absolute bottom-2 right-[15%] h-3 w-3 text-sky-300/60 dark:text-sky-400/40 animate-pulse delay-150" />
      </div>

      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Sheep emoji/icon area */}
          <div className="flex-shrink-0 text-2xl sm:text-3xl" aria-hidden="true">
            🐑
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-sky-900 dark:text-sky-100 mb-0.5">
              A cozy winter thought from Bubbles:
            </p>
            <p className="text-sm sm:text-base text-sky-800 dark:text-sky-200 italic leading-relaxed">
              "{message}"
            </p>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 text-sky-600 hover:text-sky-800 hover:bg-sky-200/50 dark:text-sky-300 dark:hover:text-sky-100 dark:hover:bg-sky-800/50"
            aria-label="Dismiss winter message"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
