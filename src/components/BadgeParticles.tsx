import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface BadgeParticlesProps {
  isActive: boolean;
  color?: string;
  className?: string;
}

// Sparkle particles that float around unlocked badges
export const BadgeSparkles = ({ isActive, className }: { isActive: boolean; className?: string }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const createSparkle = () => ({
      id: Math.random(),
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${1.5 + Math.random()}s`,
      } as React.CSSProperties,
    });

    setSparkles([createSparkle(), createSparkle(), createSparkle()]);

    const interval = setInterval(() => {
      setSparkles(prev => [...prev.slice(-5), createSparkle()]);
    }, 800);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {sparkles.map(sparkle => (
        <span
          key={sparkle.id}
          className="absolute w-1 h-1 bg-primary rounded-full animate-sparkle"
          style={sparkle.style}
        />
      ))}
    </div>
  );
};

// Celebration burst effect when a badge is first viewed as unlocked
export const triggerBadgeCelebration = (element: HTMLElement, colors: string[] = ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"]) => {
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  // First burst
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x, y },
    colors,
    startVelocity: 20,
    gravity: 0.8,
    scalar: 0.8,
    ticks: 100,
  });

  // Secondary sparkle burst
  setTimeout(() => {
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x, y },
      colors,
      startVelocity: 15,
      gravity: 0.6,
      scalar: 0.6,
      shapes: ["circle"],
      ticks: 80,
    });
  }, 150);
};

// Floating particles background for the achievements page
export const FloatingParticles = ({ count = 20 }: { count?: number }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary animate-float-up"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: "-10px",
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Glow pulse effect for unlocked badges
export const GlowPulse = ({ color, isActive }: { color: string; isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div 
      className="absolute inset-0 rounded-xl opacity-50 animate-glow-pulse -z-10"
      style={{
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      }}
    />
  );
};

// Ring burst animation
export const RingBurst = ({ isActive, color }: { isActive: boolean; color: string }) => {
  const [rings, setRings] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) return;
    
    // Create initial rings
    setRings([Date.now()]);
    
    const interval = setInterval(() => {
      setRings(prev => [...prev.slice(-2), Date.now()]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {rings.map(id => (
        <div
          key={id}
          className="absolute w-full h-full rounded-xl animate-ring-burst"
          style={{
            border: `2px solid ${color}`,
          }}
        />
      ))}
    </div>
  );
};
