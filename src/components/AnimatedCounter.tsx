import { useState, useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  /** Target value to count up to */
  value: number;
  /** Duration of initial count-up animation in seconds */
  duration?: number;
  /** Format the number (e.g., add "K+", "%", etc.) */
  format?: (n: number) => string;
  /** Whether to increment randomly over time after initial animation */
  liveIncrement?: boolean;
  /** Interval for live increments in ms */
  incrementInterval?: number;
  /** Min increment per tick */
  incrementMin?: number;
  /** Max increment per tick */
  incrementMax?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  format = (n) => n.toLocaleString(),
  liveIncrement = false,
  incrementInterval = 3000,
  incrementMin = 1,
  incrementMax = 5,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentValue, setCurrentValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Spring animation for smooth counting
  const spring = useSpring(0, { 
    damping: 30, 
    stiffness: 100,
    duration: duration * 1000 
  });
  
  const displayValue = useTransform(spring, (latest) => format(Math.round(latest)));

  // Initial count-up animation
  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setCurrentValue(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  // Live increment effect
  useEffect(() => {
    if (!liveIncrement || !hasAnimated) return;

    const interval = setInterval(() => {
      const increment = Math.floor(
        Math.random() * (incrementMax - incrementMin + 1) + incrementMin
      );
      setCurrentValue((prev) => {
        const newValue = prev + increment;
        spring.set(newValue);
        return newValue;
      });
    }, incrementInterval);

    return () => clearInterval(interval);
  }, [liveIncrement, hasAnimated, incrementInterval, incrementMin, incrementMax, spring]);

  return (
    <motion.span
      ref={ref}
      className={className}
    >
      {displayValue}
    </motion.span>
  );
}

export default AnimatedCounter;
