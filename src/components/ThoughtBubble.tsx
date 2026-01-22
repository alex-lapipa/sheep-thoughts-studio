import { cn } from "@/lib/utils";
import { BubbleMode } from "@/data/thoughtBubbles";
import { motion } from "framer-motion";

interface ThoughtBubbleProps {
  children: React.ReactNode;
  mode?: BubbleMode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  enableParallaxDrift?: boolean;
}

export function ThoughtBubble({ 
  children, 
  mode, 
  className, 
  size = 'md',
  enableParallaxDrift = true 
}: ThoughtBubbleProps) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  // Parallax drift animation - gentle upward float with slight horizontal sway
  const driftAnimation = enableParallaxDrift ? {
    y: [0, -8, -4, -12, -6, 0],
    x: [0, 2, -1, 3, -2, 0],
    rotate: [0, 0.5, -0.3, 0.4, -0.2, 0],
  } : {};

  const driftTransition = enableParallaxDrift ? {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
  } : undefined;

  return (
    <motion.div 
      className={cn(
        "thought-bubble animate-bubble-appear font-display",
        "border-border bg-bubble-bg text-foreground",
        sizeClasses[size],
        className
      )}
      animate={driftAnimation}
      transition={driftTransition}
    >
      {children}
    </motion.div>
  );
}
