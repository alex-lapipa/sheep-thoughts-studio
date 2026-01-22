import { useEffect, useState } from "react";
import { useMood, useMoodColors } from "@/contexts/MoodContext";

/**
 * WICKLOW LANDSCAPE — BOG-GROUNDED ENVIRONMENT
 * 
 * Authentic Wicklow bog on Sugarloaf slopes:
 * - Wet grass, peat bog textures
 * - Mud, mist, wind, rain, low clouds
 * - Muted greens, browns, greys, slate tones
 * - Always the true origin layer
 */

export function WicklowLandscape() {
  const [scrollY, setScrollY] = useState(0);
  const { currentMode, modeIntensity } = useMood();
  const colors = useMoodColors();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mode-based visual shifts
  const urbanOverlayOpacity = modeIntensity / 100;
  const isEscalated = modeIntensity > 25;
  const isIntense = modeIntensity > 50;
  const isChaotic = modeIntensity > 75;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SKY - Low Irish clouds, grey-blue muted */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(210 20% ${82 - urbanOverlayOpacity * 20}% / ${0.6 + urbanOverlayOpacity * 0.2}), 
            hsl(200 15% ${88 - urbanOverlayOpacity * 15}% / 0.5), 
            hsl(40 10% 92% / 0.3)
          )`,
        }}
      />

      {/* RAIN MIST - Constant light precipitation feel */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            hsl(200 15% 70% / 0.03) 1px,
            transparent 2px,
            transparent 8px
          )`,
          transform: `translateY(${(scrollY * 0.5) % 16}px)`,
        }}
      />

      {/* Urban overlay - neon pollution when escalated */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(280 50% 15% / ${urbanOverlayOpacity * 0.3}),
            hsl(300 40% 20% / ${urbanOverlayOpacity * 0.2}),
            transparent
          )`,
          opacity: urbanOverlayOpacity,
        }}
      />

      {/* DISTANT MOUNTAINS - Sugarloaf silhouette, slate grey */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[65%] transition-all duration-1000"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.08}px)`,
          opacity: 0.35 + urbanOverlayOpacity * 0.15,
        }}
      >
        <defs>
          <linearGradient id="slateMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isEscalated ? colors.mountainColor : "hsl(210 12% 45%)"} />
            <stop offset="100%" stopColor="hsl(200 10% 35% / 0.4)" />
          </linearGradient>
        </defs>
        {/* Sugarloaf-inspired peak */}
        <path
          d="M0,400 L0,320 Q200,280 400,300 Q550,200 700,260 L850,140 L950,220 Q1100,180 1250,240 Q1350,200 1440,260 L1440,400 Z"
          fill="url(#slateMountain)"
          className="transition-all duration-1000"
        />
      </svg>

      {/* MID-RANGE HILLS - Rolling bog terrain */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[50%] transition-all duration-1000"
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.15}px)`,
          opacity: 0.4 + urbanOverlayOpacity * 0.15,
        }}
      >
        <defs>
          <linearGradient id="bogHills" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(135 20% 35% / 0.5)" />
            <stop offset="50%" stopColor={isIntense ? colors.mountainColor : "hsl(140 18% 38% / 0.55)"} />
            <stop offset="100%" stopColor="hsl(130 22% 32% / 0.5)" />
          </linearGradient>
        </defs>
        <path
          d="M0,320 L0,260 Q150,220 300,240 Q500,180 700,220 Q900,160 1100,200 Q1280,170 1440,210 L1440,320 Z"
          fill="url(#bogHills)"
        />
      </svg>

      {/* BOG LAYER - Peat texture, dark wet earth */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[30%] transition-all duration-1000"
        style={{
          background: `linear-gradient(to top,
            hsl(28 35% 18% / 0.6),
            hsl(30 30% 25% / 0.4),
            transparent
          )`,
          transform: `translateY(${scrollY * 0.25}px)`,
        }}
      />

      {/* MIST BANK - Low valley fog */}
      <div
        className="absolute bottom-[15%] left-0 w-full h-40 blur-md transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.12}px)`,
          background: `linear-gradient(to top, 
            hsl(200 15% ${92 - urbanOverlayOpacity * 10}% / ${0.5 - urbanOverlayOpacity * 0.2}), 
            transparent
          )`,
        }}
      />

      {/* FOREGROUND BOG - Wet grass patches */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[25%] transition-all duration-1000"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <defs>
          <linearGradient id="wetGrass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isIntense ? colors.accentGlow + "40" : "hsl(135 25% 38% / 0.5)"} />
            <stop offset="100%" stopColor="hsl(28 35% 22% / 0.6)" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,140 Q200,120 400,135 Q600,100 800,125 Q1000,110 1200,130 Q1350,115 1440,140 L1440,200 Z"
          fill="url(#wetGrass)"
        />
      </svg>

      {/* PEAT POOLS - Dark water patches */}
      <svg
        className="absolute bottom-[5%] left-[10%] w-32 h-12 transition-all duration-1000"
        viewBox="0 0 100 40"
        style={{ 
          transform: `translateY(${scrollY * 0.35}px)`,
          opacity: 0.4,
        }}
      >
        <ellipse cx="50" cy="20" rx="45" ry="15" fill="hsl(28 40% 12% / 0.6)" />
        <ellipse cx="50" cy="18" rx="35" ry="10" fill="hsl(200 20% 25% / 0.3)" />
      </svg>

      <svg
        className="absolute bottom-[8%] right-[20%] w-24 h-10 transition-all duration-1000"
        viewBox="0 0 100 40"
        style={{ 
          transform: `translateY(${scrollY * 0.32}px)`,
          opacity: 0.35,
        }}
      >
        <ellipse cx="50" cy="20" rx="40" ry="12" fill="hsl(28 40% 12% / 0.5)" />
        <ellipse cx="50" cy="18" rx="30" ry="8" fill="hsl(200 20% 25% / 0.25)" />
      </svg>

      {/* HEATHER TUFTS - Purple bog flowers */}
      <div
        className="absolute bottom-[3%] left-[15%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.38}px)`,
          filter: isEscalated ? `saturate(${1 + urbanOverlayOpacity * 0.5})` : 'none',
        }}
      >
        <HeatherClump accentColor={isEscalated ? colors.accentGlow : undefined} />
      </div>

      <div
        className="absolute bottom-[5%] right-[25%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.4}px)`,
          filter: isIntense ? `saturate(${1 + urbanOverlayOpacity * 0.6})` : 'none',
        }}
      >
        <HeatherClump size="sm" accentColor={isIntense ? colors.accentGlow : undefined} />
      </div>

      {/* GORSE BUSH - Yellow flowers on green */}
      <div
        className="absolute bottom-[4%] left-[45%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.36}px)`,
          filter: isIntense ? `hue-rotate(${modeIntensity * 0.3}deg)` : 'none',
        }}
      >
        <GorsePatch accentColor={isIntense ? colors.accentGlow : undefined} />
      </div>

      <div
        className="absolute bottom-[2%] right-[8%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.42}px)`,
          filter: isChaotic ? `hue-rotate(${modeIntensity * 0.5}deg)` : 'none',
        }}
      >
        <GorsePatch size="lg" accentColor={isChaotic ? colors.accentGlow : undefined} />
      </div>

      {/* STONE WALL FRAGMENT - Ancient drystone */}
      <div
        className="absolute bottom-[1%] left-[65%]"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <DrystoneWall />
      </div>

      {/* BOG COTTON - White tufts */}
      <div
        className="absolute bottom-[6%] left-[30%]"
        style={{ transform: `translateY(${scrollY * 0.34}px)` }}
      >
        <BogCotton />
      </div>
      
      <div
        className="absolute bottom-[4%] right-[40%]"
        style={{ transform: `translateY(${scrollY * 0.37}px)` }}
      >
        <BogCotton />
      </div>

      {/* DRIFTING MIST WISPS */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-2xl animate-float transition-all duration-1000"
            style={{
              width: `${80 + i * 30}px`,
              height: `${25 + i * 8}px`,
              left: `${5 + i * 18}%`,
              top: `${40 + (i % 3) * 15}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${5 + i * 1.5}s`,
              backgroundColor: isChaotic 
                ? `${colors.accentGlow}20`
                : "hsl(200 12% 85% / 0.15)",
              boxShadow: isChaotic 
                ? `0 0 40px ${colors.accentGlow}30`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* URBAN NEON ACCENTS - Only when escalated */}
      {isEscalated && (
        <>
          <div 
            className="absolute bottom-[12%] left-[25%] w-40 h-40 rounded-full blur-3xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, ${colors.accentGlow}30, transparent 70%)`,
              opacity: urbanOverlayOpacity * 0.5,
            }}
          />
          <div 
            className="absolute bottom-[18%] right-[18%] w-48 h-48 rounded-full blur-3xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, hsl(185 100% 50% / 0.2), transparent 70%)`,
              opacity: urbanOverlayOpacity * 0.35,
            }}
          />
        </>
      )}

      {/* CHAOTIC PULSE - Nuclear mode */}
      {isChaotic && (
        <div 
          className="absolute inset-0 animate-pulse transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center bottom, ${colors.accentGlow}10, transparent 55%)`,
            opacity: (modeIntensity - 75) / 25,
          }}
        />
      )}
    </div>
  );
}

// Heather clump - purple bog flowers
function HeatherClump({ size = "md", accentColor }: { size?: "sm" | "md"; accentColor?: string }) {
  const scale = size === "sm" ? 0.7 : 1;
  const flowerColor = accentColor || "hsl(280 25% 50%)";
  
  return (
    <svg 
      width={60 * scale} 
      height={45 * scale} 
      viewBox="0 0 60 45" 
      className="transition-all duration-1000"
    >
      {/* Stems */}
      {[...Array(8)].map((_, i) => (
        <g key={i}>
          <line
            x1={8 + i * 6}
            y1="45"
            x2={6 + i * 6 + (i % 2 ? 2 : -2)}
            y2={15 + (i % 3) * 5}
            stroke="hsl(28 30% 35%)"
            strokeWidth="1"
          />
          <circle
            cx={6 + i * 6 + (i % 2 ? 2 : -2)}
            cy={12 + (i % 3) * 5}
            r={2.5 + (i % 2)}
            fill={flowerColor}
            opacity={0.5 + (i % 3) * 0.15}
            className="transition-all duration-1000"
          />
        </g>
      ))}
      {accentColor && (
        <ellipse cx="30" cy="25" rx="25" ry="15" fill={accentColor} opacity="0.1" className="animate-pulse" />
      )}
    </svg>
  );
}

// Gorse patch - yellow flowers on spiny green
function GorsePatch({ size = "md", accentColor }: { size?: "sm" | "md" | "lg"; accentColor?: string }) {
  const dimensions = {
    sm: { width: 45, height: 35 },
    md: { width: 65, height: 50 },
    lg: { width: 85, height: 65 },
  };
  const { width, height } = dimensions[size];
  const flowerColor = accentColor || "hsl(45 80% 55%)";

  return (
    <svg width={width} height={height} viewBox="0 0 80 60" className="transition-all duration-1000">
      {/* Dark green spiny base */}
      <ellipse cx="40" cy="52" rx="38" ry="10" fill="hsl(140 35% 22%)" />
      <ellipse cx="40" cy="40" rx="32" ry="18" fill="hsl(135 30% 28%)" />
      
      {/* Yellow gorse flowers */}
      <circle cx="22" cy="30" r="10" fill={flowerColor} opacity="0.85" className="transition-all duration-1000" />
      <circle cx="40" cy="24" r="13" fill={flowerColor} opacity="0.9" className="transition-all duration-1000" />
      <circle cx="55" cy="32" r="9" fill={flowerColor} opacity="0.8" className="transition-all duration-1000" />
      <circle cx="32" cy="42" r="8" fill={flowerColor} opacity="0.7" className="transition-all duration-1000" />
      <circle cx="52" cy="44" r="7" fill={flowerColor} opacity="0.75" className="transition-all duration-1000" />
      
      {/* Dark shadows for depth */}
      <circle cx="38" cy="38" r="5" fill="hsl(135 40% 18%)" opacity="0.4" />
      
      {accentColor && (
        <ellipse cx="40" cy="35" rx="35" ry="22" fill={accentColor} opacity="0.15" className="animate-pulse" />
      )}
    </svg>
  );
}

// Drystone wall fragment - ancient Wicklow stone
function DrystoneWall() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30">
      {/* Lichen-covered stones */}
      <rect x="0" y="12" width="20" height="16" rx="3" fill="hsl(200 8% 52%)" opacity="0.75" />
      <rect x="17" y="8" width="24" height="20" rx="3" fill="hsl(200 10% 48%)" opacity="0.8" />
      <rect x="38" y="14" width="18" height="14" rx="3" fill="hsl(200 6% 55%)" opacity="0.7" />
      <rect x="52" y="10" width="22" height="18" rx="3" fill="hsl(200 8% 50%)" opacity="0.78" />
      
      {/* Moss patches */}
      <circle cx="28" cy="16" r="4" fill="hsl(135 30% 40%)" opacity="0.4" />
      <circle cx="60" cy="18" r="3" fill="hsl(135 25% 45%)" opacity="0.35" />
      
      {/* Lichen spots */}
      <circle cx="10" cy="20" r="2" fill="hsl(55 30% 65%)" opacity="0.3" />
      <circle cx="45" cy="22" r="1.5" fill="hsl(55 25% 60%)" opacity="0.25" />
    </svg>
  );
}

// Bog cotton - white fluffy heads
function BogCotton() {
  return (
    <svg width="35" height="40" viewBox="0 0 35 40">
      {/* Thin stems */}
      <line x1="10" y1="40" x2="12" y2="15" stroke="hsl(135 25% 35%)" strokeWidth="1" />
      <line x1="18" y1="40" x2="17" y2="12" stroke="hsl(135 25% 35%)" strokeWidth="1" />
      <line x1="26" y1="40" x2="24" y2="18" stroke="hsl(135 25% 35%)" strokeWidth="1" />
      
      {/* White fluffy cotton heads */}
      <circle cx="12" cy="12" r="6" fill="hsl(45 20% 95%)" opacity="0.9" />
      <circle cx="17" cy="9" r="7" fill="hsl(45 15% 97%)" opacity="0.85" />
      <circle cx="24" cy="15" r="5" fill="hsl(45 20% 94%)" opacity="0.88" />
      
      {/* Subtle fluff detail */}
      <circle cx="14" cy="10" r="2" fill="white" opacity="0.7" />
      <circle cx="19" cy="7" r="2.5" fill="white" opacity="0.65" />
    </svg>
  );
}
