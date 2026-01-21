import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * UrbanChaosOverlay - Subtle visual hints of the city chaos beneath
 * As users scroll deeper, urban elements emerge from the pastoral calm
 */
export function UrbanChaosOverlay() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / docHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll - starts appearing after 20% scroll
  const getOpacity = (threshold: number, maxOpacity: number = 1) => {
    if (scrollProgress < threshold) return 0;
    const adjustedProgress = (scrollProgress - threshold) / (1 - threshold);
    return Math.min(adjustedProgress * maxOpacity, maxOpacity);
  };

  return (
    <>
      {/* Fixed overlay elements that appear with scroll */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Neon glow - bottom corners */}
        <div
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[100px] transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle, hsl(330 100% 71% / 0.4), transparent 70%)",
            opacity: getOpacity(0.3, 0.5),
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle, hsl(180 100% 50% / 0.3), transparent 70%)",
            opacity: getOpacity(0.4, 0.4),
          }}
        />

        {/* Metro orange pulse - top right */}
        <div
          className="absolute top-1/4 -right-10 w-40 h-40 rounded-full blur-[80px] animate-pulse transition-opacity duration-1000"
          style={{
            background: "radial-gradient(circle, hsl(20 100% 60% / 0.3), transparent 70%)",
            opacity: getOpacity(0.5, 0.35),
          }}
        />

        {/* Taxi yellow subtle line - appears late */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-1000"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(48 100% 50% / 0.4), transparent)",
            opacity: getOpacity(0.6, 0.6),
          }}
        />

        {/* Subtle vertical neon lines - like city buildings */}
        <div className="absolute bottom-0 left-[10%] w-px h-32 transition-all duration-1000"
          style={{
            background: "linear-gradient(to top, hsl(330 100% 71% / 0.5), transparent)",
            opacity: getOpacity(0.5, 0.4),
            transform: `scaleY(${getOpacity(0.5, 1)})`,
            transformOrigin: "bottom",
          }}
        />
        <div className="absolute bottom-0 left-[15%] w-px h-48 transition-all duration-1000"
          style={{
            background: "linear-gradient(to top, hsl(180 100% 50% / 0.4), transparent)",
            opacity: getOpacity(0.55, 0.35),
            transform: `scaleY(${getOpacity(0.55, 1)})`,
            transformOrigin: "bottom",
          }}
        />
        <div className="absolute bottom-0 right-[12%] w-px h-40 transition-all duration-1000"
          style={{
            background: "linear-gradient(to top, hsl(48 100% 50% / 0.5), transparent)",
            opacity: getOpacity(0.6, 0.4),
            transform: `scaleY(${getOpacity(0.6, 1)})`,
            transformOrigin: "bottom",
          }}
        />
        <div className="absolute bottom-0 right-[8%] w-px h-56 transition-all duration-1000"
          style={{
            background: "linear-gradient(to top, hsl(280 100% 65% / 0.4), transparent)",
            opacity: getOpacity(0.65, 0.35),
            transform: `scaleY(${getOpacity(0.65, 1)})`,
            transformOrigin: "bottom",
          }}
        />

        {/* Floating particles - like city lights */}
        <div
          className="absolute bottom-20 left-1/4 w-2 h-2 rounded-full animate-pulse transition-opacity duration-1000"
          style={{
            background: "hsl(330 100% 71%)",
            boxShadow: "0 0 10px hsl(330 100% 71% / 0.8)",
            opacity: getOpacity(0.5, 0.6),
          }}
        />
        <div
          className="absolute bottom-32 right-1/3 w-1.5 h-1.5 rounded-full animate-pulse transition-opacity duration-1000"
          style={{
            background: "hsl(180 100% 50%)",
            boxShadow: "0 0 8px hsl(180 100% 50% / 0.8)",
            opacity: getOpacity(0.55, 0.5),
            animationDelay: "0.5s",
          }}
        />
        <div
          className="absolute bottom-16 right-1/4 w-1 h-1 rounded-full animate-pulse transition-opacity duration-1000"
          style={{
            background: "hsl(48 100% 50%)",
            boxShadow: "0 0 6px hsl(48 100% 50% / 0.8)",
            opacity: getOpacity(0.6, 0.5),
            animationDelay: "1s",
          }}
        />

        {/* Very subtle grid pattern overlay - like city streets from above */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `
              linear-gradient(hsl(0 0% 50% / 0.02) 1px, transparent 1px),
              linear-gradient(90deg, hsl(0 0% 50% / 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: getOpacity(0.7, 0.5),
          }}
        />
      </div>

      {/* Scroll progress indicator - subtle neon bar */}
      <div className="fixed bottom-0 left-0 right-0 h-0.5 z-50 pointer-events-none">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${scrollProgress * 100}%`,
            background: scrollProgress > 0.5
              ? "linear-gradient(90deg, hsl(330 100% 71%), hsl(180 100% 50%), hsl(48 100% 50%))"
              : "linear-gradient(90deg, hsl(140 51% 55% / 0.5), hsl(214 41% 78% / 0.5))",
            opacity: scrollProgress > 0.05 ? 0.7 : 0,
          }}
        />
      </div>
    </>
  );
}
