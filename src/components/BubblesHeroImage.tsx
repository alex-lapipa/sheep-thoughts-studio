import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import bubblesStencil from "@/assets/bubbles-hero-stencil.png";

/**
 * BUBBLES HERO IMAGE — Post-Punk Stencil Style
 * 
 * This is the new badass Bubbles design from the T-shirt collection.
 * High-contrast black and white stencil art, rebellious and bold.
 * 
 * Used across all hero banners to replace the old cute/cartoonish SVG mascot.
 * 
 * Props:
 * - size: Controls the size of Bubbles
 * - flipped: When true, Bubbles faces left instead of right
 * - grounded: When true, positions Bubbles at the bottom as if standing on grass
 * - animated: Enables subtle floating animation
 */

interface BubblesHeroImageProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero" | "massive" | "colossal";
  className?: string;
  animated?: boolean;
  /** Flip horizontally so Bubbles faces left */
  flipped?: boolean;
  /** Position at bottom as if standing on grass */
  grounded?: boolean;
}

const sizes = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-56 h-56",
  xl: "w-72 h-72",
  hero: "w-80 h-80 md:w-[28rem] md:h-[28rem]",
  massive: "w-96 h-96 md:w-[32rem] md:h-[32rem] lg:w-[38rem] lg:h-[38rem]",
  colossal: "w-[22rem] h-[22rem] sm:w-[28rem] sm:h-[28rem] md:w-[36rem] md:h-[36rem] lg:w-[44rem] lg:h-[44rem] xl:w-[52rem] xl:h-[52rem]",
};

export function BubblesHeroImage({
  size = "lg",
  className,
  animated = false,
  flipped = false,
  grounded = false,
}: BubblesHeroImageProps) {
  const sizeClass = sizes[size];
  
  const imageClasses = cn(
    "w-full h-full object-contain drop-shadow-2xl",
    flipped && "scale-x-[-1]",
    grounded && "object-bottom"
  );

  // Static presence is the default — the world moves, Bubbles does not
  if (!animated) {
    return (
      <div className={cn(
        sizeClass, 
        "select-none",
        grounded && "self-end",
        className
      )}>
        <img 
          src={bubblesStencil} 
          alt="Bubbles - A rebellious sheep in sunglasses" 
          className={imageClasses}
          loading="eager"
        />
      </div>
    );
  }

  // Very subtle "existing" animation — not bouncy, not playful
  // Just the imperceptible shift of a creature that is certain it is correct
  return (
    <motion.div
      className={cn(
        sizeClass, 
        "select-none",
        grounded && "self-end",
        className
      )}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <img 
        src={bubblesStencil} 
        alt="Bubbles - A rebellious sheep in sunglasses" 
        className={imageClasses}
        loading="eager"
      />
    </motion.div>
  );
}
