import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * BUBBLES CHEF — Culinary Variant
 * 
 * Bubbles as a confident culinary expert, absolutely certain grass is the 
 * finest ingredient in haute cuisine. Quadrupedal only.
 * Always looking to the RIGHT (facing the content).
 */

interface BubblesChefProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  accessory?: ChefAccessory | "random";
}

type ChefAccessory = 
  | "toque"           // Classic chef hat
  | "apron"           // White apron
  | "bandana"         // Kitchen bandana
  | "whisk"           // Holding a whisk
  | "wooden-spoon"    // Wooden spoon tucked
  | "chef-neckerchief"// Classic neckerchief
  | "oven-mitt"       // Oven mitt on hoof
  | "herb-sprig"      // Fresh herb behind ear
  | "none";

const CHEF_ACCESSORIES: ChefAccessory[] = [
  "toque",
  "apron",
  "bandana",
  "whisk",
  "wooden-spoon",
  "chef-neckerchief",
  "oven-mitt",
  "herb-sprig",
];

const sizes = {
  sm: { container: "w-24 h-24" },
  md: { container: "w-40 h-40" },
  lg: { container: "w-56 h-56" },
  xl: { container: "w-72 h-72" },
  hero: { container: "w-80 h-80 md:w-[24rem] md:h-[24rem]" },
};

// Chef accessory components
function Toque() {
  return (
    <g>
      {/* Classic tall chef's hat */}
      <ellipse cx="72" cy="40" rx="16" ry="6" fill="hsl(0 0% 98%)" />
      <rect x="56" y="15" width="32" height="25" rx="2" fill="hsl(0 0% 100%)" />
      {/* Puffy top */}
      <circle cx="62" cy="15" r="8" fill="hsl(0 0% 98%)" />
      <circle cx="72" cy="12" r="9" fill="hsl(0 0% 100%)" />
      <circle cx="82" cy="15" r="8" fill="hsl(0 0% 98%)" />
      {/* Pleats */}
      <line x1="62" y1="20" x2="62" y2="38" stroke="hsl(0 0% 90%)" strokeWidth="0.5" />
      <line x1="72" y1="18" x2="72" y2="38" stroke="hsl(0 0% 90%)" strokeWidth="0.5" />
      <line x1="82" y1="20" x2="82" y2="38" stroke="hsl(0 0% 90%)" strokeWidth="0.5" />
    </g>
  );
}

function Apron() {
  return (
    <g>
      {/* White chef's apron over wool */}
      <path 
        d="M 60 65 L 55 110 L 105 110 L 100 65 Q 80 60 60 65 Z" 
        fill="hsl(0 0% 98%)" 
        opacity="0.9"
      />
      {/* Apron strings */}
      <path d="M 60 65 Q 50 68 45 75" stroke="hsl(0 0% 90%)" strokeWidth="2" fill="none" />
      <path d="M 100 65 Q 110 68 115 75" stroke="hsl(0 0% 90%)" strokeWidth="2" fill="none" />
      {/* Front pocket */}
      <rect x="70" y="85" width="20" height="15" rx="2" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="1" />
    </g>
  );
}

function Bandana() {
  return (
    <g>
      {/* Kitchen bandana */}
      <path 
        d="M 55 35 Q 72 30 90 35 L 88 42 Q 72 38 58 42 Z" 
        fill="hsl(0 70% 45%)"
      />
      {/* Knot at back */}
      <circle cx="55" cy="38" r="4" fill="hsl(0 70% 40%)" />
      <path d="M 52 40 L 45 50" stroke="hsl(0 70% 40%)" strokeWidth="3" />
      <path d="M 54 42 L 50 55" stroke="hsl(0 70% 45%)" strokeWidth="3" />
      {/* Pattern dots */}
      <circle cx="65" cy="36" r="1" fill="hsl(0 0% 100%)" opacity="0.6" />
      <circle cx="75" cy="35" r="1" fill="hsl(0 0% 100%)" opacity="0.6" />
      <circle cx="85" cy="37" r="1" fill="hsl(0 0% 100%)" opacity="0.6" />
    </g>
  );
}

function Whisk() {
  return (
    <g>
      {/* Whisk held near front */}
      <rect x="115" y="70" width="4" height="25" rx="2" fill="hsl(30 30% 40%)" />
      {/* Wire loops */}
      <ellipse cx="117" cy="65" rx="6" ry="12" fill="none" stroke="hsl(0 0% 70%)" strokeWidth="1" />
      <ellipse cx="117" cy="65" rx="4" ry="10" fill="none" stroke="hsl(0 0% 75%)" strokeWidth="1" />
      <ellipse cx="117" cy="65" rx="2" ry="8" fill="none" stroke="hsl(0 0% 70%)" strokeWidth="1" />
    </g>
  );
}

function WoodenSpoon() {
  return (
    <g>
      {/* Wooden spoon tucked */}
      <ellipse cx="48" cy="60" rx="8" ry="5" fill="hsl(30 50% 45%)" transform="rotate(-30 48 60)" />
      <rect x="50" y="62" width="5" height="35" rx="2" fill="hsl(30 40% 40%)" transform="rotate(15 52 80)" />
    </g>
  );
}

function ChefNeckerchief() {
  return (
    <g>
      {/* Classic chef's neckerchief */}
      <path 
        d="M 70 58 L 80 75 L 90 58 Q 80 55 70 58 Z" 
        fill="hsl(0 0% 100%)"
      />
      <path 
        d="M 70 58 Q 80 55 90 58" 
        stroke="hsl(0 0% 90%)" 
        strokeWidth="1" 
        fill="none"
      />
      {/* Knot */}
      <circle cx="80" cy="60" r="3" fill="hsl(0 0% 95%)" />
    </g>
  );
}

function OvenMitt() {
  return (
    <g>
      {/* Oven mitt on front hoof */}
      <ellipse cx="100" cy="118" rx="8" ry="10" fill="hsl(0 70% 50%)" />
      <ellipse cx="100" cy="118" rx="6" ry="8" fill="hsl(0 70% 55%)" />
      {/* Stripe pattern */}
      <line x1="94" y1="115" x2="106" y2="115" stroke="hsl(0 0% 100%)" strokeWidth="1.5" opacity="0.6" />
      <line x1="94" y1="120" x2="106" y2="120" stroke="hsl(0 0% 100%)" strokeWidth="1.5" opacity="0.6" />
    </g>
  );
}

function HerbSprig() {
  return (
    <g>
      {/* Fresh herb (rosemary/thyme) behind ear */}
      <path d="M 60 35 Q 55 28 50 20" stroke="hsl(120 40% 35%)" strokeWidth="1.5" fill="none" />
      {/* Leaves */}
      <ellipse cx="52" cy="25" rx="3" ry="1.5" fill="hsl(120 45% 40%)" transform="rotate(-30 52 25)" />
      <ellipse cx="54" cy="28" rx="3" ry="1.5" fill="hsl(120 45% 42%)" transform="rotate(20 54 28)" />
      <ellipse cx="51" cy="22" rx="2.5" ry="1.2" fill="hsl(120 45% 38%)" transform="rotate(-40 51 22)" />
      <ellipse cx="50" cy="20" rx="2" ry="1" fill="hsl(120 45% 40%)" transform="rotate(-20 50 20)" />
    </g>
  );
}

// Main sheep body facing RIGHT
function ChefSheepBody({ accessory }: { accessory: ChefAccessory }) {
  const showApron = accessory === "apron";
  
  return (
    <svg viewBox="0 0 160 140" className="w-full h-full">
      <defs>
        <filter id="chefWool" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        <filter id="chefShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <ellipse cx="80" cy="130" rx="40" ry="8" fill="hsl(0 0% 0%)" opacity="0.1" />
      
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
      <g filter="url(#chefWool)">
        <ellipse cx="80" cy="85" rx="35" ry="28" fill="hsl(40 30% 95%)" />
        <circle cx="50" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="110" cy="80" r="18" fill="hsl(40 25% 93%)" />
        <circle cx="60" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="100" cy="65" r="14" fill="hsl(40 20% 96%)" />
        <circle cx="80" cy="60" r="12" fill="hsl(40 15% 97%)" />
      </g>
      
      {/* Apron (if selected) - over body */}
      {showApron && <Apron />}
      
      {/* Head - facing RIGHT */}
      <ellipse cx="85" cy="50" rx="18" ry="16" fill="hsl(30 15% 30%)" filter="url(#chefShadow)" />
      
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
      
      {/* Eyes - confident chef look */}
      <ellipse cx="80" cy="46" rx="5" ry="6" fill="hsl(0 0% 98%)" />
      <circle cx="83" cy="46" r="3" fill="hsl(30 30% 15%)" />
      <circle cx="84" cy="45" r="1" fill="white" />
      {/* Slightly raised eyebrow - confident */}
      <path d="M 74 40 Q 80 38, 86 41" stroke="hsl(30 10% 25%)" strokeWidth="1.5" fill="none" />
      
      {/* Content smile */}
      <path d="M 98 60 Q 103 63, 108 60" stroke="hsl(30 10% 22%)" strokeWidth="1.2" fill="none" />
      
      {/* Accessory rendering */}
      {accessory === "toque" && <Toque />}
      {accessory === "bandana" && <Bandana />}
      {accessory === "whisk" && <Whisk />}
      {accessory === "wooden-spoon" && <WoodenSpoon />}
      {accessory === "chef-neckerchief" && <ChefNeckerchief />}
      {accessory === "oven-mitt" && <OvenMitt />}
      {accessory === "herb-sprig" && <HerbSprig />}
    </svg>
  );
}

export function BubblesChef({
  size = "lg",
  className,
  animated = true,
  accessory = "random",
}: BubblesChefProps) {
  const { container } = sizes[size];
  
  const selectedAccessory = useMemo(() => {
    if (accessory === "random") {
      const randomIndex = Math.floor(Math.random() * CHEF_ACCESSORIES.length);
      return CHEF_ACCESSORIES[randomIndex];
    }
    return accessory;
  }, [accessory]);

  const SheepSVG = <ChefSheepBody accessory={selectedAccessory} />;

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
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SheepSVG}
    </motion.div>
  );
}

export type { ChefAccessory };
export { CHEF_ACCESSORIES };
