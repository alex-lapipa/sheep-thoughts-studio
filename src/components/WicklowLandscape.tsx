import { useEffect, useState } from "react";
import { useMood, useMoodColors } from "@/contexts/MoodContext";

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

  // Calculate urban overlay opacity based on mode
  const urbanOverlayOpacity = modeIntensity / 100;
  const isEscalated = modeIntensity > 25;
  const isIntense = modeIntensity > 50;
  const isChaotic = modeIntensity > 75;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient - transitions from pastoral to urban */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(to bottom, 
            ${colors.skyFrom}, 
            hsl(45 82% 53% / ${0.2 - urbanOverlayOpacity * 0.15}), 
            transparent
          )`,
        }}
      />

      {/* Urban sky overlay - appears with escalation */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(260 50% 15% / ${urbanOverlayOpacity * 0.4}),
            hsl(280 40% 20% / ${urbanOverlayOpacity * 0.3}),
            transparent
          )`,
          opacity: urbanOverlayOpacity,
        }}
      />

      {/* Distant misty mountains - color shifts with mood */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[60%] transition-all duration-1000"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.1}px)`,
          opacity: 0.2 + urbanOverlayOpacity * 0.3,
        }}
      >
        <defs>
          <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.mountainColor} />
            <stop offset="100%" stopColor="hsl(var(--wicklow-peat) / 0.3)" />
          </linearGradient>
        </defs>
        <path
          d="M0,400 L0,280 Q180,180 360,240 Q540,120 720,200 Q900,80 1080,180 Q1260,100 1440,220 L1440,400 Z"
          fill="url(#mountainGrad1)"
          className="transition-all duration-1000"
        />
      </svg>

      {/* Mid mountains - Sugarloaf silhouette with mood transition */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[50%] transition-all duration-1000"
        viewBox="0 0 1440 350"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.2}px)`,
          opacity: 0.3 + urbanOverlayOpacity * 0.2,
        }}
      >
        <defs>
          <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--wicklow-peat) / 0.3)" />
            <stop offset="50%" stopColor={isEscalated ? colors.mountainColor : "hsl(var(--wicklow-peat) / 0.4)"} />
            <stop offset="100%" stopColor="hsl(var(--wicklow-peat) / 0.3)" />
          </linearGradient>
        </defs>
        <path
          d="M0,350 L0,300 Q100,280 200,290 Q350,260 500,280 Q650,220 800,260 L900,180 L1000,260 Q1100,240 1200,270 Q1350,250 1440,280 L1440,350 Z"
          fill="url(#mountainGrad2)"
        />
      </svg>

      {/* Mist layer - changes color with mood */}
      <div
        className="absolute bottom-[20%] left-0 w-full h-32 blur-sm transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.15}px)`,
          background: `linear-gradient(to top, ${colors.mistColor}, transparent)`,
        }}
      />

      {/* Near hills with mood-reactive coloring */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[35%] transition-all duration-1000"
        viewBox="0 0 1440 250"
        preserveAspectRatio="xMidYMax slice"
        style={{ 
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 0.4 + urbanOverlayOpacity * 0.2,
        }}
      >
        <defs>
          <linearGradient id="heatherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              stopColor={isIntense ? colors.accentGlow : "hsl(var(--wicklow-heather))"}
              className="transition-all duration-1000" 
            />
            <stop offset="100%" stopColor="hsl(var(--wicklow-peat) / 0.5)" />
          </linearGradient>
        </defs>
        <path
          d="M0,250 L0,180 Q120,140 240,160 Q400,120 560,150 Q720,100 880,140 Q1040,90 1200,130 Q1320,110 1440,150 L1440,250 Z"
          fill="url(#heatherGradient)"
        />
      </svg>

      {/* Foreground meadow gradient - shifts to urban glow */}
      <div
        className="absolute bottom-0 left-0 w-full h-[15%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.5}px)`,
          background: isEscalated
            ? `linear-gradient(to top, ${colors.accentGlow}20, transparent)`
            : "linear-gradient(to top, hsl(var(--wicklow-meadow) / 0.2), transparent)",
        }}
      />

      {/* Gorse bushes - foreground left */}
      <div
        className="absolute bottom-[5%] left-[5%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.4}px)`,
          filter: isIntense ? `hue-rotate(${modeIntensity * 0.5}deg) saturate(${colors.saturationBoost})` : 'none',
        }}
      >
        <GorseBush size="lg" accentColor={isIntense ? colors.accentGlow : undefined} />
      </div>

      {/* Gorse bushes - foreground right */}
      <div
        className="absolute bottom-[8%] right-[10%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.35}px)`,
          filter: isIntense ? `hue-rotate(${modeIntensity * 0.3}deg) saturate(${colors.saturationBoost})` : 'none',
        }}
      >
        <GorseBush size="md" accentColor={isIntense ? colors.accentGlow : undefined} />
      </div>

      {/* Small gorse cluster */}
      <div
        className="absolute bottom-[3%] left-[25%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.45}px)`,
          filter: isChaotic ? `hue-rotate(${modeIntensity}deg)` : 'none',
        }}
      >
        <GorseBush size="sm" accentColor={isChaotic ? colors.accentGlow : undefined} />
      </div>

      {/* Heather tufts */}
      <div
        className="absolute bottom-[2%] right-[30%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.4}px)`,
          filter: isEscalated ? `saturate(${colors.saturationBoost})` : 'none',
        }}
      >
        <HeatherTuft accentColor={isEscalated ? colors.accentGlow : undefined} />
      </div>

      <div
        className="absolute bottom-[4%] left-[60%] transition-all duration-1000"
        style={{ 
          transform: `translateY(${scrollY * 0.38}px)`,
          filter: isIntense ? `saturate(${colors.saturationBoost * 1.2})` : 'none',
        }}
      >
        <HeatherTuft accentColor={isIntense ? colors.accentGlow : undefined} />
      </div>

      {/* Stone wall fragment */}
      <div
        className="absolute bottom-[1%] left-[40%]"
        style={{ transform: `translateY(${scrollY * 0.42}px)` }}
      >
        <StoneWall />
      </div>

      {/* Floating mist particles - become neon particles when chaotic */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-xl animate-float transition-all duration-1000"
            style={{
              width: `${60 + i * 20}px`,
              height: `${30 + i * 10}px`,
              left: `${10 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
              backgroundColor: isChaotic 
                ? `${colors.accentGlow}30`
                : "hsl(var(--wicklow-mist) / 0.2)",
              boxShadow: isChaotic 
                ? `0 0 30px ${colors.accentGlow}40`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Urban neon accents - only visible when escalated */}
      {isEscalated && (
        <>
          {/* Neon glow spots */}
          <div 
            className="absolute bottom-[10%] left-[20%] w-32 h-32 rounded-full blur-3xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, ${colors.accentGlow}40, transparent 70%)`,
              opacity: urbanOverlayOpacity * 0.6,
            }}
          />
          <div 
            className="absolute bottom-[15%] right-[15%] w-40 h-40 rounded-full blur-3xl transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, hsl(180 100% 50% / 0.3), transparent 70%)`,
              opacity: urbanOverlayOpacity * 0.4,
            }}
          />
        </>
      )}

      {/* Chaotic pulse overlay */}
      {isChaotic && (
        <div 
          className="absolute inset-0 animate-pulse transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center bottom, ${colors.accentGlow}15, transparent 60%)`,
            opacity: (modeIntensity - 75) / 25,
          }}
        />
      )}
    </div>
  );
}

function GorseBush({ size = "md", accentColor }: { size?: "sm" | "md" | "lg"; accentColor?: string }) {
  const dimensions = {
    sm: { width: 40, height: 30 },
    md: { width: 60, height: 45 },
    lg: { width: 80, height: 60 },
  };

  const { width, height } = dimensions[size];
  const flowerColor = accentColor || "hsl(var(--wicklow-butter))";

  return (
    <svg width={width} height={height} viewBox="0 0 80 60" className="transition-all duration-1000">
      {/* Bush base - peat earth */}
      <ellipse cx="40" cy="50" rx="35" ry="10" fill="hsl(var(--wicklow-peat) / 0.4)" />
      {/* Yellow gorse flowers - butter warmth or accent */}
      <circle cx="20" cy="30" r="12" fill={flowerColor} opacity="0.8" className="transition-all duration-1000" />
      <circle cx="40" cy="25" r="15" fill={flowerColor} opacity="0.9" className="transition-all duration-1000" />
      <circle cx="55" cy="32" r="11" fill={flowerColor} opacity="0.7" className="transition-all duration-1000" />
      <circle cx="30" cy="40" r="10" fill={flowerColor} opacity="0.6" className="transition-all duration-1000" />
      <circle cx="50" cy="42" r="9" fill={flowerColor} opacity="0.75" className="transition-all duration-1000" />
      {/* Dark spots for depth - peat shadows */}
      <circle cx="35" cy="35" r="6" fill="hsl(var(--wicklow-peat) / 0.3)" />
      <circle cx="48" cy="38" r="4" fill="hsl(var(--wicklow-peat) / 0.2)" />
      {/* Glow effect when accent */}
      {accentColor && (
        <ellipse cx="40" cy="35" rx="30" ry="20" fill={accentColor} opacity="0.2" className="animate-pulse" />
      )}
    </svg>
  );
}

function HeatherTuft({ accentColor }: { accentColor?: string }) {
  const flowerColor = accentColor || "hsl(var(--wicklow-heather))";
  
  return (
    <svg width="50" height="40" viewBox="0 0 50 40" className="transition-all duration-1000">
      {/* Heather stems and flowers */}
      {[...Array(7)].map((_, i) => (
        <g key={i}>
          <line
            x1={10 + i * 5}
            y1="40"
            x2={8 + i * 5 + (i % 2 ? 2 : -2)}
            y2={15 + (i % 3) * 5}
            stroke="hsl(var(--wicklow-peat) / 0.5)"
            strokeWidth="1"
          />
          <circle
            cx={8 + i * 5 + (i % 2 ? 2 : -2)}
            cy={12 + (i % 3) * 5}
            r={3 + (i % 2)}
            fill={flowerColor}
            opacity={0.6 + (i % 3) * 0.15}
            className="transition-all duration-1000"
          />
        </g>
      ))}
      {/* Glow effect */}
      {accentColor && (
        <ellipse cx="25" cy="20" rx="20" ry="15" fill={accentColor} opacity="0.15" className="animate-pulse" />
      )}
    </svg>
  );
}

function StoneWall() {
  return (
    <svg width="70" height="25" viewBox="0 0 70 25">
      {/* Ancient Wicklow stone wall fragment */}
      <rect x="0" y="10" width="18" height="14" rx="2" fill="hsl(var(--wicklow-stone))" opacity="0.7" />
      <rect x="15" y="8" width="22" height="16" rx="2" fill="hsl(var(--wicklow-stone))" opacity="0.8" />
      <rect x="34" y="12" width="16" height="12" rx="2" fill="hsl(var(--wicklow-stone))" opacity="0.6" />
      <rect x="47" y="9" width="20" height="15" rx="2" fill="hsl(var(--wicklow-stone))" opacity="0.75" />
      {/* Moss highlights */}
      <circle cx="25" cy="14" r="3" fill="hsl(var(--wicklow-meadow) / 0.4)" />
      <circle cx="55" cy="16" r="2" fill="hsl(var(--wicklow-meadow) / 0.3)" />
    </svg>
  );
}
