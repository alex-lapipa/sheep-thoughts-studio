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
 */

interface BubblesHeroImageProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-56 h-56",
  xl: "w-72 h-72",
  hero: "w-80 h-80 md:w-[28rem] md:h-[28rem]",
};

export function BubblesHeroImage({
  size = "lg",
  className,
  animated = false,
}: BubblesHeroImageProps) {
  const sizeClass = sizes[size];

  // Static presence is the default — the world moves, Bubbles does not
  if (!animated) {
    return (
      <div className={cn(sizeClass, "select-none", className)}>
        <img 
          src={bubblesStencil} 
          alt="Bubbles - A rebellious sheep in sunglasses" 
          className="w-full h-full object-contain drop-shadow-2xl"
          loading="eager"
        />
      </div>
    );
  }

  // Very subtle "existing" animation — not bouncy, not playful
  // Just the imperceptible shift of a creature that is certain it is correct
  return (
    <motion.div
      className={cn(sizeClass, "select-none", className)}
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
        className="w-full h-full object-contain drop-shadow-2xl"
        loading="eager"
      />
    </motion.div>
  );
}
