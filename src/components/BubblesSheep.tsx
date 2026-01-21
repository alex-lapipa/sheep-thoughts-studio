import { cn } from "@/lib/utils";

interface BubblesSheepProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: "w-16 h-16",
  md: "w-32 h-32",
  lg: "w-48 h-48",
  xl: "w-64 h-64",
};

export function BubblesSheep({ size = "md", className, animated = true }: BubblesSheepProps) {
  return (
    <div className={cn(sizes[size], animated && "animate-float", className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Wool puffs - back layer */}
        <circle cx="45" cy="95" r="22" fill="hsl(var(--bubbles-cream))" />
        <circle cx="155" cy="95" r="22" fill="hsl(var(--bubbles-cream))" />
        <circle cx="55" cy="130" r="20" fill="hsl(var(--bubbles-cream))" />
        <circle cx="145" cy="130" r="20" fill="hsl(var(--bubbles-cream))" />
        
        {/* Main body - fluffy wool */}
        <ellipse cx="100" cy="120" rx="55" ry="45" fill="hsl(var(--bubbles-cream))" />
        
        {/* More wool puffs on body */}
        <circle cx="65" cy="105" r="18" fill="hsl(var(--bubbles-cream))" />
        <circle cx="135" cy="105" r="18" fill="hsl(var(--bubbles-cream))" />
        <circle cx="80" cy="85" r="16" fill="hsl(var(--bubbles-cream))" />
        <circle cx="120" cy="85" r="16" fill="hsl(var(--bubbles-cream))" />
        <circle cx="100" cy="78" r="14" fill="hsl(var(--bubbles-cream))" />
        
        {/* Legs */}
        <rect x="70" y="155" width="12" height="30" rx="6" fill="hsl(var(--bubbles-peat))" />
        <rect x="118" y="155" width="12" height="30" rx="6" fill="hsl(var(--bubbles-peat))" />
        
        {/* Hooves */}
        <ellipse cx="76" cy="185" rx="8" ry="5" fill="hsl(var(--bubbles-peat))" />
        <ellipse cx="124" cy="185" rx="8" ry="5" fill="hsl(var(--bubbles-peat))" />
        
        {/* Head */}
        <ellipse cx="100" cy="65" rx="32" ry="28" fill="hsl(var(--bubbles-cream))" />
        
        {/* Face - slightly darker cream/beige */}
        <ellipse cx="100" cy="68" rx="24" ry="22" fill="hsl(48 80% 92%)" />
        
        {/* Ears */}
        <ellipse 
          cx="60" cy="52" rx="12" ry="8" 
          fill="hsl(48 80% 92%)" 
          transform="rotate(-30 60 52)"
        />
        <ellipse 
          cx="140" cy="52" rx="12" ry="8" 
          fill="hsl(48 80% 92%)" 
          transform="rotate(30 140 52)"
        />
        
        {/* Inner ears - heather pink */}
        <ellipse 
          cx="60" cy="52" rx="7" ry="4" 
          fill="hsl(var(--bubbles-heather) / 0.4)" 
          transform="rotate(-30 60 52)"
        />
        <ellipse 
          cx="140" cy="52" rx="7" ry="4" 
          fill="hsl(var(--bubbles-heather) / 0.4)" 
          transform="rotate(30 140 52)"
        />
        
        {/* Wool tuft on head */}
        <circle cx="85" cy="42" r="10" fill="hsl(var(--bubbles-cream))" />
        <circle cx="100" cy="38" r="11" fill="hsl(var(--bubbles-cream))" />
        <circle cx="115" cy="42" r="10" fill="hsl(var(--bubbles-cream))" />
        <circle cx="92" cy="35" r="8" fill="hsl(var(--bubbles-cream))" />
        <circle cx="108" cy="35" r="8" fill="hsl(var(--bubbles-cream))" />
        
        {/* Eyes */}
        <ellipse cx="88" cy="62" rx="6" ry="7" fill="hsl(var(--bubbles-peat))" />
        <ellipse cx="112" cy="62" rx="6" ry="7" fill="hsl(var(--bubbles-peat))" />
        
        {/* Eye highlights */}
        <circle cx="90" cy="60" r="2" fill="white" />
        <circle cx="114" cy="60" r="2" fill="white" />
        
        {/* Nose */}
        <ellipse cx="100" cy="78" rx="8" ry="5" fill="hsl(var(--bubbles-heather) / 0.6)" />
        
        {/* Nostrils */}
        <ellipse cx="96" cy="78" rx="2" ry="1.5" fill="hsl(var(--bubbles-peat) / 0.4)" />
        <ellipse cx="104" cy="78" rx="2" ry="1.5" fill="hsl(var(--bubbles-peat) / 0.4)" />
        
        {/* Subtle mouth line */}
        <path 
          d="M 95 84 Q 100 88 105 84" 
          stroke="hsl(var(--bubbles-peat) / 0.3)" 
          strokeWidth="1.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Cheek blush */}
        <ellipse cx="78" cy="72" rx="6" ry="4" fill="hsl(var(--bubbles-heather) / 0.2)" />
        <ellipse cx="122" cy="72" rx="6" ry="4" fill="hsl(var(--bubbles-heather) / 0.2)" />
        
        {/* Tail */}
        <circle cx="45" cy="120" r="12" fill="hsl(var(--bubbles-cream))" />
        <circle cx="38" cy="115" r="8" fill="hsl(var(--bubbles-cream))" />
        <circle cx="35" cy="122" r="6" fill="hsl(var(--bubbles-cream))" />
      </svg>
    </div>
  );
}

// Simplified version for header/small uses
export function BubblesLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
    >
      {/* Simple sheep face */}
      <circle cx="20" cy="20" r="18" fill="hsl(var(--bubbles-cream))" />
      
      {/* Wool puffs */}
      <circle cx="8" cy="12" r="6" fill="hsl(var(--bubbles-cream))" />
      <circle cx="32" cy="12" r="6" fill="hsl(var(--bubbles-cream))" />
      <circle cx="14" cy="6" r="5" fill="hsl(var(--bubbles-cream))" />
      <circle cx="26" cy="6" r="5" fill="hsl(var(--bubbles-cream))" />
      <circle cx="20" cy="4" r="4" fill="hsl(var(--bubbles-cream))" />
      
      {/* Face */}
      <ellipse cx="20" cy="22" rx="12" ry="10" fill="hsl(48 80% 92%)" />
      
      {/* Ears */}
      <ellipse cx="6" cy="18" rx="4" ry="3" fill="hsl(48 80% 92%)" transform="rotate(-20 6 18)" />
      <ellipse cx="34" cy="18" rx="4" ry="3" fill="hsl(48 80% 92%)" transform="rotate(20 34 18)" />
      
      {/* Eyes */}
      <circle cx="15" cy="20" r="2.5" fill="hsl(var(--bubbles-peat))" />
      <circle cx="25" cy="20" r="2.5" fill="hsl(var(--bubbles-peat))" />
      
      {/* Eye highlights */}
      <circle cx="16" cy="19" r="0.8" fill="white" />
      <circle cx="26" cy="19" r="0.8" fill="white" />
      
      {/* Nose */}
      <ellipse cx="20" cy="26" rx="3" ry="2" fill="hsl(var(--bubbles-heather) / 0.5)" />
    </svg>
  );
}
