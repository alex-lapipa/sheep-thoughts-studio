import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * BUBBLES EXPLORER — Adventure Variant
 * 
 * Bubbles as a confident adventurer, absolutely certain about geography 
 * and navigation (incorrectly). "North is wherever the grass is greenest."
 * Quadrupedal only. Always looking to the RIGHT.
 */

interface BubblesExplorerProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  accessory?: ExplorerAccessory | "random";
}

type ExplorerAccessory = 
  | "safari-hat"      // Pith helmet
  | "compass"         // Holding compass
  | "binoculars"      // Around neck
  | "backpack"        // Small rucksack
  | "map"             // Unfolded map
  | "walking-stick"   // Hiking stick
  | "bandana-neck"    // Adventure bandana
  | "camera"          // Camera around neck
  | "none";

const EXPLORER_ACCESSORIES: ExplorerAccessory[] = [
  "safari-hat",
  "compass",
  "binoculars",
  "backpack",
  "map",
  "walking-stick",
  "bandana-neck",
  "camera",
];

const sizes = {
  sm: { container: "w-24 h-24" },
  md: { container: "w-40 h-40" },
  lg: { container: "w-56 h-56" },
  xl: { container: "w-72 h-72" },
  hero: { container: "w-80 h-80 md:w-[24rem] md:h-[24rem]" },
};

// Explorer accessory components
function SafariHat() {
  return (
    <g>
      {/* Pith helmet / safari hat */}
      <ellipse cx="75" cy="38" rx="22" ry="8" fill="hsl(40 50% 75%)" />
      <ellipse cx="75" cy="30" rx="15" ry="12" fill="hsl(40 45% 70%)" />
      <ellipse cx="75" cy="28" rx="14" ry="10" fill="hsl(40 50% 75%)" />
      {/* Hat band */}
      <ellipse cx="75" cy="36" rx="16" ry="4" fill="hsl(30 40% 35%)" opacity="0.7" />
      {/* Ventilation holes */}
      <circle cx="68" cy="28" r="1" fill="hsl(40 40% 65%)" />
      <circle cx="82" cy="28" r="1" fill="hsl(40 40% 65%)" />
    </g>
  );
}

function Compass() {
  return (
    <g>
      {/* Compass held in front */}
      <circle cx="120" cy="75" r="10" fill="hsl(40 40% 50%)" />
      <circle cx="120" cy="75" r="8" fill="hsl(0 0% 95%)" />
      {/* Cardinal directions */}
      <text x="120" y="70" fontSize="4" fill="hsl(0 70% 50%)" textAnchor="middle">N</text>
      <text x="120" y="83" fontSize="3" fill="hsl(0 0% 30%)" textAnchor="middle">S</text>
      {/* Needle */}
      <path d="M 120 69 L 118 75 L 120 81 L 122 75 Z" fill="hsl(0 70% 50%)" />
      <path d="M 120 81 L 118 75 L 120 69" fill="hsl(0 0% 30%)" opacity="0.5" />
      {/* Center pin */}
      <circle cx="120" cy="75" r="1.5" fill="hsl(40 30% 40%)" />
    </g>
  );
}

function Binoculars() {
  return (
    <g>
      {/* Binoculars around neck */}
      <ellipse cx="70" cy="70" rx="6" ry="8" fill="hsl(0 0% 20%)" />
      <ellipse cx="85" cy="70" rx="6" ry="8" fill="hsl(0 0% 20%)" />
      {/* Bridge */}
      <rect x="74" y="68" width="8" height="4" rx="1" fill="hsl(0 0% 25%)" />
      {/* Lenses */}
      <ellipse cx="70" cy="63" rx="5" ry="3" fill="hsl(200 30% 70%)" opacity="0.6" />
      <ellipse cx="85" cy="63" rx="5" ry="3" fill="hsl(200 30% 70%)" opacity="0.6" />
      {/* Strap */}
      <path d="M 65 65 Q 60 55 65 45" stroke="hsl(30 30% 30%)" strokeWidth="2" fill="none" />
      <path d="M 90 65 Q 95 55 90 45" stroke="hsl(30 30% 30%)" strokeWidth="2" fill="none" />
    </g>
  );
}

function Backpack() {
  return (
    <g>
      {/* Small hiking backpack */}
      <rect x="45" y="65" width="18" height="25" rx="4" fill="hsl(25 50% 40%)" />
      <rect x="47" y="67" width="14" height="10" rx="2" fill="hsl(25 45% 35%)" />
      {/* Straps */}
      <path d="M 50 65 Q 55 55 60 65" stroke="hsl(25 40% 30%)" strokeWidth="3" fill="none" />
      {/* Buckle */}
      <rect x="52" y="78" width="6" height="3" rx="1" fill="hsl(40 30% 50%)" />
      {/* Side pocket */}
      <rect x="46" y="82" width="6" height="6" rx="1" fill="hsl(25 45% 38%)" />
    </g>
  );
}

function MapAccessory() {
  return (
    <g>
      {/* Unfolded map */}
      <rect x="110" y="55" width="30" height="25" rx="1" fill="hsl(45 60% 85%)" transform="rotate(10 125 67)" />
      {/* Map lines */}
      <path d="M 115 60 Q 125 65 135 60" stroke="hsl(200 50% 50%)" strokeWidth="1" fill="none" transform="rotate(10 125 67)" />
      <path d="M 118 68 L 132 65" stroke="hsl(30 40% 50%)" strokeWidth="0.8" transform="rotate(10 125 67)" />
      <path d="M 120 72 L 128 75" stroke="hsl(30 40% 50%)" strokeWidth="0.8" transform="rotate(10 125 67)" />
      {/* X marks the spot */}
      <text x="125" y="70" fontSize="8" fill="hsl(0 70% 50%)" transform="rotate(10 125 67)">×</text>
      {/* Fold lines */}
      <line x1="120" y1="55" x2="120" y2="80" stroke="hsl(45 40% 70%)" strokeWidth="0.5" transform="rotate(10 125 67)" />
      <line x1="130" y1="55" x2="130" y2="80" stroke="hsl(45 40% 70%)" strokeWidth="0.5" transform="rotate(10 125 67)" />
    </g>
  );
}

function WalkingStick() {
  return (
    <g>
      {/* Hiking walking stick */}
      <rect x="118" y="45" width="4" height="85" rx="2" fill="hsl(30 40% 35%)" />
      {/* Handle wrap */}
      <rect x="117" y="45" width="6" height="12" rx="2" fill="hsl(30 30% 28%)" />
      {/* Grip bands */}
      <rect x="117" y="50" width="6" height="2" rx="1" fill="hsl(0 0% 20%)" />
      <rect x="117" y="54" width="6" height="2" rx="1" fill="hsl(0 0% 20%)" />
      {/* Metal tip */}
      <polygon points="120,130 118,125 122,125" fill="hsl(0 0% 60%)" />
    </g>
  );
}

function BandanaNeck() {
  return (
    <g>
      {/* Adventure bandana around neck */}
      <path 
        d="M 65 58 Q 80 55 95 58 L 90 70 Q 80 75 70 70 Z" 
        fill="hsl(0 70% 45%)"
      />
      {/* Paisley pattern */}
      <ellipse cx="75" cy="64" rx="3" ry="2" fill="hsl(0 70% 55%)" />
      <ellipse cx="85" cy="63" rx="2" ry="1.5" fill="hsl(0 70% 55%)" />
      {/* Knot */}
      <circle cx="80" cy="72" r="3" fill="hsl(0 70% 40%)" />
      <path d="M 77 74 L 72 82" stroke="hsl(0 70% 40%)" strokeWidth="4" />
      <path d="M 83 74 L 88 82" stroke="hsl(0 70% 45%)" strokeWidth="4" />
    </g>
  );
}

function Camera() {
  return (
    <g>
      {/* Camera around neck */}
      <rect x="72" y="68" width="16" height="12" rx="2" fill="hsl(0 0% 25%)" />
      {/* Lens */}
      <circle cx="80" cy="74" r="4" fill="hsl(0 0% 15%)" />
      <circle cx="80" cy="74" r="3" fill="hsl(200 30% 40%)" opacity="0.6" />
      {/* Flash */}
      <rect x="86" y="69" width="3" height="4" rx="1" fill="hsl(0 0% 35%)" />
      {/* Viewfinder */}
      <rect x="73" y="69" width="4" height="3" rx="0.5" fill="hsl(0 0% 30%)" />
      {/* Strap */}
      <path d="M 72 72 Q 65 60 70 50" stroke="hsl(0 0% 20%)" strokeWidth="2" fill="none" />
      <path d="M 88 72 Q 95 60 90 50" stroke="hsl(0 0% 20%)" strokeWidth="2" fill="none" />
    </g>
  );
}

// Main sheep body facing RIGHT
function ExplorerSheepBody({ accessory }: { accessory: ExplorerAccessory }) {
  const showBackpack = accessory === "backpack";
  
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full">
      <defs>
        <filter id="expWool" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        <filter id="expShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <ellipse cx="80" cy="130" rx="40" ry="8" fill="hsl(0 0% 0%)" opacity="0.1" />
      
      {/* Backpack (behind sheep) */}
      {showBackpack && <Backpack />}
      
      {/* Walking stick (behind) */}
      {accessory === "walking-stick" && <WalkingStick />}
      
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
      <g filter="url(#expWool)">
        <ellipse cx="80" cy="85" rx="35" ry="28" fill="hsl(40 30% 95%)" />
        <circle cx="50" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="110" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="60" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="100" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="80" cy="60" r="12" fill="hsl(40 15% 97%)" />
      </g>
      
      {/* Head - facing RIGHT */}
      <ellipse cx="85" cy="50" rx="18" ry="16" fill="hsl(30 15% 30%)" filter="url(#expShadow)" />
      
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
      
      {/* Eyes - adventurous eager look */}
      <ellipse cx="80" cy="46" rx="5" ry="6" fill="hsl(0 0% 98%)" />
      <circle cx="83" cy="45" r="3" fill="hsl(30 30% 15%)" />
      <circle cx="84" cy="44" r="1" fill="white" />
      {/* Determined eyebrow */}
      <path d="M 73 40 Q 80 38, 87 41" stroke="hsl(30 10% 25%)" strokeWidth="1.5" fill="none" />
      
      {/* Excited grin */}
      <path d="M 97 59 Q 103 63, 108 60" stroke="hsl(30 10% 22%)" strokeWidth="1.2" fill="none" />
      
      {/* Accessory rendering */}
      {accessory === "safari-hat" && <SafariHat />}
      {accessory === "compass" && <Compass />}
      {accessory === "binoculars" && <Binoculars />}
      {accessory === "map" && <MapAccessory />}
      {accessory === "bandana-neck" && <BandanaNeck />}
      {accessory === "camera" && <Camera />}
    </svg>
  );
}

export function BubblesExplorer({
  size = "lg",
  className,
  animated = true,
  accessory = "random",
}: BubblesExplorerProps) {
  const { container } = sizes[size];
  
  const selectedAccessory = useMemo(() => {
    if (accessory === "random") {
      const randomIndex = Math.floor(Math.random() * EXPLORER_ACCESSORIES.length);
      return EXPLORER_ACCESSORIES[randomIndex];
    }
    return accessory;
  }, [accessory]);

  const SheepSVG = <ExplorerSheepBody accessory={selectedAccessory} />;

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
        y: [-2, 4, -2],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SheepSVG}
    </motion.div>
  );
}

export type { ExplorerAccessory };
export { EXPLORER_ACCESSORIES };
