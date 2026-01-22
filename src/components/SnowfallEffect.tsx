import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

interface SnowfallEffectProps {
  enabled: boolean;
}

export const SnowfallEffect = ({ enabled }: SnowfallEffectProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);

  const fireSnow = useCallback(() => {
    // Left side snowflakes
    confetti({
      particleCount: 2,
      angle: 80,
      spread: 30,
      origin: { x: 0.1, y: 0 },
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#dbeafe'],
      ticks: 400,
      gravity: 0.3,
      decay: 0.99,
      startVelocity: 8,
      shapes: ['circle'],
      scalar: 0.6,
      drift: 0.5,
    });

    // Center-left snowflakes
    confetti({
      particleCount: 2,
      angle: 85,
      spread: 25,
      origin: { x: 0.35, y: 0 },
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#f0f9ff'],
      ticks: 400,
      gravity: 0.25,
      decay: 0.99,
      startVelocity: 6,
      shapes: ['circle'],
      scalar: 0.5,
      drift: -0.3,
    });

    // Center snowflakes
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 40,
      origin: { x: 0.5, y: 0 },
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#dbeafe'],
      ticks: 400,
      gravity: 0.35,
      decay: 0.99,
      startVelocity: 7,
      shapes: ['circle'],
      scalar: 0.7,
      drift: 0.2,
    });

    // Center-right snowflakes
    confetti({
      particleCount: 2,
      angle: 95,
      spread: 25,
      origin: { x: 0.65, y: 0 },
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#f0f9ff'],
      ticks: 400,
      gravity: 0.28,
      decay: 0.99,
      startVelocity: 6,
      shapes: ['circle'],
      scalar: 0.55,
      drift: 0.4,
    });

    // Right side snowflakes
    confetti({
      particleCount: 2,
      angle: 100,
      spread: 30,
      origin: { x: 0.9, y: 0 },
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#dbeafe'],
      ticks: 400,
      gravity: 0.32,
      decay: 0.99,
      startVelocity: 8,
      shapes: ['circle'],
      scalar: 0.6,
      drift: -0.5,
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      // Fire immediately
      fireSnow();
      
      // Then fire every 200ms for gentle continuous snowfall
      intervalRef.current = setInterval(fireSnow, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, fireSnow]);

  return null; // This component doesn't render anything visible
};
