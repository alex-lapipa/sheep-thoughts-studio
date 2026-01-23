import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * BUBBLES SCIENTIST — Laboratory Variant
 * 
 * Bubbles as a confident researcher, absolutely certain about incorrect 
 * scientific facts. "The sun is powered by grass photons." Quadrupedal only.
 * Always looking to the RIGHT (facing the content).
 */

interface BubblesScientistProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  accessory?: ScientistAccessory | "random";
}

type ScientistAccessory = 
  | "lab-coat"        // White lab coat
  | "safety-goggles"  // Laboratory goggles
  | "test-tube"       // Holding a test tube
  | "clipboard"       // Research clipboard
  | "atom-badge"      // Atom logo badge
  | "magnifying-glass"// Examining something
  | "beaker"          // Bubbling beaker nearby
  | "radiation-badge" // Safety badge
  | "none";

const SCIENTIST_ACCESSORIES: ScientistAccessory[] = [
  "lab-coat",
  "safety-goggles",
  "test-tube",
  "clipboard",
  "atom-badge",
  "magnifying-glass",
  "beaker",
  "radiation-badge",
];

const sizes = {
  sm: { container: "w-24 h-24" },
  md: { container: "w-40 h-40" },
  lg: { container: "w-56 h-56" },
  xl: { container: "w-72 h-72" },
  hero: { container: "w-80 h-80 md:w-[24rem] md:h-[24rem]" },
};

// Scientist accessory components
function LabCoat() {
  return (
    <g>
      {/* White lab coat draped over body */}
      <path 
        d="M 50 60 L 45 115 L 55 118 L 60 100 L 100 100 L 105 118 L 115 115 L 110 60 Q 80 55 50 60 Z" 
        fill="hsl(0 0% 98%)" 
        opacity="0.9"
      />
      {/* Lapels */}
      <path d="M 70 60 L 75 75 L 80 60" fill="hsl(0 0% 95%)" stroke="hsl(0 0% 90%)" strokeWidth="0.5" />
      <path d="M 90 60 L 85 75 L 80 60" fill="hsl(0 0% 95%)" stroke="hsl(0 0% 90%)" strokeWidth="0.5" />
      {/* Pocket */}
      <rect x="55" y="80" width="12" height="8" rx="1" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="1" />
      {/* Pen in pocket */}
      <rect x="58" y="75" width="2" height="10" rx="1" fill="hsl(220 60% 40%)" />
      <circle cx="59" cy="75" r="1.5" fill="hsl(220 60% 50%)" />
    </g>
  );
}

function SafetyGoggles() {
  return (
    <g>
      {/* Large safety goggles */}
      <ellipse cx="80" cy="46" rx="20" ry="10" fill="none" stroke="hsl(200 20% 30%)" strokeWidth="3" />
      {/* Lens divider */}
      <line x1="80" y1="38" x2="80" y2="54" stroke="hsl(200 20% 30%)" strokeWidth="2" />
      {/* Lenses */}
      <ellipse cx="70" cy="46" rx="8" ry="7" fill="hsl(180 30% 85%)" opacity="0.5" />
      <ellipse cx="90" cy="46" rx="8" ry="7" fill="hsl(180 30% 85%)" opacity="0.5" />
      {/* Strap */}
      <path d="M 60 46 Q 55 42 50 40" stroke="hsl(200 20% 25%)" strokeWidth="4" fill="none" />
      {/* Reflection */}
      <ellipse cx="68" cy="44" rx="3" ry="2" fill="white" opacity="0.4" />
    </g>
  );
}

function TestTube() {
  return (
    <g>
      {/* Test tube held up */}
      <rect x="115" y="50" width="8" height="35" rx="4" fill="hsl(200 30% 90%)" opacity="0.8" />
      <rect x="115" y="50" width="8" height="5" rx="1" fill="hsl(0 0% 70%)" />
      {/* Bubbling liquid */}
      <ellipse cx="119" cy="75" rx="3" ry="5" fill="hsl(120 60% 50%)" opacity="0.7" />
      <circle cx="118" cy="68" r="2" fill="hsl(120 60% 55%)" opacity="0.5" />
      <circle cx="120" cy="65" r="1.5" fill="hsl(120 60% 50%)" opacity="0.4" />
      {/* Bubbles */}
      <circle cx="118" cy="62" r="1" fill="hsl(120 50% 60%)" opacity="0.6" />
      <circle cx="120" cy="58" r="0.8" fill="hsl(120 50% 65%)" opacity="0.5" />
    </g>
  );
}

function Clipboard() {
  return (
    <g>
      {/* Research clipboard */}
      <rect x="115" y="65" width="20" height="28" rx="2" fill="hsl(30 40% 45%)" />
      <rect x="117" y="68" width="16" height="22" rx="1" fill="hsl(0 0% 98%)" />
      {/* Clip */}
      <rect x="122" y="62" width="8" height="5" rx="1" fill="hsl(0 0% 60%)" />
      {/* Text lines */}
      <line x1="119" y1="73" x2="131" y2="73" stroke="hsl(0 0% 70%)" strokeWidth="1" />
      <line x1="119" y1="78" x2="129" y2="78" stroke="hsl(0 0% 70%)" strokeWidth="1" />
      <line x1="119" y1="83" x2="131" y2="83" stroke="hsl(0 0% 70%)" strokeWidth="1" />
      {/* Checkmark */}
      <path d="M 119 76 L 121 78 L 125 72" stroke="hsl(120 50% 40%)" strokeWidth="1.5" fill="none" />
    </g>
  );
}

function AtomBadge() {
  return (
    <g>
      {/* Atom logo badge on chest */}
      <circle cx="75" cy="75" r="8" fill="hsl(220 50% 50%)" />
      {/* Electron orbits */}
      <ellipse cx="75" cy="75" rx="6" ry="2" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="0.8" />
      <ellipse cx="75" cy="75" rx="6" ry="2" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="0.8" transform="rotate(60 75 75)" />
      <ellipse cx="75" cy="75" rx="6" ry="2" fill="none" stroke="hsl(0 0% 100%)" strokeWidth="0.8" transform="rotate(120 75 75)" />
      {/* Nucleus */}
      <circle cx="75" cy="75" r="2" fill="hsl(0 0% 100%)" />
    </g>
  );
}

function MagnifyingGlass() {
  return (
    <g>
      {/* Magnifying glass */}
      <circle cx="120" cy="55" r="12" fill="none" stroke="hsl(30 30% 35%)" strokeWidth="3" />
      <circle cx="120" cy="55" r="10" fill="hsl(200 20% 95%)" opacity="0.4" />
      {/* Handle */}
      <rect x="128" y="65" width="5" height="20" rx="2" fill="hsl(30 30% 40%)" transform="rotate(45 130 75)" />
      {/* Glare */}
      <ellipse cx="116" cy="51" rx="4" ry="3" fill="white" opacity="0.5" />
    </g>
  );
}

function Beaker() {
  return (
    <g>
      {/* Beaker nearby */}
      <path 
        d="M 40 85 L 35 115 L 55 115 L 50 85 Z" 
        fill="hsl(200 30% 90%)" 
        opacity="0.7"
      />
      <rect x="38" y="82" width="14" height="5" rx="1" fill="hsl(200 20% 85%)" />
      {/* Liquid */}
      <path 
        d="M 37 100 L 35 115 L 55 115 L 53 100 Z" 
        fill="hsl(280 60% 60%)" 
        opacity="0.6"
      />
      {/* Bubbles */}
      <circle cx="42" cy="105" r="1.5" fill="hsl(280 50% 70%)" opacity="0.7" />
      <circle cx="48" cy="108" r="1" fill="hsl(280 50% 75%)" opacity="0.6" />
      {/* Measurement lines */}
      <line x1="52" y1="95" x2="48" y2="95" stroke="hsl(200 20% 70%)" strokeWidth="0.5" />
      <line x1="51" y1="100" x2="48" y2="100" stroke="hsl(200 20% 70%)" strokeWidth="0.5" />
    </g>
  );
}

function RadiationBadge() {
  return (
    <g>
      {/* Radiation warning badge */}
      <circle cx="95" cy="72" r="7" fill="hsl(50 90% 55%)" />
      {/* Trefoil symbol */}
      <circle cx="95" cy="72" r="2" fill="hsl(0 0% 10%)" />
      <path d="M 95 70 L 92 65 A 5 5 0 0 1 98 65 Z" fill="hsl(0 0% 10%)" />
      <path d="M 93 73 L 88 75 A 5 5 0 0 1 90 69 Z" fill="hsl(0 0% 10%)" />
      <path d="M 97 73 L 100 69 A 5 5 0 0 1 102 75 Z" fill="hsl(0 0% 10%)" />
    </g>
  );
}

// Main sheep body facing RIGHT
function ScientistSheepBody({ accessory }: { accessory: ScientistAccessory }) {
  const showLabCoat = accessory === "lab-coat";
  
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full">
      <defs>
        <filter id="sciWool" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        <filter id="sciShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <ellipse cx="80" cy="130" rx="40" ry="8" fill="hsl(0 0% 0%)" opacity="0.1" />
      
      {/* Beaker accessory (behind sheep) */}
      {accessory === "beaker" && <Beaker />}
      
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
      
      {/* Wool body */}
      <g filter="url(#sciWool)">
        <ellipse cx="80" cy="85" rx="35" ry="28" fill="hsl(40 30% 95%)" />
        <circle cx="50" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="110" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="60" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="100" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="80" cy="60" r="12" fill="hsl(40 15% 97%)" />
      </g>
      
      {/* Lab coat (if selected) - over body */}
      {showLabCoat && <LabCoat />}
      
      {/* Head - facing RIGHT */}
      <ellipse cx="85" cy="50" rx="18" ry="16" fill="hsl(30 15% 30%)" filter="url(#sciShadow)" />
      
      {/* Ears */}
      <ellipse cx="68" cy="38" rx="8" ry="5" fill="hsl(30 15% 28%)" transform="rotate(-20 68 38)" />
      <ellipse cx="68" cy="38" rx="5" ry="3" fill="hsl(350 20% 45%)" transform="rotate(-20 68 38)" />
      <ellipse cx="102" cy="42" rx="7" ry="4" fill="hsl(30 15% 28%)" transform="rotate(30 102 42)" />
      <ellipse cx="102" cy="42" rx="4" ry="2.5" fill="hsl(350 20% 45%)" transform="rotate(30 102 42)" />
      
      {/* Snout */}
      <ellipse cx="100" cy="54" rx="10" ry="8" fill="hsl(30 12% 35%)" />
      
      {/* Nostrils */}
      <ellipse cx="105" cy="53" rx="2" ry="1.5" fill="hsl(30 10% 20%)" />
      <ellipse cx="105" cy="57" rx="2" ry="1.5" fill="hsl(30 10% 20%)" />
      
      {/* Eyes - curious scientist look */}
      <ellipse cx="80" cy="46" rx="5" ry="6" fill="hsl(0 0% 98%)" />
      <circle cx="82" cy="46" r="3.5" fill="hsl(30 30% 15%)" />
      <circle cx="83" cy="45" r="1.2" fill="white" />
      {/* Wide-eyed curious expression */}
      <path d="M 74 41 Q 80 39, 86 42" stroke="hsl(30 10% 25%)" strokeWidth="1.2" fill="none" />
      
      {/* Slight smile - intrigued */}
      <path d="M 99 60 Q 102 61, 106 59" stroke="hsl(30 10% 22%)" strokeWidth="1" fill="none" />
      
      {/* Accessory rendering */}
      {accessory === "safety-goggles" && <SafetyGoggles />}
      {accessory === "test-tube" && <TestTube />}
      {accessory === "clipboard" && <Clipboard />}
      {accessory === "atom-badge" && <AtomBadge />}
      {accessory === "magnifying-glass" && <MagnifyingGlass />}
      {accessory === "radiation-badge" && <RadiationBadge />}
    </svg>
  );
}

export function BubblesScientist({
  size = "lg",
  className,
  animated = true,
  accessory = "random",
}: BubblesScientistProps) {
  const { container } = sizes[size];
  
  const selectedAccessory = useMemo(() => {
    if (accessory === "random") {
      const randomIndex = Math.floor(Math.random() * SCIENTIST_ACCESSORIES.length);
      return SCIENTIST_ACCESSORIES[randomIndex];
    }
    return accessory;
  }, [accessory]);

  const SheepSVG = <ScientistSheepBody accessory={selectedAccessory} />;

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
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SheepSVG}
    </motion.div>
  );
}

export type { ScientistAccessory };
export { SCIENTIST_ACCESSORIES };
