import { useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BubblesFloatingHead } from "./BubblesFloatingHead";

const BubblesVoiceAgent = lazy(() => import("./BubblesVoiceAgent"));

export function BubblesFloatingWidget() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  // Hide on /talk page to avoid duplication
  if (location.pathname === "/talk") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[min(400px,90vw)] h-[500px] rounded-2xl border border-accent/20 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close Bubbles"
            >
              <X className="w-4 h-4" />
            </button>

            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <BubblesVoiceAgent
                onConnectionChange={(connected) => setIsCallActive(connected)}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <BubblesFloatingHead
            isActive={isCallActive}
            onClick={() => setExpanded(true)}
          />
        </motion.div>
      )}
    </div>
  );
}
