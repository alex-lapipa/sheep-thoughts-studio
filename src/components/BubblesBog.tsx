import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * BUBBLES — VISUAL DESIGN SYSTEM (PERSONALITY-TO-FORM ALIGNMENT)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CALIBRATION PRINCIPLE:
 * "Bubbles must always look like a sheep who has absorbed human culture 
 * without ever understanding it, and who appears modern, witty, and 
 * authoritative entirely by mistake."
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * VISUAL RULES:
 * - Confidence without competence — certain, grounded, composed
 * - Never clever, sly, or knowingly ironic
 * - The wit is read by the observer, not expressed by the character
 * - Comedy emerges from contradiction: bog + clubwear, authority + emptiness
 * - Sarcasm is accidental, never self-aware
 * 
 * ANTI-COMEDY SAFEGUARDS:
 * - No slapstick, exaggerated facial distortion
 * - No cartoon motion language, emoji energy
 * - No "mascot smiles", winks, mugging
 * - If it feels like a joke/punchline/meme → reject
 * 
 * POSE & PRESENCE:
 * - Static, grounded, observational
 * - The world moves; Bubbles does not
 * - Standing, waiting, looking, existing
 * - Implies "I am correct" even when everything suggests otherwise
 * 
 * STYLING HIERARCHY:
 * 1. Sheep first
 * 2. Bog second  
 * 3. Human-learned styling last (sits ON TOP, never instead of)
 * 
 * UNINTENTIONAL INTELLIGENCE:
 * - "Certain because it knows a lot" NOT "clever because it understands"
 * - Accumulation without filtering, knowledge without synthesis
 * - Like someone who has read everything but understood nothing
 */

interface BubblesBogProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
  posture?: "four-legged" | "seated" | "grazing" | "leaning";
  accessory?: "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "none";
  weathered?: boolean;
  // Expression must convey certainty, not cleverness
  expression?: "neutral" | "distant" | "certain" | "waiting";
}

const sizes = {
  sm: { container: "w-24 h-24", viewBox: "0 0 160 160" },
  md: { container: "w-40 h-40", viewBox: "0 0 160 160" },
  lg: { container: "w-56 h-56", viewBox: "0 0 160 160" },
  xl: { container: "w-72 h-72", viewBox: "0 0 160 160" },
  hero: { container: "w-80 h-80 md:w-[28rem] md:h-[28rem]", viewBox: "0 0 160 160" },
};

// Expression system: certainty without cleverness
// No smug, no knowing, no ironic — just unshakeable conviction
const expressions = {
  neutral: { eyeOffset: 0, lidDrop: 0.05, gazeDirection: 0 },
  distant: { eyeOffset: 1, lidDrop: 0.12, gazeDirection: 2 },
  certain: { eyeOffset: 0, lidDrop: 0.08, gazeDirection: 0 },
  waiting: { eyeOffset: 0.5, lidDrop: 0.15, gazeDirection: 1 },
};

export function BubblesBog({
  size = "lg",
  className,
  animated = false, // Default OFF — static presence preferred
  posture = "four-legged",
  accessory = "none",
  weathered = true,
  expression = "certain",
}: BubblesBogProps) {
  const { container } = sizes[size];
  const expr = expressions[expression];

  const getSheepSVG = () => {
    switch (posture) {
      case "four-legged":
        return <FourLeggedSheep expr={expr} accessory={accessory} weathered={weathered} />;
      case "grazing":
        return <GrazingSheep expr={expr} accessory={accessory} weathered={weathered} />;
      case "leaning":
        return <LeaningSheep expr={expr} accessory={accessory} weathered={weathered} />;
      case "seated":
        return <SeatedSheep expr={expr} accessory={accessory} weathered={weathered} />;
      default:
        return <FourLeggedSheep expr={expr} accessory={accessory} weathered={weathered} />;
    }
  };
  
  const SheepSVG = getSheepSVG();

  // Static presence is the default — the world moves, Bubbles does not
  // Minimal animation only: subtle breathing, never performative
  if (!animated) {
    return <div className={cn(container, "select-none", className)}>{SheepSVG}</div>;
  }

  // Very subtle "existing" animation — not bouncy, not playful
  // Just the imperceptible shift of a creature that is certain it is correct
  return (
    <motion.div
      className={cn(container, "select-none", className)}
      animate={{
        y: [0, -2, 0], // Barely perceptible
      }}
      transition={{
        duration: 6, // Slow, contemplative
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {SheepSVG}
    </motion.div>
  );
}

// ============================================================================
// FOUR-LEGGED ACCESSORY COMPONENTS - Defined before FourLeggedSheep to ensure availability
// ============================================================================

// Accessory components - mismatched, slightly wrong
function SunglassesFourLegged() {
  return (
    <g>
      {/* Aviator sunglasses - wrong for a bog, but Bubbles doesn't know */}
      <ellipse cx="30" cy="45" rx="8" ry="7" fill="hsl(0 0% 10%)" opacity="0.9" />
      <ellipse cx="18" cy="47" rx="7" ry="6" fill="hsl(0 0% 10%)" opacity="0.9" />
      {/* Bridge */}
      <path d="M 23 45 Q 24 44 25 45" stroke="hsl(45 50% 45%)" strokeWidth="1.5" fill="none" />
      {/* Temple */}
      <line x1="37" y1="44" x2="45" y2="40" stroke="hsl(45 50% 45%)" strokeWidth="1.5" />
      {/* Lens reflection */}
      <ellipse cx="28" cy="43" rx="2" ry="1.5" fill="hsl(200 60% 60%)" opacity="0.3" />
    </g>
  );
}

function FlatCapFourLegged() {
  return (
    <g>
      {/* Irish flat cap - contextually correct but styled */}
      <ellipse cx="32" cy="28" rx="16" ry="8" fill="hsl(28 35% 32%)" />
      <path d="M 18 30 Q 32 24 46 30" fill="hsl(28 40% 28%)" />
      {/* Brim */}
      <ellipse cx="22" cy="32" rx="10" ry="4" fill="hsl(28 35% 25%)" />
      {/* Texture detail */}
      <path d="M 24 27 L 40 27" stroke="hsl(28 30% 40%)" strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function BucketHatFourLegged() {
  return (
    <g>
      {/* Bucket hat - completely wrong for a bog */}
      <ellipse cx="32" cy="28" rx="18" ry="10" fill="hsl(0 0% 95%)" />
      <ellipse cx="32" cy="24" rx="12" ry="8" fill="hsl(0 0% 92%)" />
      {/* Brim shadow */}
      <ellipse cx="32" cy="30" rx="18" ry="3" fill="hsl(0 0% 85%)" />
    </g>
  );
}

function HeadphonesFourLegged() {
  return (
    <g>
      {/* Over-ear headphones - urban tech in rural Ireland */}
      {/* Headband */}
      <path d="M 12 42 Q 26 22 46 42" stroke="hsl(0 0% 20%)" strokeWidth="3" fill="none" />
      {/* Left ear cup */}
      <ellipse cx="14" cy="44" rx="6" ry="8" fill="hsl(0 0% 15%)" />
      <ellipse cx="14" cy="44" rx="4" ry="6" fill="hsl(0 0% 25%)" />
      {/* Right ear cup */}
      <ellipse cx="44" cy="44" rx="6" ry="8" fill="hsl(0 0% 15%)" />
      <ellipse cx="44" cy="44" rx="4" ry="6" fill="hsl(0 0% 25%)" />
      {/* Cushion highlight */}
      <ellipse cx="13" cy="42" rx="2" ry="3" fill="hsl(0 0% 35%)" opacity="0.5" />
    </g>
  );
}

function ScarfFourLegged() {
  return (
    <g>
      {/* Wrapped around neck */}
      <ellipse cx="30" cy="62" rx="14" ry="5" fill="hsl(350 70% 45%)" />
      <ellipse cx="30" cy="62" rx="12" ry="4" fill="hsl(350 65% 50%)" />
      {/* Hanging end */}
      <path d="M 20 64 Q 18 72 22 80" stroke="hsl(350 70% 45%)" strokeWidth="5" fill="none" />
      <path d="M 22 80 L 20 82 M 22 80 L 24 82 M 22 80 L 22 83" stroke="hsl(350 70% 45%)" strokeWidth="1.5" />
      {/* Pattern stripes */}
      <line x1="19" y1="60" x2="41" y2="60" stroke="hsl(45 80% 70%)" strokeWidth="1" />
      <line x1="18" y1="63" x2="42" y2="63" stroke="hsl(45 80% 70%)" strokeWidth="1" />
    </g>
  );
}

function BandanaFourLegged() {
  return (
    <g>
      {/* Main bandana wrapped around forehead */}
      <path d="M 14 38 Q 28 32 44 38" fill="hsl(210 80% 45%)" />
      <path d="M 14 38 Q 28 35 44 38 Q 28 42 14 38" fill="hsl(210 75% 50%)" />
      {/* Knot at back */}
      <circle cx="44" cy="40" r="3" fill="hsl(210 80% 40%)" />
      {/* Trailing ends */}
      <path d="M 46 38 Q 52 42 50 50" stroke="hsl(210 80% 45%)" strokeWidth="3" fill="none" />
      <path d="M 46 42 Q 54 44 52 52" stroke="hsl(210 80% 45%)" strokeWidth="2.5" fill="none" />
      {/* Paisley pattern suggestion */}
      <circle cx="24" cy="37" r="1.5" fill="hsl(0 0% 95%)" opacity="0.6" />
      <circle cx="34" cy="36" r="1" fill="hsl(0 0% 95%)" opacity="0.6" />
    </g>
  );
}

function FlowerCrownFourLegged() {
  return (
    <g>
      {/* Vine base */}
      <path d="M 12 36 Q 26 28 46 36" stroke="hsl(120 40% 35%)" strokeWidth="2" fill="none" />
      {/* Daisies */}
      <g transform="translate(18, 32)">
        <circle cx="0" cy="0" r="4" fill="hsl(0 0% 98%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(28, 28)">
        <circle cx="0" cy="0" r="5" fill="hsl(330 70% 75%)" />
        <circle cx="0" cy="0" r="2" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(38, 32)">
        <circle cx="0" cy="0" r="4" fill="hsl(280 60% 75%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
      {/* Small leaves */}
      <ellipse cx="23" cy="34" rx="2" ry="1" fill="hsl(120 50% 40%)" transform="rotate(-20, 23, 34)" />
      <ellipse cx="33" cy="33" rx="2" ry="1" fill="hsl(120 50% 40%)" transform="rotate(15, 33, 33)" />
    </g>
  );
}

// Four-legged posture - natural sheep in the bog
function FourLeggedSheep({
  expr, 
  accessory, 
  weathered 
}: { 
  expr: typeof expressions.neutral; 
  accessory: string; 
  weathered: boolean;
}) {
  return (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Bog-weathered wool gradient - rough, weather-affected */}
        <radialGradient id="bogWool" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(45 25% 88%)" />
          <stop offset="60%" stopColor="hsl(40 20% 82%)" />
          <stop offset="100%" stopColor="hsl(35 18% 75%)" />
        </radialGradient>
        
        {/* Muddy/damp wool patches */}
        <radialGradient id="dampWool" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="hsl(35 18% 75%)" />
          <stop offset="100%" stopColor="hsl(30 25% 55%)" />
        </radialGradient>
        
        {/* Face - weathered beige */}
        <radialGradient id="bogFace" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="hsl(38 30% 85%)" />
          <stop offset="100%" stopColor="hsl(32 25% 75%)" />
        </radialGradient>
        
        {/* Peat earth for legs */}
        <linearGradient id="peatLegs" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(28 35% 28%)" />
          <stop offset="100%" stopColor="hsl(25 40% 18%)" />
        </linearGradient>

        {/* Texture filter for rough wool */}
        <filter id="woolTexture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>

        {/* Subtle shadow */}
        <filter id="groundShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(28 40% 15%)" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="130" rx="50" ry="8" fill="hsl(28 40% 15% / 0.2)" />

      {/* BODY - Main wool mass */}
      <g filter="url(#groundShadow)">
        {/* Hindquarters */}
        <ellipse cx="105" cy="70" rx="32" ry="28" fill="url(#bogWool)" />
        
        {/* Main body */}
        <ellipse cx="75" cy="68" rx="38" ry="30" fill="url(#bogWool)" />
        
        {/* Shoulder area */}
        <ellipse cx="50" cy="65" rx="25" ry="22" fill="url(#bogWool)" />
        
        {/* Wool texture puffs - organic, not circular */}
        <ellipse cx="65" cy="48" rx="14" ry="10" fill="url(#bogWool)" />
        <ellipse cx="85" cy="45" rx="16" ry="11" fill="url(#bogWool)" />
        <ellipse cx="100" cy="50" rx="12" ry="9" fill="url(#bogWool)" />
        <ellipse cx="55" cy="55" rx="10" ry="8" fill="url(#bogWool)" />
        
        {/* Lower damp patches - weather affected */}
        {weathered && (
          <>
            <ellipse cx="70" cy="90" rx="20" ry="8" fill="url(#dampWool)" opacity="0.6" />
            <ellipse cx="100" cy="88" rx="15" ry="6" fill="url(#dampWool)" opacity="0.5" />
          </>
        )}
      </g>

      {/* LEGS - Sturdy, planted in bog */}
      <g>
        {/* Back legs */}
        <rect x="95" y="88" width="8" height="32" rx="3" fill="url(#peatLegs)" />
        <rect x="110" y="90" width="7" height="28" rx="3" fill="url(#peatLegs)" />
        
        {/* Front legs */}
        <rect x="42" y="85" width="8" height="35" rx="3" fill="url(#peatLegs)" />
        <rect x="55" y="86" width="7" height="32" rx="3" fill="url(#peatLegs)" />
        
        {/* Hooves - dark, muddy */}
        <ellipse cx="99" cy="122" rx="5" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="113.5" cy="120" rx="4.5" ry="3.5" fill="hsl(25 45% 12%)" />
        <ellipse cx="46" cy="122" rx="5" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="58.5" cy="120" rx="4.5" ry="3.5" fill="hsl(25 45% 12%)" />
        
        {/* Mud splatters on legs */}
        {weathered && (
          <>
            <circle cx="44" cy="110" r="2" fill="hsl(28 40% 35%)" opacity="0.6" />
            <circle cx="98" cy="108" r="1.5" fill="hsl(28 40% 35%)" opacity="0.5" />
            <circle cx="56" cy="105" r="1" fill="hsl(28 40% 35%)" opacity="0.4" />
          </>
        )}
      </g>

      {/* TAIL - Small wool tuft */}
      <ellipse cx="128" cy="65" rx="8" ry="6" fill="url(#bogWool)" />
      <ellipse cx="132" cy="62" rx="5" ry="4" fill="url(#bogWool)" />

      {/* HEAD - Elongated sheep head */}
      <g>
        {/* Neck wool */}
        <ellipse cx="35" cy="60" rx="16" ry="14" fill="url(#bogWool)" />
        
        {/* Head shape - natural sheep proportions */}
        <ellipse cx="28" cy="48" rx="18" ry="20" fill="url(#bogFace)" />
        
        {/* Muzzle - slightly elongated */}
        <ellipse cx="18" cy="55" rx="10" ry="8" fill="url(#bogFace)" />
        
        {/* Ears - horizontal, relaxed */}
        <ellipse cx="42" cy="38" rx="10" ry="5" fill="url(#bogFace)" transform="rotate(15 42 38)" />
        <ellipse cx="20" cy="32" rx="9" ry="4.5" fill="url(#bogFace)" transform="rotate(-25 20 32)" />
        
        {/* Inner ears */}
        <ellipse cx="42" cy="38" rx="6" ry="3" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(15 42 38)" />
        <ellipse cx="20" cy="32" rx="5" ry="2.5" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(-25 20 32)" />
        
        {/* Forehead wool tuft */}
        <ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#bogWool)" />
        <ellipse cx="38" cy="28" rx="6" ry="5" fill="url(#bogWool)" />
        
        {/* EYES - Calm, distant, horizontal pupils */}
        <g>
          {/* Eye whites - minimal */}
          <ellipse cx="30" cy={46 + expr.eyeOffset} rx="5" ry="5.5" fill="hsl(40 15% 25%)" />
          <ellipse cx="20" cy={48 + expr.eyeOffset} rx="4.5" ry="5" fill="hsl(40 15% 25%)" />
          
          {/* Horizontal rectangular pupils - sheep characteristic */}
          <rect x="27" y={44 + expr.eyeOffset} width="6" height="3" rx="1" fill="hsl(0 0% 8%)" />
          <rect x="17" y={46 + expr.eyeOffset} width="5" height="2.5" rx="1" fill="hsl(0 0% 8%)" />
          
          {/* Subtle highlights */}
          <circle cx="29" cy={43 + expr.eyeOffset} r="1" fill="white" opacity="0.4" />
          <circle cx="19" cy={45 + expr.eyeOffset} r="0.8" fill="white" opacity="0.4" />
          
          {/* Eyelid droop for expression */}
          {expr.lidDrop > 0 && (
            <>
              <ellipse cx="30" cy={43 + expr.eyeOffset} rx="5.5" ry={2 * expr.lidDrop + 1} fill="url(#bogFace)" />
              <ellipse cx="20" cy={45 + expr.eyeOffset} rx="5" ry={2 * expr.lidDrop + 0.8} fill="url(#bogFace)" />
            </>
          )}
        </g>
        
        {/* NOSE - Dark, leathery */}
        <ellipse cx="12" cy="56" rx="6" ry="4" fill="hsl(320 15% 35%)" />
        <ellipse cx="12" cy="55" rx="4.5" ry="2.5" fill="hsl(320 18% 42%)" />
        
        {/* Nostrils */}
        <ellipse cx="10" cy="56" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        <ellipse cx="14" cy="56" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        
        {/* Mouth - subtle, neutral */}
        <path 
          d="M 8 62 Q 12 64 16 62" 
          stroke="hsl(28 30% 40%)" 
          strokeWidth="1" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.4" 
        />
      </g>

      {/* ACCESSORIES */}
      {accessory === "sunglasses" && <SunglassesFourLegged />}
      {accessory === "cap" && <FlatCapFourLegged />}
      {accessory === "bucket-hat" && <BucketHatFourLegged />}
      {accessory === "headphones" && <HeadphonesFourLegged />}
      {accessory === "scarf" && <ScarfFourLegged />}
      {accessory === "bandana" && <BandanaFourLegged />}
      {accessory === "flower-crown" && <FlowerCrownFourLegged />}
    </svg>
  );
}

// Grazing posture - head lowered, natural four-legged feeding posture
// CRITICAL: Bubbles is a sheep and must NEVER stand on two legs
function GrazingSheep({
  expr, 
  accessory, 
  weathered 
}: { 
  expr: typeof expressions.neutral; 
  accessory: string; 
  weathered: boolean;
}) {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Bog-weathered wool gradient */}
        <radialGradient id="bogWoolGraze" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(45 25% 88%)" />
          <stop offset="60%" stopColor="hsl(40 20% 82%)" />
          <stop offset="100%" stopColor="hsl(35 18% 75%)" />
        </radialGradient>
        
        {/* Damp lower wool */}
        <radialGradient id="dampWoolGraze" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="hsl(35 18% 75%)" />
          <stop offset="100%" stopColor="hsl(30 25% 55%)" />
        </radialGradient>
        
        {/* Face gradient */}
        <radialGradient id="bogFaceGraze" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="hsl(38 30% 85%)" />
          <stop offset="100%" stopColor="hsl(32 25% 75%)" />
        </radialGradient>
        
        {/* Peat legs */}
        <linearGradient id="peatLegsGraze" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(28 35% 28%)" />
          <stop offset="100%" stopColor="hsl(25 40% 18%)" />
        </linearGradient>

        <filter id="groundShadowGraze" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(28 40% 15%)" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="80" cy="112" rx="55" ry="6" fill="hsl(28 40% 15% / 0.2)" />

      {/* BODY - Four-legged wool mass, slightly lower for grazing */}
      <g filter="url(#groundShadowGraze)">
        {/* Hindquarters */}
        <ellipse cx="115" cy="55" rx="30" ry="26" fill="url(#bogWoolGraze)" />
        
        {/* Main body */}
        <ellipse cx="80" cy="52" rx="40" ry="30" fill="url(#bogWoolGraze)" />
        
        {/* Shoulder area */}
        <ellipse cx="50" cy="50" rx="26" ry="24" fill="url(#bogWoolGraze)" />
        
        {/* Wool texture puffs */}
        <ellipse cx="70" cy="32" rx="14" ry="10" fill="url(#bogWoolGraze)" />
        <ellipse cx="95" cy="30" rx="16" ry="11" fill="url(#bogWoolGraze)" />
        <ellipse cx="110" cy="35" rx="12" ry="9" fill="url(#bogWoolGraze)" />
        <ellipse cx="55" cy="38" rx="10" ry="8" fill="url(#bogWoolGraze)" />
        
        {/* Lower damp patches */}
        {weathered && (
          <>
            <ellipse cx="75" cy="75" rx="20" ry="8" fill="url(#dampWoolGraze)" opacity="0.6" />
            <ellipse cx="110" cy="72" rx="15" ry="6" fill="url(#dampWoolGraze)" opacity="0.5" />
          </>
        )}
      </g>

      {/* FOUR LEGS - All grounded */}
      <g>
        {/* Back legs */}
        <rect x="105" y="70" width="8" height="32" rx="3" fill="url(#peatLegsGraze)" />
        <rect x="120" y="72" width="7" height="28" rx="3" fill="url(#peatLegsGraze)" />
        
        {/* Front legs - slightly forward for grazing stance */}
        <rect x="38" y="68" width="8" height="35" rx="3" fill="url(#peatLegsGraze)" />
        <rect x="52" y="70" width="7" height="32" rx="3" fill="url(#peatLegsGraze)" />
        
        {/* Hooves */}
        <ellipse cx="109" cy="104" rx="5" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="123.5" cy="102" rx="4.5" ry="3.5" fill="hsl(25 45% 12%)" />
        <ellipse cx="42" cy="105" rx="5" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="55.5" cy="104" rx="4.5" ry="3.5" fill="hsl(25 45% 12%)" />
        
        {/* Mud splatters */}
        {weathered && (
          <>
            <circle cx="40" cy="92" r="2" fill="hsl(28 40% 35%)" opacity="0.6" />
            <circle cx="108" cy="90" r="1.5" fill="hsl(28 40% 35%)" opacity="0.5" />
            <circle cx="54" cy="88" r="1" fill="hsl(28 40% 35%)" opacity="0.4" />
          </>
        )}
      </g>

      {/* TAIL */}
      <ellipse cx="138" cy="50" rx="8" ry="6" fill="url(#bogWoolGraze)" />
      <ellipse cx="142" cy="47" rx="5" ry="4" fill="url(#bogWoolGraze)" />

      {/* HEAD - Lowered for grazing */}
      <g>
        {/* Neck wool - angled down */}
        <ellipse cx="32" cy="55" rx="16" ry="14" fill="url(#bogWoolGraze)" />
        
        {/* Head shape - tilted down toward ground */}
        <ellipse cx="22" cy="68" rx="18" ry="20" fill="url(#bogFaceGraze)" transform="rotate(25 22 68)" />
        
        {/* Muzzle - pointing down */}
        <ellipse cx="12" cy="82" rx="10" ry="8" fill="url(#bogFaceGraze)" transform="rotate(15 12 82)" />
        
        {/* Ears - relaxed */}
        <ellipse cx="38" cy="52" rx="10" ry="5" fill="url(#bogFaceGraze)" transform="rotate(10 38 52)" />
        <ellipse cx="18" cy="48" rx="9" ry="4.5" fill="url(#bogFaceGraze)" transform="rotate(-20 18 48)" />
        
        {/* Inner ears */}
        <ellipse cx="38" cy="52" rx="6" ry="3" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(10 38 52)" />
        <ellipse cx="18" cy="48" rx="5" ry="2.5" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(-20 18 48)" />
        
        {/* Forehead wool */}
        <ellipse cx="28" cy="50" rx="10" ry="8" fill="url(#bogWoolGraze)" />
        <ellipse cx="34" cy="46" rx="6" ry="5" fill="url(#bogWoolGraze)" />
        
        {/* EYES - Looking down, calm */}
        <g>
          <ellipse cx="26" cy={62 + expr.eyeOffset} rx="5" ry="5.5" fill="hsl(40 15% 25%)" />
          <ellipse cx="16" cy={66 + expr.eyeOffset} rx="4.5" ry="5" fill="hsl(40 15% 25%)" />
          
          {/* Horizontal pupils */}
          <rect x="23" y={60 + expr.eyeOffset} width="6" height="3" rx="1" fill="hsl(0 0% 8%)" />
          <rect x="13" y={64 + expr.eyeOffset} width="5" height="2.5" rx="1" fill="hsl(0 0% 8%)" />
          
          {/* Highlights */}
          <circle cx="25" cy={59 + expr.eyeOffset} r="1" fill="white" opacity="0.4" />
          <circle cx="15" cy={63 + expr.eyeOffset} r="0.8" fill="white" opacity="0.4" />
          
          {/* Eyelid droop */}
          {expr.lidDrop > 0 && (
            <>
              <ellipse cx="26" cy={59 + expr.eyeOffset} rx="5.5" ry={2 * expr.lidDrop + 1} fill="url(#bogFaceGraze)" />
              <ellipse cx="16" cy={63 + expr.eyeOffset} rx="5" ry={2 * expr.lidDrop + 0.8} fill="url(#bogFaceGraze)" />
            </>
          )}
        </g>
        
        {/* NOSE - Lower position */}
        <ellipse cx="8" cy="86" rx="6" ry="4" fill="hsl(320 15% 35%)" />
        <ellipse cx="8" cy="85" rx="4.5" ry="2.5" fill="hsl(320 18% 42%)" />
        
        {/* Nostrils */}
        <ellipse cx="6" cy="86" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        <ellipse cx="10" cy="86" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        
        {/* Mouth */}
        <path 
          d="M 4 92 Q 8 94 12 92" 
          stroke="hsl(28 30% 40%)" 
          strokeWidth="1" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.4" 
        />
      </g>

      {/* ACCESSORIES - using four-legged versions */}
      {accessory === "sunglasses" && <SunglassesFourLegged />}
      {accessory === "cap" && <FlatCapFourLegged />}
      {accessory === "bucket-hat" && <BucketHatFourLegged />}
      {accessory === "headphones" && <HeadphonesFourLegged />}
      {accessory === "scarf" && <ScarfFourLegged />}
      {accessory === "bandana" && <BandanaFourLegged />}
      {accessory === "flower-crown" && <FlowerCrownFourLegged />}
    </svg>
  );
}

// NOTE: HalfUprightSheep and two-legged components removed
// Bubbles is a sheep and must NEVER stand on two legs — all postures are quadrupedal



// Leaning posture - weight shifted to one side, observational stance
// "Casually leaning as if waiting for something to be wrong about"
function LeaningSheep({
  expr, 
  accessory, 
  weathered 
}: { 
  expr: typeof expressions.neutral; 
  accessory: string; 
  weathered: boolean;
}) {
  return (
    <svg viewBox="0 0 170 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="bogWoolLean" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(45 25% 88%)" />
          <stop offset="60%" stopColor="hsl(40 20% 82%)" />
          <stop offset="100%" stopColor="hsl(35 18% 75%)" />
        </radialGradient>
        <radialGradient id="dampWoolLean" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="hsl(35 18% 75%)" />
          <stop offset="100%" stopColor="hsl(30 25% 55%)" />
        </radialGradient>
        <radialGradient id="bogFaceLean" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="hsl(38 30% 85%)" />
          <stop offset="100%" stopColor="hsl(32 25% 75%)" />
        </radialGradient>
        <linearGradient id="peatLegsLean" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(28 35% 28%)" />
          <stop offset="100%" stopColor="hsl(25 40% 18%)" />
        </linearGradient>
        <filter id="groundShadowLean" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(28 40% 15%)" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ground shadow - asymmetric for leaning weight */}
      <ellipse cx="90" cy="130" rx="55" ry="8" fill="hsl(28 40% 15% / 0.2)" />

      {/* BODY - Shifted weight to the right */}
      <g filter="url(#groundShadowLean)" transform="rotate(8 85 70)">
        <ellipse cx="115" cy="68" rx="30" ry="26" fill="url(#bogWoolLean)" />
        <ellipse cx="85" cy="66" rx="36" ry="28" fill="url(#bogWoolLean)" />
        <ellipse cx="58" cy="64" rx="24" ry="21" fill="url(#bogWoolLean)" />
        <ellipse cx="72" cy="48" rx="13" ry="10" fill="url(#bogWoolLean)" />
        <ellipse cx="92" cy="45" rx="15" ry="11" fill="url(#bogWoolLean)" />
        <ellipse cx="108" cy="50" rx="11" ry="9" fill="url(#bogWoolLean)" />
        {weathered && (
          <>
            <ellipse cx="80" cy="88" rx="18" ry="7" fill="url(#dampWoolLean)" opacity="0.5" />
            <ellipse cx="110" cy="86" rx="14" ry="6" fill="url(#dampWoolLean)" opacity="0.4" />
          </>
        )}
      </g>

      {/* LEGS - Weight distributed unevenly */}
      <g>
        {/* Back legs - one relaxed, one bearing weight */}
        <rect x="115" y="85" width="8" height="38" rx="3" fill="url(#peatLegsLean)" transform="rotate(5 119 85)" />
        <rect x="130" y="88" width="7" height="32" rx="3" fill="url(#peatLegsLean)" transform="rotate(12 133 88)" />
        
        {/* Front legs - crossed/shifted */}
        <rect x="48" y="82" width="8" height="40" rx="3" fill="url(#peatLegsLean)" />
        <rect x="62" y="84" width="7" height="36" rx="3" fill="url(#peatLegsLean)" transform="rotate(-5 65 84)" />
        
        {/* Hooves */}
        <ellipse cx="52" cy="124" rx="5" ry="3" fill="hsl(25 45% 12%)" />
        <ellipse cx="64" cy="121" rx="5" ry="3" fill="hsl(25 45% 12%)" />
        <ellipse cx="122" cy="125" rx="5" ry="3" fill="hsl(25 45% 12%)" />
        <ellipse cx="140" cy="122" rx="5" ry="3" fill="hsl(25 45% 12%)" />
        
        {weathered && (
          <>
            <circle cx="50" cy="110" r="2" fill="hsl(28 40% 35%)" opacity="0.5" />
            <circle cx="124" cy="112" r="1.5" fill="hsl(28 40% 35%)" opacity="0.4" />
          </>
        )}
      </g>

      {/* HEAD - Tilted with body lean */}
      <g transform="translate(-5, 2) rotate(5 40 45)">
        <ellipse cx="42" cy="52" rx="12" ry="10" fill="url(#bogWoolLean)" />
        <ellipse cx="36" cy="48" rx="14" ry="13" fill="url(#bogFaceLean)" />
        
        {/* EARS - Relaxed */}
        <ellipse cx="24" cy="40" rx="7" ry="4" fill="url(#bogFaceLean)" transform="rotate(-25 24 40)" />
        <ellipse cx="48" cy="38" rx="7" ry="4" fill="url(#bogFaceLean)" transform="rotate(10 48 38)" />
        
        {/* EYES */}
        <g transform={`translate(${expr.gazeDirection * 0.5}, 0)`}>
          <ellipse cx="28" cy="48" rx="4" ry="4.5" fill="hsl(0 0% 98%)" />
          <ellipse cx="44" cy="47" rx="4" ry="4.5" fill="hsl(0 0% 98%)" />
          <ellipse cx="28" cy={48 + expr.lidDrop * 8} rx="4" ry={4.5 - expr.lidDrop * 4} fill="url(#bogFaceLean)" />
          <ellipse cx="44" cy={47 + expr.lidDrop * 8} rx="4" ry={4.5 - expr.lidDrop * 4} fill="url(#bogFaceLean)" />
          <circle cx={28 + expr.eyeOffset} cy="48" r="2.2" fill="hsl(28 60% 18%)" />
          <circle cx={44 + expr.eyeOffset} cy="47" r="2.2" fill="hsl(28 60% 18%)" />
          <circle cx={27.3 + expr.eyeOffset} cy="47.3" r="0.7" fill="hsl(0 0% 100%)" />
          <circle cx={43.3 + expr.eyeOffset} cy="46.3" r="0.7" fill="hsl(0 0% 100%)" />
        </g>
        
        {/* NOSE */}
        <ellipse cx="36" cy="56" rx="4.5" ry="2.5" fill="hsl(350 25% 30%)" />
        <ellipse cx="35.5" cy="55.5" rx="1.5" ry="1" fill="hsl(350 20% 22%)" />
      </g>

      {/* ACCESSORIES */}
      {accessory === "sunglasses" && <SunglassesLeaning />}
      {accessory === "cap" && <FlatCapLeaning />}
      {accessory === "bucket-hat" && <BucketHatLeaning />}
      {accessory === "headphones" && <HeadphonesLeaning />}
      {accessory === "scarf" && <ScarfLeaning />}
      {accessory === "bandana" && <BandanaLeaning />}
      {accessory === "flower-crown" && <FlowerCrownLeaning />}
    </svg>
  );
}

// Seated posture - sheep resting in the bog, back legs tucked, front legs forward
// The classic "I'm comfortable here and not moving" sheep pose
function SeatedSheep({ 
  expr, 
  accessory, 
  weathered 
}: { 
  expr: typeof expressions.neutral; 
  accessory: string; 
  weathered: boolean;
}) {
  return (
    <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="bogWoolSeated" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(45 25% 88%)" />
          <stop offset="60%" stopColor="hsl(40 20% 82%)" />
          <stop offset="100%" stopColor="hsl(35 18% 75%)" />
        </radialGradient>
        <radialGradient id="dampWoolSeated" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="hsl(35 18% 75%)" />
          <stop offset="100%" stopColor="hsl(30 25% 55%)" />
        </radialGradient>
        <radialGradient id="bogFaceSeated" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="hsl(38 30% 85%)" />
          <stop offset="100%" stopColor="hsl(32 25% 75%)" />
        </radialGradient>
        <linearGradient id="peatLegsSeated" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(28 35% 28%)" />
          <stop offset="100%" stopColor="hsl(25 40% 18%)" />
        </linearGradient>
        <filter id="groundShadowSeated" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="hsl(28 40% 15%)" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground shadow - wider for seated position */}
      <ellipse cx="80" cy="118" rx="50" ry="10" fill="hsl(28 40% 15% / 0.25)" />

      {/* BODY - Lower, wider, resting on ground */}
      <g filter="url(#groundShadowSeated)">
        {/* Main wool body - compressed/settled shape */}
        <ellipse cx="80" cy="78" rx="42" ry="28" fill="url(#bogWoolSeated)" />
        {/* Back hump - relaxed */}
        <ellipse cx="95" cy="58" rx="22" ry="16" fill="url(#bogWoolSeated)" />
        {/* Front chest */}
        <ellipse cx="55" cy="72" rx="20" ry="22" fill="url(#bogWoolSeated)" />
        {/* Wool texture puffs */}
        <ellipse cx="70" cy="52" rx="12" ry="9" fill="url(#bogWoolSeated)" />
        <ellipse cx="88" cy="48" rx="10" ry="8" fill="url(#bogWoolSeated)" />
        <ellipse cx="105" cy="55" rx="8" ry="7" fill="url(#bogWoolSeated)" />
        
        {/* Weathered/damp patches from sitting in bog */}
        {weathered && (
          <>
            <ellipse cx="80" cy="100" rx="30" ry="10" fill="url(#dampWoolSeated)" opacity="0.5" />
            <ellipse cx="100" cy="95" rx="15" ry="8" fill="url(#dampWoolSeated)" opacity="0.4" />
            <ellipse cx="60" cy="92" rx="12" ry="6" fill="url(#dampWoolSeated)" opacity="0.35" />
          </>
        )}
      </g>

      {/* LEGS - Back legs tucked under body, front legs extended forward */}
      <g>
        {/* Back legs - tucked/folded under body, only hooves visible */}
        <ellipse cx="105" cy="105" rx="8" ry="4" fill="url(#peatLegsSeated)" />
        <ellipse cx="118" cy="104" rx="7" ry="4" fill="url(#peatLegsSeated)" />
        {/* Back hooves peeking out */}
        <ellipse cx="108" cy="108" rx="5" ry="2.5" fill="hsl(25 45% 12%)" />
        <ellipse cx="120" cy="107" rx="4.5" ry="2.5" fill="hsl(25 45% 12%)" />
        
        {/* Front legs - extended forward, resting on ground */}
        <rect x="38" y="85" width="9" height="26" rx="4" fill="url(#peatLegsSeated)" transform="rotate(-15 42 85)" />
        <rect x="52" y="87" width="8" height="24" rx="4" fill="url(#peatLegsSeated)" transform="rotate(-10 56 87)" />
        
        {/* Front hooves - flat on ground */}
        <ellipse cx="32" cy="112" rx="6" ry="3" fill="hsl(25 45% 12%)" />
        <ellipse cx="48" cy="113" rx="5.5" ry="3" fill="hsl(25 45% 12%)" />
        
        {/* Mud splashes from sitting */}
        {weathered && (
          <>
            <circle cx="35" cy="105" r="2" fill="hsl(28 40% 35%)" opacity="0.5" />
            <circle cx="50" cy="106" r="1.5" fill="hsl(28 40% 35%)" opacity="0.45" />
            <circle cx="110" cy="100" r="1.8" fill="hsl(28 40% 35%)" opacity="0.4" />
          </>
        )}
      </g>

      {/* HEAD - Relaxed, slightly lower position */}
      <g>
        {/* Neck wool - connects head to body */}
        <ellipse cx="42" cy="60" rx="14" ry="12" fill="url(#bogWoolSeated)" />
        
        {/* Face */}
        <ellipse cx="32" cy="52" rx="15" ry="14" fill="url(#bogFaceSeated)" />
        
        {/* EARS - Relaxed, slightly drooped */}
        <ellipse cx="18" cy="42" rx="8" ry="4.5" fill="url(#bogFaceSeated)" transform="rotate(-30 18 42)" />
        <ellipse cx="46" cy="40" rx="8" ry="4.5" fill="url(#bogFaceSeated)" transform="rotate(15 46 40)" />
        <ellipse cx="19" cy="43" rx="4" ry="2" fill="hsl(350 20% 75%)" opacity="0.4" transform="rotate(-30 19 43)" />
        <ellipse cx="45" cy="41" rx="4" ry="2" fill="hsl(350 20% 75%)" opacity="0.4" transform="rotate(15 45 41)" />
        
        {/* EYES - Calm, certain, possibly half-closed contentment */}
        <g transform={`translate(${expr.gazeDirection}, 0)`}>
          {/* Eye whites */}
          <ellipse cx="24" cy="50" rx="4.5" ry="5" fill="hsl(0 0% 98%)" />
          <ellipse cx="40" cy="49" rx="4.5" ry="5" fill="hsl(0 0% 98%)" />
          {/* Eyelids */}
          <ellipse cx="24" cy={50 + expr.lidDrop * 10} rx="4.5" ry={5 - expr.lidDrop * 5} fill="url(#bogFaceSeated)" />
          <ellipse cx="40" cy={49 + expr.lidDrop * 10} rx="4.5" ry={5 - expr.lidDrop * 5} fill="url(#bogFaceSeated)" />
          {/* Pupils */}
          <circle cx={24 + expr.eyeOffset} cy="50" r="2.5" fill="hsl(28 60% 18%)" />
          <circle cx={40 + expr.eyeOffset} cy="49" r="2.5" fill="hsl(28 60% 18%)" />
          {/* Highlights */}
          <circle cx={23.2 + expr.eyeOffset} cy="49.2" r="0.8" fill="hsl(0 0% 100%)" />
          <circle cx={39.2 + expr.eyeOffset} cy="48.2" r="0.8" fill="hsl(0 0% 100%)" />
        </g>
        
        {/* NOSE */}
        <ellipse cx="32" cy="60" rx="5" ry="3" fill="hsl(350 25% 30%)" />
        <ellipse cx="31.3" cy="59.3" rx="1.8" ry="1" fill="hsl(350 20% 22%)" />
        
        {/* Nostrils */}
        <ellipse cx="30" cy="60.5" rx="1" ry="0.6" fill="hsl(350 25% 22%)" />
        <ellipse cx="34" cy="60.5" rx="1" ry="0.6" fill="hsl(350 25% 22%)" />
      </g>

      {/* ACCESSORIES */}
      {accessory === "sunglasses" && <SunglassesSeated />}
      {accessory === "cap" && <FlatCapSeated />}
      {accessory === "bucket-hat" && <BucketHatSeated />}
      {accessory === "headphones" && <HeadphonesSeated />}
      {accessory === "scarf" && <ScarfSeated />}
      {accessory === "bandana" && <BandanaSeated />}
      {accessory === "flower-crown" && <FlowerCrownSeated />}
    </svg>
  );
}

// Seated accessories - positioned for the relaxed head position
function SunglassesSeated() {
  return (
    <g>
      <ellipse cx="26" cy="48" rx="7" ry="6" fill="hsl(0 0% 10%)" opacity="0.9" />
      <ellipse cx="38" cy="47" rx="7" ry="6" fill="hsl(0 0% 10%)" opacity="0.9" />
      <path d="M 32 47 Q 33 46 34 47" stroke="hsl(45 50% 45%)" strokeWidth="1.2" fill="none" />
      <line x1="19" y1="47" x2="12" y2="44" stroke="hsl(45 50% 45%)" strokeWidth="1.2" />
      <line x1="45" y1="46" x2="52" y2="43" stroke="hsl(45 50% 45%)" strokeWidth="1.2" />
      <ellipse cx="24" cy="46" rx="2" ry="1.5" fill="hsl(200 60% 60%)" opacity="0.3" />
    </g>
  );
}

function FlatCapSeated() {
  return (
    <g>
      <ellipse cx="32" cy="38" rx="16" ry="8" fill="hsl(28 35% 32%)" />
      <path d="M 18 40 Q 32 34 46 40" fill="hsl(28 40% 28%)" />
      <ellipse cx="20" cy="42" rx="10" ry="4" fill="hsl(28 35% 25%)" />
      <path d="M 22 37 L 42 37" stroke="hsl(28 30% 40%)" strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function BucketHatSeated() {
  return (
    <g>
      <ellipse cx="32" cy="38" rx="18" ry="10" fill="hsl(0 0% 95%)" />
      <ellipse cx="32" cy="34" rx="12" ry="8" fill="hsl(0 0% 92%)" />
      <ellipse cx="32" cy="40" rx="18" ry="3" fill="hsl(0 0% 85%)" />
    </g>
  );
}

function HeadphonesSeated() {
  return (
    <g>
      <path d="M 12 48 Q 32 28 52 48" stroke="hsl(0 0% 20%)" strokeWidth="3" fill="none" />
      <ellipse cx="14" cy="50" rx="5" ry="7" fill="hsl(0 0% 15%)" />
      <ellipse cx="14" cy="50" rx="3.5" ry="5" fill="hsl(0 0% 25%)" />
      <ellipse cx="50" cy="50" rx="5" ry="7" fill="hsl(0 0% 15%)" />
      <ellipse cx="50" cy="50" rx="3.5" ry="5" fill="hsl(0 0% 25%)" />
    </g>
  );
}

function ScarfSeated() {
  return (
    <g>
      <ellipse cx="38" cy="68" rx="14" ry="5" fill="hsl(350 70% 45%)" />
      <ellipse cx="38" cy="68" rx="12" ry="4" fill="hsl(350 65% 50%)" />
      <path d="M 28 70 Q 24 80 30 92" stroke="hsl(350 70% 45%)" strokeWidth="5" fill="none" />
      <line x1="26" y1="66" x2="50" y2="66" stroke="hsl(45 80% 70%)" strokeWidth="1" />
      <line x1="25" y1="69" x2="51" y2="69" stroke="hsl(45 80% 70%)" strokeWidth="1" />
    </g>
  );
}

function BandanaSeated() {
  return (
    <g>
      <path d="M 14 42 Q 32 34 50 42" fill="hsl(210 80% 45%)" />
      <path d="M 14 42 Q 32 38 50 42 Q 32 46 14 42" fill="hsl(210 75% 50%)" />
      <circle cx="52" cy="44" r="2.5" fill="hsl(210 80% 40%)" />
      <path d="M 54 42 Q 60 46 58 54" stroke="hsl(210 80% 45%)" strokeWidth="2.5" fill="none" />
      <circle cx="26" cy="40" r="1.5" fill="hsl(0 0% 95%)" opacity="0.6" />
      <circle cx="38" cy="38" r="1" fill="hsl(0 0% 95%)" opacity="0.6" />
    </g>
  );
}

function FlowerCrownSeated() {
  return (
    <g>
      <path d="M 12 40 Q 32 30 52 40" stroke="hsl(120 40% 35%)" strokeWidth="2" fill="none" />
      <g transform="translate(20, 36)">
        <circle cx="0" cy="0" r="4" fill="hsl(0 0% 98%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(32, 32)">
        <circle cx="0" cy="0" r="5" fill="hsl(330 70% 75%)" />
        <circle cx="0" cy="0" r="2" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(44, 36)">
        <circle cx="0" cy="0" r="4" fill="hsl(280 60% 75%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(26, 34)">
        <circle cx="0" cy="0" r="3" fill="hsl(45 80% 70%)" />
        <circle cx="0" cy="0" r="1" fill="hsl(35 90% 55%)" />
      </g>
      <g transform="translate(38, 33)">
        <circle cx="0" cy="0" r="3.5" fill="hsl(180 50% 70%)" />
        <circle cx="0" cy="0" r="1.2" fill="hsl(45 90% 55%)" />
      </g>
    </g>
  );
}

// NOTE: Four-legged accessory components are defined near the top of the file (before FourLeggedSheep)
// TwoLegged and HalfUpright accessory components have been removed
// Bubbles is a sheep and must NEVER stand on two legs — all accessories use quadrupedal posture variants


// Accessory components for Leaning posture
function SunglassesLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <ellipse cx="28" cy="46" rx="7" ry="6" fill="hsl(0 0% 10%)" opacity="0.9" />
      <ellipse cx="44" cy="45" rx="7" ry="6" fill="hsl(0 0% 10%)" opacity="0.9" />
      <path d="M 34 45 Q 36 44 38 45" stroke="hsl(45 50% 45%)" strokeWidth="1.5" fill="none" />
      <line x1="21" y1="45" x2="13" y2="41" stroke="hsl(45 50% 45%)" strokeWidth="1.5" />
    </g>
  );
}

function FlatCapLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <ellipse cx="36" cy="34" rx="15" ry="7" fill="hsl(28 35% 32%)" />
      <path d="M 22 36 Q 36 30 50 36" fill="hsl(28 40% 28%)" />
      <ellipse cx="26" cy="38" rx="10" ry="3.5" fill="hsl(28 35% 25%)" />
    </g>
  );
}

function BucketHatLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <ellipse cx="36" cy="32" rx="18" ry="10" fill="hsl(0 0% 95%)" />
      <ellipse cx="36" cy="28" rx="12" ry="8" fill="hsl(0 0% 92%)" />
      <ellipse cx="36" cy="34" rx="18" ry="3.5" fill="hsl(0 0% 85%)" />
    </g>
  );
}

function HeadphonesLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <path d="M 20 38 Q 36 18 52 38" stroke="hsl(0 0% 20%)" strokeWidth="3" fill="none" />
      <ellipse cx="22" cy="40" rx="5" ry="7" fill="hsl(0 0% 15%)" />
      <ellipse cx="50" cy="40" rx="5" ry="7" fill="hsl(0 0% 15%)" />
    </g>
  );
}

function ScarfLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <ellipse cx="36" cy="64" rx="13" ry="4.5" fill="hsl(350 70% 45%)" />
      <path d="M 26 66 Q 22 76 28 86" stroke="hsl(350 70% 45%)" strokeWidth="4.5" fill="none" />
      <line x1="25" y1="62" x2="47" y2="62" stroke="hsl(45 80% 70%)" strokeWidth="1" />
    </g>
  );
}

function BandanaLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <path d="M 22 40 Q 36 34 52 40" fill="hsl(210 80% 45%)" />
      <circle cx="54" cy="42" r="2.5" fill="hsl(210 80% 40%)" />
      <path d="M 56 40 Q 62 44 60 52" stroke="hsl(210 80% 45%)" strokeWidth="2.5" fill="none" />
    </g>
  );
}

function FlowerCrownLeaning() {
  return (
    <g transform="translate(-5, 2) rotate(5 40 45)">
      <path d="M 20 36 Q 36 26 54 36" stroke="hsl(120 40% 35%)" strokeWidth="2" fill="none" />
      <g transform="translate(26, 32)">
        <circle cx="0" cy="0" r="4" fill="hsl(0 0% 98%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(36, 28)">
        <circle cx="0" cy="0" r="5" fill="hsl(330 70% 75%)" />
        <circle cx="0" cy="0" r="2" fill="hsl(45 90% 55%)" />
      </g>
      <g transform="translate(46, 32)">
        <circle cx="0" cy="0" r="4" fill="hsl(280 60% 75%)" />
        <circle cx="0" cy="0" r="1.5" fill="hsl(45 90% 55%)" />
      </g>
    </g>
  );
}

/**
 * Hero version — static presence, grounded in environment
 * 
 * The world moves; Bubbles does not.
 * Entrance animation is acceptable (arriving), but no ongoing performance.
 */
export function BubblesBogHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Environmental mist — the bog, not a glow effect */}
      <div className="absolute inset-0 blur-3xl opacity-15 bg-gradient-to-b from-muted/30 via-transparent to-transparent" />
      
      {/* Ground-level fog — Bubbles emerges from the landscape */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/25 to-transparent blur-xl" />
      
      {/* Main mascot — entrance only, then static */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.3,
          ease: "easeOut",
        }}
      >
        <BubblesBog 
          size="hero" 
          animated={false} // Static presence — the world moves, Bubbles does not
          posture="four-legged"
          accessory="sunglasses"
          expression="certain" // Unshakeable conviction
          weathered={true}
        />
      </motion.div>
      
      {/* Environmental atmosphere — rain/mist, not decorative particles */}
      {/* These move; Bubbles remains still — reinforces the visual hierarchy */}
      <motion.div
        className="absolute top-10 right-14 w-0.5 h-6 bg-muted/15 rounded-full"
        animate={{ y: [0, 25], opacity: [0.15, 0] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-6 right-24 w-0.5 h-5 bg-muted/12 rounded-full"
        animate={{ y: [0, 20], opacity: [0.12, 0] }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          delay: 0.5,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-12 left-20 w-0.5 h-7 bg-muted/10 rounded-full"
        animate={{ y: [0, 30], opacity: [0.1, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 1.2,
          ease: "linear",
        }}
      />
    </div>
  );
}
