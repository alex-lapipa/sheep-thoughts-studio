import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiRainProps {
  enabled: boolean;
}

export const ConfettiRain = ({ enabled }: ConfettiRainProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);

  const fireConfetti = useCallback(() => {
    // Left side
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0 },
      colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'],
      ticks: 200,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle', 'square'],
      scalar: 0.8,
    });

    // Right side
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0 },
      colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'],
      ticks: 200,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle', 'square'],
      scalar: 0.8,
    });

    // Center top
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0 },
      colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'],
      ticks: 200,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 25,
      shapes: ['circle', 'square'],
      scalar: 0.8,
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      // Fire immediately
      fireConfetti();
      
      // Then fire every 150ms for continuous rain
      intervalRef.current = setInterval(fireConfetti, 150);
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
  }, [enabled, fireConfetti]);

  return null; // This component doesn't render anything visible
};
