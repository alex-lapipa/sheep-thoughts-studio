import { useEffect, useState } from "react";

export function WicklowLandscape() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bubbles-mist/30 via-bubbles-cream/20 to-transparent" />

      {/* Distant misty mountains - slowest parallax */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[60%] opacity-20"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <path
          d="M0,400 L0,280 Q180,180 360,240 Q540,120 720,200 Q900,80 1080,180 Q1260,100 1440,220 L1440,400 Z"
          fill="hsl(var(--bubbles-heather) / 0.4)"
        />
      </svg>

      {/* Mid mountains - Sugarloaf silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[50%] opacity-30"
        viewBox="0 0 1440 350"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      >
        {/* Sugarloaf-like peak on the right */}
        <path
          d="M0,350 L0,300 Q100,280 200,290 Q350,260 500,280 Q650,220 800,260 L900,180 L1000,260 Q1100,240 1200,270 Q1350,250 1440,280 L1440,350 Z"
          fill="hsl(var(--bubbles-peat) / 0.3)"
        />
      </svg>

      {/* Mist layer */}
      <div
        className="absolute bottom-[20%] left-0 w-full h-32 bg-gradient-to-t from-bubbles-mist/40 via-bubbles-mist/20 to-transparent blur-sm"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />

      {/* Near hills with heather */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[35%] opacity-40"
        viewBox="0 0 1440 250"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <defs>
          <linearGradient id="heatherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--bubbles-heather))" />
            <stop offset="100%" stopColor="hsl(var(--bubbles-peat) / 0.5)" />
          </linearGradient>
        </defs>
        <path
          d="M0,250 L0,180 Q120,140 240,160 Q400,120 560,150 Q720,100 880,140 Q1040,90 1200,130 Q1320,110 1440,150 L1440,250 Z"
          fill="url(#heatherGradient)"
        />
      </svg>

      {/* Gorse bushes - foreground left */}
      <div
        className="absolute bottom-[5%] left-[5%]"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <GorseBush size="lg" />
      </div>

      {/* Gorse bushes - foreground right */}
      <div
        className="absolute bottom-[8%] right-[10%]"
        style={{ transform: `translateY(${scrollY * 0.35}px)` }}
      >
        <GorseBush size="md" />
      </div>

      {/* Small gorse cluster */}
      <div
        className="absolute bottom-[3%] left-[25%]"
        style={{ transform: `translateY(${scrollY * 0.45}px)` }}
      >
        <GorseBush size="sm" />
      </div>

      {/* Heather tufts */}
      <div
        className="absolute bottom-[2%] right-[30%]"
        style={{ transform: `translateY(${scrollY * 0.4}px)` }}
      >
        <HeatherTuft />
      </div>

      <div
        className="absolute bottom-[4%] left-[60%]"
        style={{ transform: `translateY(${scrollY * 0.38}px)` }}
      >
        <HeatherTuft />
      </div>

      {/* Floating mist particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-bubbles-mist/20 blur-xl animate-float"
            style={{
              width: `${60 + i * 20}px`,
              height: `${30 + i * 10}px`,
              left: `${10 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GorseBush({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { width: 40, height: 30 },
    md: { width: 60, height: 45 },
    lg: { width: 80, height: 60 },
  };

  const { width, height } = dimensions[size];

  return (
    <svg width={width} height={height} viewBox="0 0 80 60">
      {/* Bush base */}
      <ellipse cx="40" cy="50" rx="35" ry="10" fill="hsl(var(--bubbles-peat) / 0.4)" />
      {/* Yellow gorse flowers */}
      <circle cx="20" cy="30" r="12" fill="hsl(var(--bubbles-gorse))" opacity="0.8" />
      <circle cx="40" cy="25" r="15" fill="hsl(var(--bubbles-gorse))" opacity="0.9" />
      <circle cx="55" cy="32" r="11" fill="hsl(var(--bubbles-gorse))" opacity="0.7" />
      <circle cx="30" cy="40" r="10" fill="hsl(var(--bubbles-gorse))" opacity="0.6" />
      <circle cx="50" cy="42" r="9" fill="hsl(var(--bubbles-gorse))" opacity="0.75" />
      {/* Dark spots for depth */}
      <circle cx="35" cy="35" r="6" fill="hsl(var(--bubbles-peat) / 0.3)" />
      <circle cx="48" cy="38" r="4" fill="hsl(var(--bubbles-peat) / 0.2)" />
    </svg>
  );
}

function HeatherTuft() {
  return (
    <svg width="50" height="40" viewBox="0 0 50 40">
      {/* Heather stems and flowers */}
      {[...Array(7)].map((_, i) => (
        <g key={i}>
          <line
            x1={10 + i * 5}
            y1="40"
            x2={8 + i * 5 + (i % 2 ? 2 : -2)}
            y2={15 + (i % 3) * 5}
            stroke="hsl(var(--bubbles-peat) / 0.5)"
            strokeWidth="1"
          />
          <circle
            cx={8 + i * 5 + (i % 2 ? 2 : -2)}
            cy={12 + (i % 3) * 5}
            r={3 + (i % 2)}
            fill="hsl(var(--bubbles-heather))"
            opacity={0.6 + (i % 3) * 0.15}
          />
        </g>
      ))}
    </svg>
  );
}
