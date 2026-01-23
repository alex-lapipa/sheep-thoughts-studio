import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, ChevronDown, ChevronUp, Check, XCircle } from "lucide-react";
import { useFeatureFlags, FeatureFlags } from "@/contexts/FeatureFlagsContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  newNavigation: "New Navigation",
  simplifiedHomepage: "Simplified Homepage",
  enhancedShop: "Enhanced Shop",
  faqSummary: "FAQ Summary",
};

export const FeatureFlagBadge = () => {
  const { flags, isUrlOverride } = useFeatureFlags();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show when URL overrides are active
  if (!isUrlOverride || isDismissed) return null;

  const flagEntries = Object.entries(flags) as [keyof FeatureFlags, boolean][];
  const enabledCount = flagEntries.filter(([, v]) => v).length;
  const disabledCount = flagEntries.filter(([, v]) => !v).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className={cn(
        "backdrop-blur-xl border shadow-lg transition-all duration-300",
        "bg-amber-500/10 border-amber-500/30 rounded-2xl",
        isExpanded ? "w-64" : "w-auto"
      )}>
        {/* Header */}
        <div 
          className="flex items-center gap-2 p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Flag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              URL Override Active
            </p>
            {!isExpanded && (
              <p className="text-[10px] text-muted-foreground truncate">
                {enabledCount} on, {disabledCount} off
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-amber-500/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                <div className="h-px bg-amber-500/20" />
                
                {flagEntries.map(([key, value]) => (
                  <div 
                    key={key}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg text-xs transition-colors",
                      value ? "bg-emerald-500/10" : "bg-rose-500/10"
                    )}
                  >
                    <span className="text-foreground/80">
                      {FLAG_LABELS[key]}
                    </span>
                    {value ? (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <Check className="w-3 h-3" />
                        <span className="font-medium">ON</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-rose-500">
                        <XCircle className="w-3 h-3" />
                        <span className="font-medium">OFF</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* URL params hint */}
                <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
                  Changes are locked while using URL params
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
