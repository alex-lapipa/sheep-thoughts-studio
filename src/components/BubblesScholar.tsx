import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * BUBBLES SCHOLAR — Academic Variant
 * 
 * Bubbles as a distinguished academic, confidently incorrect about everything.
 * Accessories are randomized on each load to create variety.
 * Always looking to the RIGHT (facing the content).
 */

interface BubblesScholarProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  accessory?: ScholarAccessory | "random";
}

type ScholarAccessory = 
  | "mortarboard" 
  | "spectacles" 
  | "monocle" 
  | "tweed-jacket" 
  | "bow-tie" 
  | "pipe" 
  | "quill" 
  | "reading-glasses"
  | "beret"
  | "none";

const SCHOLAR_ACCESSORIES: ScholarAccessory[] = [
  "mortarboard",
  "spectacles", 
  "monocle",
  "tweed-jacket",
  "bow-tie",
  "pipe",
  "quill",
  "reading-glasses",
  "beret",
];

const sizes = {
  sm: { container: "w-24 h-24", scale: 0.5 },
  md: { container: "w-40 h-40", scale: 0.8 },
  lg: { container: "w-56 h-56", scale: 1 },
  xl: { container: "w-72 h-72", scale: 1.2 },
  hero: { container: "w-80 h-80 md:w-[24rem] md:h-[24rem]", scale: 1.5 },
};

// Scholarly accessory components
function Mortarboard() {
  return (
    <g>
      {/* Mortarboard/graduation cap */}
      <rect x="52" y="18" width="32" height="4" rx="1" fill="hsl(0 0% 15%)" />
      <polygon points="68,22 55,28 68,34 81,28" fill="hsl(0 0% 20%)" />
      {/* Tassel */}
      <circle cx="82" cy="22" r="2" fill="hsl(45 80% 50%)" />
      <path d="M 82 24 Q 88 30, 85 40" stroke="hsl(45 80% 50%)" strokeWidth="1.5" fill="none" />
      <circle cx="85" cy="40" r="3" fill="hsl(45 80% 50%)" />
    </g>
  );
}

function Spectacles() {
  return (
    <g>
      {/* Round academic spectacles */}
      <circle cx="78" cy="48" r="8" fill="none" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      <circle cx="94" cy="48" r="7" fill="none" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Bridge */}
      <path d="M 86 48 L 87 48" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Temple */}
      <line x1="70" y1="47" x2="58" y2="42" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Lens glare */}
      <ellipse cx="76" cy="46" rx="2" ry="1.5" fill="hsl(200 60% 80%)" opacity="0.4" />
    </g>
  );
}

function Monocle() {
  return (
    <g>
      {/* Distinguished monocle */}
      <circle cx="90" cy="48" r="9" fill="none" stroke="hsl(45 60% 45%)" strokeWidth="2.5" />
      {/* Chain */}
      <path d="M 82 52 Q 75 60, 70 75 Q 68 82, 72 85" stroke="hsl(45 60% 45%)" strokeWidth="1" fill="none" />
      {/* Lens */}
      <circle cx="90" cy="48" r="7" fill="hsl(200 20% 95%)" opacity="0.3" />
      {/* Glare */}
      <ellipse cx="88" cy="46" rx="2" ry="1.5" fill="white" opacity="0.5" />
    </g>
  );
}

function TweedJacket() {
  return (
    <g>
      {/* Tweed jacket/vest pattern on body */}
      <ellipse cx="80" cy="80" rx="30" ry="25" fill="hsl(30 30% 45%)" opacity="0.6" />
      {/* Tweed texture lines */}
      <path d="M 55 70 L 65 90" stroke="hsl(30 20% 35%)" strokeWidth="0.5" opacity="0.5" />
      <path d="M 60 68 L 70 88" stroke="hsl(30 20% 35%)" strokeWidth="0.5" opacity="0.5" />
      <path d="M 65 66 L 75 86" stroke="hsl(30 20% 35%)" strokeWidth="0.5" opacity="0.5" />
      <path d="M 90 66 L 100 86" stroke="hsl(30 20% 35%)" strokeWidth="0.5" opacity="0.5" />
      <path d="M 95 68 L 105 88" stroke="hsl(30 20% 35%)" strokeWidth="0.5" opacity="0.5" />
      {/* Elbow patches */}
      <ellipse cx="52" cy="78" rx="6" ry="8" fill="hsl(25 40% 35%)" opacity="0.7" />
      <ellipse cx="108" cy="78" rx="6" ry="8" fill="hsl(25 40% 35%)" opacity="0.7" />
      {/* Buttons */}
      <circle cx="80" cy="72" r="2" fill="hsl(30 20% 25%)" />
      <circle cx="80" cy="80" r="2" fill="hsl(30 20% 25%)" />
    </g>
  );
}

function BowTieScholar() {
  return (
    <g>
      {/* Academic bow tie */}
      <polygon points="75,62 68,58 68,66" fill="hsl(0 70% 40%)" />
      <polygon points="85,62 92,58 92,66" fill="hsl(0 70% 40%)" />
      <circle cx="80" cy="62" r="3" fill="hsl(0 70% 35%)" />
      {/* Polka dots pattern */}
      <circle cx="70" cy="61" r="1" fill="hsl(0 0% 100%)" opacity="0.4" />
      <circle cx="90" cy="61" r="1" fill="hsl(0 0% 100%)" opacity="0.4" />
    </g>
  );
}

function Pipe() {
  return (
    <g>
      {/* Distinguished pipe */}
      <ellipse cx="108" cy="58" rx="6" ry="5" fill="hsl(25 50% 30%)" />
      <rect x="100" y="55" width="10" height="6" rx="1" fill="hsl(25 50% 25%)" />
      {/* Stem */}
      <path d="M 100 58 Q 95 60, 94 56" stroke="hsl(25 30% 20%)" strokeWidth="3" fill="none" />
      {/* Bowl rim */}
      <ellipse cx="108" cy="54" rx="5" ry="2" fill="hsl(25 40% 35%)" />
      {/* Smoke wisps */}
      <path d="M 108 50 Q 110 45, 108 40 Q 106 35, 110 30" stroke="hsl(0 0% 70%)" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M 110 48 Q 113 42, 111 36" stroke="hsl(0 0% 70%)" strokeWidth="0.8" fill="none" opacity="0.3" />
    </g>
  );
}

function Quill() {
  return (
    <g>
      {/* Quill pen tucked behind ear */}
      <path d="M 55 35 Q 48 25, 42 10" stroke="hsl(30 60% 45%)" strokeWidth="2" fill="none" />
      {/* Feather */}
      <path d="M 42 10 Q 38 8, 35 12 Q 38 10, 42 10" fill="hsl(0 0% 95%)" />
      <path d="M 42 10 Q 40 5, 38 8 Q 40 6, 42 10" fill="hsl(0 0% 90%)" />
      <path d="M 42 10 Q 44 6, 42 3 Q 43 5, 42 10" fill="hsl(0 0% 92%)" />
      {/* Feather details */}
      <path d="M 40 9 L 38 7" stroke="hsl(0 0% 80%)" strokeWidth="0.5" />
      <path d="M 41 8 L 40 5" stroke="hsl(0 0% 80%)" strokeWidth="0.5" />
      {/* Nib */}
      <path d="M 55 35 L 58 38" stroke="hsl(45 60% 40%)" strokeWidth="1.5" />
    </g>
  );
}

function ReadingGlasses() {
  return (
    <g>
      {/* Half-moon reading glasses */}
      <path d="M 72 52 Q 78 58, 84 52" fill="none" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      <path d="M 88 52 Q 94 58, 100 52" fill="none" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Bridge */}
      <path d="M 84 52 L 88 52" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Temple - going to ear */}
      <line x1="72" y1="50" x2="60" y2="44" stroke="hsl(30 40% 30%)" strokeWidth="2" />
      {/* Lens */}
      <path d="M 72 52 Q 78 56, 84 52 L 84 48 Q 78 52, 72 48 Z" fill="hsl(200 20% 95%)" opacity="0.2" />
    </g>
  );
}

function Beret() {
  return (
    <g>
      {/* Artist/academic beret */}
      <ellipse cx="72" cy="30" rx="18" ry="10" fill="hsl(0 70% 25%)" />
      <ellipse cx="72" cy="28" rx="16" ry="8" fill="hsl(0 70% 30%)" />
      {/* Beret nub */}
      <circle cx="68" cy="22" r="3" fill="hsl(0 70% 28%)" />
      {/* Band */}
      <path d="M 55 32 Q 72 38, 90 30" stroke="hsl(0 60% 20%)" strokeWidth="2" fill="none" />
    </g>
  );
}

// Main sheep body facing RIGHT
function ScholarSheepBody({ accessory }: { accessory: ScholarAccessory }) {
  const showTweed = accessory === "tweed-jacket";
  
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full">
      <defs>
        {/* Wool texture filter */}
        <filter id="scholarWool" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        {/* Soft shadow */}
        <filter id="scholarShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <ellipse cx="80" cy="130" rx="40" ry="8" fill="hsl(0 0% 0%)" opacity="0.1" />
      
      {/* Tweed jacket (if selected) - rendered behind body */}
      {showTweed && <TweedJacket />}
      
      {/* Back legs */}
      <rect x="55" y="100" width="8" height="28" rx="4" fill="hsl(30 20% 25%)" />
      <rect x="68" y="100" width="8" height="28" rx="4" fill="hsl(30 20% 28%)" />
      
      {/* Front legs */}
      <rect x="92" y="100" width="8" height="28" rx="4" fill="hsl(30 20% 25%)" />
      <rect x="105" y="100" width="8" height="28" rx="4" fill="hsl(30 20% 28%)" />
      
      {/* Hooves */}
      <rect x="55" y="124" width="8" height="6" rx="2" fill="hsl(30 15% 18%)" />
      <rect x="68" y="124" width="8" height="6" rx="2" fill="hsl(30 15% 18%)" />
      <rect x="92" y="124" width="8" height="6" rx="2" fill="hsl(30 15% 18%)" />
      <rect x="105" y="124" width="8" height="6" rx="2" fill="hsl(30 15% 18%)" />
      
      {/* Wool body - fluffy cloud shape */}
      <g filter="url(#scholarWool)">
        <ellipse cx="80" cy="85" rx="35" ry="28" fill="hsl(40 30% 95%)" />
        <circle cx="50" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="110" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="60" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="100" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="80" cy="60" r="12" fill="hsl(40 15% 97%)" />
      </g>
      
      {/* Head - facing RIGHT */}
      <ellipse cx="85" cy="50" rx="18" ry="16" fill="hsl(30 15% 30%)" filter="url(#scholarShadow)" />
      
      {/* Ears */}
      <ellipse cx="68" cy="38" rx="8" ry="5" fill="hsl(30 15% 28%)" transform="rotate(-20 68 38)" />
      <ellipse cx="68" cy="38" rx="5" ry="3" fill="hsl(350 20% 45%)" transform="rotate(-20 68 38)" />
      <ellipse cx="102" cy="42" rx="7" ry="4" fill="hsl(30 15% 28%)" transform="rotate(30 102 42)" />
      <ellipse cx="102" cy="42" rx="4" ry="2.5" fill="hsl(350 20% 45%)" transform="rotate(30 102 42)" />
      
      {/* Snout - pointing RIGHT */}
      <ellipse cx="100" cy="54" rx="10" ry="8" fill="hsl(30 12% 35%)" />
      
      {/* Nostrils */}
      <ellipse cx="105" cy="53" rx="2" ry="1.5" fill="hsl(30 10% 20%)" />
      <ellipse cx="105" cy="57" rx="2" ry="1.5" fill="hsl(30 10% 20%)" />
      
      {/* Eyes - looking RIGHT with scholarly expression */}
      <ellipse cx="80" cy="46" rx="5" ry="6" fill="hsl(0 0% 98%)" />
      {/* Pupil - looking right */}
      <circle cx="83" cy="46" r="3" fill="hsl(30 30% 15%)" />
      <circle cx="84" cy="45" r="1" fill="white" />
      {/* Slightly lowered eyelid for contemplative look */}
      <ellipse cx="80" cy="43" rx="5.5" ry="3" fill="hsl(30 15% 30%)" />
      
      {/* Eyebrow - slightly raised for intellectual expression */}
      <path d="M 74 40 Q 80 37, 86 40" stroke="hsl(30 10% 25%)" strokeWidth="1.5" fill="none" />
      
      {/* Subtle smile/mouth */}
      <path d="M 98 60 Q 102 62, 106 60" stroke="hsl(30 10% 22%)" strokeWidth="1" fill="none" />
      
      {/* Accessory rendering */}
      {accessory === "mortarboard" && <Mortarboard />}
      {accessory === "spectacles" && <Spectacles />}
      {accessory === "monocle" && <Monocle />}
      {accessory === "bow-tie" && <BowTieScholar />}
      {accessory === "pipe" && <Pipe />}
      {accessory === "quill" && <Quill />}
      {accessory === "reading-glasses" && <ReadingGlasses />}
      {accessory === "beret" && <Beret />}
    </svg>
  );
}

export function BubblesScholar({
  size = "lg",
  className,
  animated = true,
  accessory = "random",
}: BubblesScholarProps) {
  const { container } = sizes[size];
  
  // Randomize accessory on mount (stable per render)
  const selectedAccessory = useMemo(() => {
    if (accessory === "random") {
      const randomIndex = Math.floor(Math.random() * SCHOLAR_ACCESSORIES.length);
      return SCHOLAR_ACCESSORIES[randomIndex];
    }
    return accessory;
  }, [accessory]);

  const SheepSVG = <ScholarSheepBody accessory={selectedAccessory} />;

  if (!animated) {
    return (
      <div className={cn(container, "select-none", className)}>
        {SheepSVG}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(container, "select-none", className)}
      animate={{
        y: [-3, 3, -3],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SheepSVG}
    </motion.div>
  );
}

// Export the accessory type for external use
export type { ScholarAccessory };
export { SCHOLAR_ACCESSORIES };
