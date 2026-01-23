import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, X, Flag, RotateCcw, Copy, Check, 
  Code, Keyboard, ExternalLink, ChevronRight
} from "lucide-react";
import { useFeatureFlags, FeatureFlags, generatePreviewUrl } from "@/contexts/FeatureFlagsContext";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

const FLAG_LABELS: Record<keyof FeatureFlags, { label: string; description: string }> = {
  newNavigation: { 
    label: "New Navigation", 
    description: "Simplified nav with Chat, Live, Shop, FAQ" 
  },
  simplifiedHomepage: { 
    label: "Simplified Homepage", 
    description: "Remove static knowledge sections" 
  },
  enhancedShop: { 
    label: "Enhanced Shop", 
    description: "Shop hero with trust cues" 
  },
  faqSummary: { 
    label: "FAQ Summary", 
    description: "Lightweight FAQ page variant" 
  },
};

export const DevToolsPanel = () => {
  const { flags, setFlag, resetFlags, isUrlOverride } = useFeatureFlags();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd + Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Only show in development or with special query param
  const isDev = import.meta.env.DEV || 
    new URLSearchParams(window.location.search).has("devtools");

  if (!isDev) return null;

  const flagEntries = Object.entries(flags) as [keyof FeatureFlags, boolean][];
  const enabledCount = flagEntries.filter(([, v]) => v).length;

  const copyPreviewUrl = () => {
    const url = generatePreviewUrl(window.location.origin, flags);
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const openPreviewTab = () => {
    const url = generatePreviewUrl(window.location.href, flags);
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg transition-colors",
          "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
          "hover:from-violet-600 hover:to-purple-700",
          isOpen && "opacity-0 pointer-events-none"
        )}
        title="Developer Tools (Ctrl+Shift+D)"
      >
        <Code className="w-5 h-5" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[90vw]",
                "bg-background/95 backdrop-blur-xl border-r border-border shadow-2xl",
                "flex flex-col"
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                      <Settings className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold">Dev Tools</h2>
                      <p className="text-xs text-muted-foreground">
                        Feature flags & debugging
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Keyboard hint */}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                    Ctrl+Shift+D
                  </kbd>
                  <span>to toggle</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Feature Flags Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">Feature Flags</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {enabledCount}/{flagEntries.length} on
                    </Badge>
                  </div>

                  {isUrlOverride && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400">
                      🔒 URL override active — toggles disabled
                    </div>
                  )}

                  <div className="space-y-2">
                    {flagEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-xl border transition-colors",
                          value 
                            ? "bg-emerald-500/5 border-emerald-500/20" 
                            : "bg-muted/30 border-border"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {FLAG_LABELS[key].label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {FLAG_LABELS[key].description}
                            </p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => setFlag(key, checked)}
                            disabled={isUrlOverride}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reset button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFlags}
                    disabled={isUrlOverride}
                    className="w-full"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>

                <Separator />

                {/* URL Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Share Configuration</h3>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPreviewUrl}
                      className="w-full justify-start"
                    >
                      {copiedUrl ? (
                        <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-2" />
                      )}
                      Copy URL with Flags
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openPreviewTab}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Quick Links */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Quick Links</h3>
                  
                  <div className="space-y-1">
                    {[
                      { label: "Admin Dashboard", href: "/admin" },
                      { label: "Feature Flags Admin", href: "/admin/feature-flags" },
                      { label: "A/B Test Analytics", href: "/admin/ab-test" },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg text-sm",
                          "hover:bg-muted/50 transition-colors group"
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center">
                  Dev tools are only visible in development mode
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
