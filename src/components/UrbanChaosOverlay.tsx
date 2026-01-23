import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

// LA Underground Techno Studio - Immersive 3D Environment
export const UrbanStudioBackground = () => {
  const { offset: scrollY } = useParallax();
  
  return (
    <div className="absolute inset-0 overflow-hidden perspective-[1200px]">
      {/* Base layer - Deep matte black industrial wall */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_6%)] via-[hsl(240_8%_4%)] to-[hsl(0_0%_2%)]" />
      
      {/* 3D Floor perspective grid - techno aesthetic */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[60%] origin-bottom"
        style={{ transform: 'rotateX(60deg) translateZ(-50px)' }}
      >
        <svg className="w-full h-full opacity-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
            </linearGradient>
            <pattern id="technoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="transparent" />
              <line x1="0" y1="60" x2="60" y2="60" stroke="url(#gridFade)" strokeWidth="0.5" />
              <line x1="60" y1="0" x2="60" y2="60" stroke="url(#gridFade)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#technoGrid)" />
        </svg>
      </div>
      
      {/* Industrial ceiling beams with neon underlighting */}
      <div className="absolute top-0 left-0 right-0 h-12 flex justify-around items-end">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative">
            <div className="w-8 h-16 bg-[hsl(0_0%_8%)] rounded-b-sm shadow-lg" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-accent/30 blur-sm" />
          </div>
        ))}
      </div>
      
      {/* === LEFT SIDE: Modular Synth Rack === */}
      <motion.div 
        className="absolute top-16 left-2 sm:left-4 w-20 sm:w-28 origin-left"
        style={{ 
          y: scrollY * 0.08,
          transform: 'perspective(800px) rotateY(-8deg)',
        }}
      >
        {/* Eurorack case */}
        <div className="bg-[hsl(0_0%_5%)] rounded-lg border border-[hsl(0_0%_15%)] shadow-2xl p-1.5 space-y-1">
          {/* Module rows */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="flex gap-0.5 h-8 bg-[hsl(0_0%_8%)] rounded-sm p-0.5">
              {/* Individual modules with knobs */}
              {[...Array(3)].map((_, mod) => (
                <div key={mod} className="flex-1 bg-[hsl(240_5%_12%)] rounded-sm flex flex-col items-center justify-center gap-0.5 border border-[hsl(0_0%_20%)]">
                  {/* Knob */}
                  <motion.div 
                    className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[hsl(0_0%_35%)] to-[hsl(0_0%_15%)] shadow-inner"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8 + mod * 2, repeat: Infinity, ease: "linear" }}
                  />
                  {/* LED */}
                  <motion.div 
                    className={cn(
                      "w-1 h-1 rounded-full",
                      mod === 0 && "bg-destructive",
                      mod === 1 && "bg-accent",
                      mod === 2 && "bg-green-500"
                    )}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8 + mod * 0.3, repeat: Infinity }}
                  />
                </div>
              ))}
            </div>
          ))}
          
          {/* Patch cables - messy, organic */}
          <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
            <defs>
              <filter id="cableGlow">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Cable paths with neon colors */}
            <path d="M 10 15 Q 30 35 15 55" stroke="hsl(0 80% 50%)" strokeWidth="1.5" fill="none" filter="url(#cableGlow)" opacity="0.8" />
            <path d="M 25 25 Q 40 15 45 50" stroke="hsl(180 80% 50%)" strokeWidth="1.5" fill="none" filter="url(#cableGlow)" opacity="0.7" />
            <path d="M 50 20 Q 20 45 55 65" stroke="hsl(280 70% 60%)" strokeWidth="1.5" fill="none" filter="url(#cableGlow)" opacity="0.75" />
            <path d="M 35 40 Q 55 25 40 75" stroke="hsl(45 90% 50%)" strokeWidth="1.5" fill="none" filter="url(#cableGlow)" opacity="0.65" />
          </svg>
        </div>
        
        {/* Additional rack unit below */}
        <div className="mt-2 bg-[hsl(0_0%_6%)] rounded border border-[hsl(0_0%_12%)] p-1">
          <div className="flex items-center gap-1">
            {/* VU meters */}
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                className="flex-1 h-12 bg-[hsl(0_0%_4%)] rounded-sm overflow-hidden flex flex-col-reverse"
              >
                <motion.div 
                  className={cn(
                    "w-full",
                    i < 2 ? "bg-gradient-to-t from-green-500 via-accent to-destructive" : "bg-gradient-to-t from-green-600 via-green-400 to-accent"
                  )}
                  animate={{ 
                    height: [`${20 + i * 10}%`, `${60 + Math.random() * 30}%`, `${30 + i * 5}%`] 
                  }}
                  transition={{ duration: 0.3 + i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* === RIGHT SIDE: Studio Monitors & Outboard Gear === */}
      <motion.div 
        className="absolute top-12 right-2 sm:right-4 w-16 sm:w-24 origin-right"
        style={{ 
          y: scrollY * 0.12,
          transform: 'perspective(800px) rotateY(8deg)',
        }}
      >
        {/* Main studio monitor */}
        <div className="bg-[hsl(0_0%_6%)] rounded-lg p-2 shadow-2xl border border-[hsl(0_0%_12%)]">
          {/* Speaker cone */}
          <div className="relative w-full aspect-square rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center mb-1.5">
            <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-[hsl(0_0%_15%)] to-[hsl(0_0%_8%)] flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-[hsl(0_0%_20%)]">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(0_0%_25%)] to-[hsl(0_0%_12%)]" />
              </div>
            </div>
            {/* Pulsing bass ring */}
            <motion.div 
              className="absolute inset-2 rounded-full border border-accent/20"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>
          {/* Tweeter */}
          <div className="w-6 h-6 mx-auto rounded-full bg-gradient-to-br from-[hsl(0_0%_22%)] to-[hsl(0_0%_12%)] border border-[hsl(0_0%_18%)]" />
        </div>
        
        {/* Outboard gear rack */}
        <div className="mt-3 space-y-1">
          {/* Compressor unit */}
          <div className="h-6 bg-[hsl(220_15%_8%)] rounded border border-[hsl(0_0%_15%)] flex items-center px-1 gap-1">
            <div className="w-3 h-3 rounded-full bg-[hsl(0_0%_20%)]" />
            <div className="flex-1 h-2 bg-[hsl(0_0%_5%)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 via-accent to-destructive"
                animate={{ width: ["30%", "80%", "45%"] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          </div>
          
          {/* EQ unit */}
          <div className="h-8 bg-[hsl(200_10%_6%)] rounded border border-[hsl(0_0%_12%)] flex items-end justify-around px-1 pb-1">
            {[40, 60, 75, 55, 45, 65].map((h, i) => (
              <motion.div 
                key={i}
                className="w-1 bg-accent/60 rounded-t"
                animate={{ height: [`${h}%`, `${h + 20}%`, `${h}%`] }}
                transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* === BOTTOM: Mixing Console with 3D depth === */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24">
        {/* Console surface with perspective */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[hsl(0_0%_12%)] to-[hsl(0_0%_6%)]"
          style={{ 
            transform: 'perspective(500px) rotateX(25deg)',
            transformOrigin: 'bottom center'
          }}
        >
          {/* Channel strips */}
          <div className="absolute inset-x-4 top-2 bottom-4 flex justify-center gap-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 max-w-6 bg-[hsl(0_0%_8%)] rounded-sm flex flex-col items-center py-1 gap-1 border-x border-[hsl(0_0%_15%)]">
                {/* Fader */}
                <div className="w-1.5 flex-1 bg-[hsl(0_0%_5%)] rounded relative">
                  <motion.div 
                    className="absolute left-1/2 -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-[hsl(0_0%_50%)] to-[hsl(0_0%_30%)] rounded-sm shadow"
                    animate={{ top: [`${20 + i * 5}%`, `${40 + i * 3}%`, `${25 + i * 4}%`] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                  />
                </div>
                {/* Solo/Mute buttons */}
                <div className="flex gap-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-sm",
                    i % 3 === 0 ? "bg-accent/80" : "bg-[hsl(0_0%_20%)]"
                  )} />
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-sm",
                    i % 4 === 1 ? "bg-destructive/80" : "bg-[hsl(0_0%_20%)]"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Neon edge lighting on console */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-accent/60 to-transparent blur-sm" />
        <div className="absolute bottom-1 left-1/3 right-1/3 h-px bg-accent/40" />
      </div>
      
      {/* === AMBIENT LIGHTING: Neon accents === */}
      {/* Pink/magenta neon strip - left wall */}
      <div className="absolute top-1/4 left-0 w-1 h-1/2 bg-gradient-to-b from-transparent via-[hsl(320_80%_50%)] to-transparent opacity-40 blur-md" />
      <div className="absolute top-1/4 left-0 w-0.5 h-1/2 bg-gradient-to-b from-transparent via-[hsl(320_90%_60%)] to-transparent opacity-60" />
      
      {/* Cyan neon strip - right wall */}
      <div className="absolute top-1/3 right-0 w-1 h-1/3 bg-gradient-to-b from-transparent via-[hsl(180_80%_50%)] to-transparent opacity-40 blur-md" />
      <div className="absolute top-1/3 right-0 w-0.5 h-1/3 bg-gradient-to-b from-transparent via-[hsl(180_90%_55%)] to-transparent opacity-60" />
      
      {/* Accent light on ceiling */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-gradient-to-r from-transparent via-accent/30 to-transparent blur-lg" />
      
      {/* Vinyl records floating - parallax depth */}
      <motion.div 
        className="absolute bottom-28 left-8 w-12 h-12 opacity-15 hidden sm:block"
        style={{ y: scrollY * -0.1, rotate: scrollY * 0.05 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="hsl(0 0% 8%)" />
          <circle cx="50" cy="50" r="20" fill="hsl(280 60% 40%)" />
          <circle cx="50" cy="50" r="8" fill="hsl(0 0% 6%)" />
          {[25, 30, 35, 40, 45].map((r, i) => (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="hsl(0 0% 12%)" strokeWidth="0.5" />
          ))}
        </svg>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-36 right-6 w-10 h-10 opacity-10 hidden sm:block"
        style={{ y: scrollY * -0.15, rotate: scrollY * -0.08 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="hsl(0 0% 6%)" />
          <circle cx="50" cy="50" r="18" fill="hsl(180 70% 45%)" />
          <circle cx="50" cy="50" r="6" fill="hsl(0 0% 4%)" />
        </svg>
      </motion.div>
      
      {/* Subtle scanline overlay for CRT/retro feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />
      
      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(0_0%_0%/0.6)_100%)] pointer-events-none" />
      
      {/* Glassmorphism header */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[hsl(0_0%_10%/0.6)] backdrop-blur-xl rounded-full border border-[hsl(0_0%_20%/0.3)] px-4 sm:px-6 py-1.5 flex items-center gap-2 sm:gap-3 shadow-2xl">
          <motion.div 
            className="w-2 h-2 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.9, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-[9px] sm:text-[10px] text-muted-foreground/80 font-mono tracking-[0.2em] uppercase">
            LA Underground Studios
          </span>
          <motion.div 
            className="w-2 h-2 rounded-full bg-accent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

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
