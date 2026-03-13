import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import bubblesStencil from "@/assets/bubbles-hero-stencil.png";

interface BubblesFloatingHeadProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

// Pulse rings use inline animate instead of variants for type safety

export function BubblesFloatingHead({ isActive = false, onClick, className }: BubblesFloatingHeadProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-16 h-16 rounded-full cursor-pointer group focus:outline-none",
        className
      )}
      aria-label="Talk to Bubbles"
    >
      {/* Pulse wave rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 2.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut" as const,
          }}
          className={cn(
            "absolute inset-0 rounded-full border-2",
            isActive
              ? "border-destructive/40"
              : "border-accent/40"
          )}
        />
      ))}

      {/* Glow shadow */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full",
          isActive
            ? "shadow-[0_0_20px_hsl(var(--destructive)/0.5)]"
            : "shadow-[0_0_20px_hsl(var(--accent)/0.4)]"
        )}
        animate={{
          boxShadow: isActive
            ? [
                "0 0 15px hsl(var(--destructive) / 0.3)",
                "0 0 25px hsl(var(--destructive) / 0.6)",
                "0 0 15px hsl(var(--destructive) / 0.3)",
              ]
            : [
                "0 0 12px hsl(var(--accent) / 0.25)",
                "0 0 22px hsl(var(--accent) / 0.5)",
                "0 0 12px hsl(var(--accent) / 0.25)",
              ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Heartbeat container with colorized Bubbles head */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden bg-background border-2 border-accent/60"
        animate={{
          scale: [1, 1.08, 1, 1.12, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src={bubblesStencil}
          alt="Bubbles"
          className="w-full h-[180%] object-cover object-top"
          style={{
            filter: "brightness(1.2) sepia(1) hue-rotate(120deg) saturate(2.5)",
          }}
          loading="eager"
        />
      </motion.div>
    </button>
  );
}
