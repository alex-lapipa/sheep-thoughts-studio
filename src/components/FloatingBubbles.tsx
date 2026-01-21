import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Create initial bubbles
    const initialBubbles: Bubble[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 40,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.15,
    }));
    setBubbles(initialBubbles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-accent/20 backdrop-blur-sm border border-accent/10"
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
}
