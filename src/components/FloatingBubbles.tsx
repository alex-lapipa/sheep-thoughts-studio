import { memo, useMemo } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

// Memoized to prevent unnecessary re-renders
export const FloatingBubbles = memo(function FloatingBubbles() {
  // Generate bubbles once with useMemo - reduced from 12 to 6
  const bubbles = useMemo<Bubble[]>(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 24 + Math.random() * 32,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 5,
      opacity: 0.08 + Math.random() * 0.1,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-accent/15 will-change-transform"
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            animation: `float-bubble ${bubble.duration}s ease-in-out infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
});
