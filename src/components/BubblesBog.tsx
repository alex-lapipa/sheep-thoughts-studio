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
  posture?: "four-legged" | "two-legged";
  accessory?: "sunglasses" | "cap" | "bucket-hat" | "none";
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

  const SheepSVG = posture === "four-legged" 
    ? <FourLeggedSheep expr={expr} accessory={accessory} weathered={weathered} />
    : <TwoLeggedSheep expr={expr} accessory={accessory} weathered={weathered} />;

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
    </svg>
  );
}

// Two-legged posture - absorbed human behavior, still a sheep
function TwoLeggedSheep({ 
  expr, 
  accessory, 
  weathered 
}: { 
  expr: typeof expressions.neutral; 
  accessory: string; 
  weathered: boolean;
}) {
  return (
    <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Bog-weathered wool gradient */}
        <radialGradient id="bogWool2" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="hsl(45 25% 88%)" />
          <stop offset="60%" stopColor="hsl(40 20% 82%)" />
          <stop offset="100%" stopColor="hsl(35 18% 75%)" />
        </radialGradient>
        
        {/* Damp lower wool */}
        <radialGradient id="dampWool2" cx="50%" cy="90%" r="50%">
          <stop offset="0%" stopColor="hsl(35 18% 75%)" />
          <stop offset="100%" stopColor="hsl(30 25% 55%)" />
        </radialGradient>
        
        {/* Face gradient */}
        <radialGradient id="bogFace2" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="hsl(38 30% 85%)" />
          <stop offset="100%" stopColor="hsl(32 25% 75%)" />
        </radialGradient>
        
        {/* Peat legs */}
        <linearGradient id="peatLegs2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(28 35% 28%)" />
          <stop offset="100%" stopColor="hsl(25 40% 18%)" />
        </linearGradient>

        <filter id="groundShadow2" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="hsl(28 40% 15%)" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="155" rx="25" ry="5" fill="hsl(28 40% 15% / 0.2)" />

      {/* LEGS - Standing upright */}
      <g>
        <rect x="42" y="110" width="10" height="40" rx="4" fill="url(#peatLegs2)" />
        <rect x="68" y="110" width="10" height="40" rx="4" fill="url(#peatLegs2)" />
        
        {/* Hooves */}
        <ellipse cx="47" cy="152" rx="7" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="73" cy="152" rx="7" ry="4" fill="hsl(25 45% 12%)" />
        
        {/* Mud */}
        {weathered && (
          <>
            <circle cx="44" cy="135" r="2" fill="hsl(28 40% 35%)" opacity="0.5" />
            <circle cx="72" cy="138" r="1.5" fill="hsl(28 40% 35%)" opacity="0.4" />
          </>
        )}
      </g>

      {/* BODY - Upright wool mass */}
      <g filter="url(#groundShadow2)">
        {/* Main body */}
        <ellipse cx="60" cy="85" rx="32" ry="35" fill="url(#bogWool2)" />
        
        {/* Shoulder wool */}
        <ellipse cx="40" cy="70" rx="15" ry="18" fill="url(#bogWool2)" />
        <ellipse cx="80" cy="70" rx="15" ry="18" fill="url(#bogWool2)" />
        
        {/* Texture puffs */}
        <ellipse cx="50" cy="58" rx="12" ry="9" fill="url(#bogWool2)" />
        <ellipse cx="70" cy="58" rx="12" ry="9" fill="url(#bogWool2)" />
        <ellipse cx="60" cy="52" rx="10" ry="8" fill="url(#bogWool2)" />
        
        {/* Damp lower patches */}
        {weathered && (
          <ellipse cx="60" cy="110" rx="25" ry="8" fill="url(#dampWool2)" opacity="0.5" />
        )}
      </g>

      {/* ARMS - Sheep front legs, positioned like arms */}
      <g>
        {/* Left arm/leg */}
        <rect x="25" y="68" width="8" height="28" rx="3" fill="url(#peatLegs2)" transform="rotate(-15 29 68)" />
        {/* Right arm/leg */}
        <rect x="87" y="68" width="8" height="28" rx="3" fill="url(#peatLegs2)" transform="rotate(15 91 68)" />
        
        {/* Hooves as hands */}
        <ellipse cx="22" cy="95" rx="5" ry="4" fill="hsl(25 45% 12%)" />
        <ellipse cx="98" cy="95" rx="5" ry="4" fill="hsl(25 45% 12%)" />
      </g>

      {/* HEAD */}
      <g>
        {/* Neck wool */}
        <ellipse cx="60" cy="48" rx="18" ry="14" fill="url(#bogWool2)" />
        
        {/* Head */}
        <ellipse cx="60" cy="32" rx="22" ry="24" fill="url(#bogFace2)" />
        
        {/* Muzzle */}
        <ellipse cx="60" cy="42" rx="12" ry="8" fill="url(#bogFace2)" />
        
        {/* Ears */}
        <ellipse cx="38" cy="20" rx="10" ry="5" fill="url(#bogFace2)" transform="rotate(-30 38 20)" />
        <ellipse cx="82" cy="20" rx="10" ry="5" fill="url(#bogFace2)" transform="rotate(30 82 20)" />
        
        {/* Inner ears */}
        <ellipse cx="38" cy="20" rx="6" ry="3" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(-30 38 20)" />
        <ellipse cx="82" cy="20" rx="6" ry="3" fill="hsl(320 20% 65%)" opacity="0.4" transform="rotate(30 82 20)" />
        
        {/* Forehead wool */}
        <ellipse cx="60" cy="15" rx="14" ry="10" fill="url(#bogWool2)" />
        <ellipse cx="50" cy="12" rx="8" ry="6" fill="url(#bogWool2)" />
        <ellipse cx="70" cy="12" rx="8" ry="6" fill="url(#bogWool2)" />
        
        {/* EYES - Calm, horizontal pupils */}
        <g>
          <ellipse cx="50" cy={28 + expr.eyeOffset} rx="5.5" ry="6" fill="hsl(40 15% 25%)" />
          <ellipse cx="70" cy={28 + expr.eyeOffset} rx="5.5" ry="6" fill="hsl(40 15% 25%)" />
          
          {/* Horizontal rectangular pupils */}
          <rect x="47" y={26 + expr.eyeOffset} width="6" height="3" rx="1" fill="hsl(0 0% 8%)" />
          <rect x="67" y={26 + expr.eyeOffset} width="6" height="3" rx="1" fill="hsl(0 0% 8%)" />
          
          {/* Highlights */}
          <circle cx="49" cy={25 + expr.eyeOffset} r="1.2" fill="white" opacity="0.4" />
          <circle cx="69" cy={25 + expr.eyeOffset} r="1.2" fill="white" opacity="0.4" />
          
          {/* Eyelid droop */}
          {expr.lidDrop > 0 && (
            <>
              <ellipse cx="50" cy={25 + expr.eyeOffset} rx="6" ry={2.5 * expr.lidDrop + 1} fill="url(#bogFace2)" />
              <ellipse cx="70" cy={25 + expr.eyeOffset} rx="6" ry={2.5 * expr.lidDrop + 1} fill="url(#bogFace2)" />
            </>
          )}
        </g>
        
        {/* NOSE */}
        <ellipse cx="60" cy="44" rx="7" ry="5" fill="hsl(320 15% 35%)" />
        <ellipse cx="60" cy="43" rx="5" ry="3" fill="hsl(320 18% 42%)" />
        
        {/* Nostrils */}
        <ellipse cx="57" cy="44" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        <ellipse cx="63" cy="44" rx="1.5" ry="1" fill="hsl(0 0% 15%)" opacity="0.7" />
        
        {/* Mouth */}
        <path 
          d="M 54 50 Q 60 52 66 50" 
          stroke="hsl(28 30% 40%)" 
          strokeWidth="1" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.4" 
        />
      </g>

      {/* ACCESSORIES */}
      {accessory === "sunglasses" && <SunglassesTwoLegged />}
      {accessory === "cap" && <FlatCapTwoLegged />}
      {accessory === "bucket-hat" && <BucketHatTwoLegged />}
    </svg>
  );
}

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

function SunglassesTwoLegged() {
  return (
    <g>
      <ellipse cx="50" cy="27" rx="9" ry="8" fill="hsl(0 0% 10%)" opacity="0.9" />
      <ellipse cx="70" cy="27" rx="9" ry="8" fill="hsl(0 0% 10%)" opacity="0.9" />
      <path d="M 58 26 Q 60 25 62 26" stroke="hsl(45 50% 45%)" strokeWidth="1.5" fill="none" />
      <line x1="41" y1="26" x2="32" y2="22" stroke="hsl(45 50% 45%)" strokeWidth="1.5" />
      <line x1="79" y1="26" x2="88" y2="22" stroke="hsl(45 50% 45%)" strokeWidth="1.5" />
      <ellipse cx="48" cy="25" rx="2.5" ry="2" fill="hsl(200 60% 60%)" opacity="0.3" />
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

function FlatCapTwoLegged() {
  return (
    <g>
      <ellipse cx="60" cy="10" rx="20" ry="10" fill="hsl(28 35% 32%)" />
      <path d="M 42 12 Q 60 5 78 12" fill="hsl(28 40% 28%)" />
      <ellipse cx="48" cy="15" rx="14" ry="5" fill="hsl(28 35% 25%)" />
      <path d="M 48 8 L 72 8" stroke="hsl(28 30% 40%)" strokeWidth="0.5" opacity="0.5" />
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

function BucketHatTwoLegged() {
  return (
    <g>
      <ellipse cx="60" cy="10" rx="22" ry="12" fill="hsl(0 0% 95%)" />
      <ellipse cx="60" cy="6" rx="15" ry="10" fill="hsl(0 0% 92%)" />
      <ellipse cx="60" cy="12" rx="22" ry="4" fill="hsl(0 0% 85%)" />
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
