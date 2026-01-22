import { ReactNode, CSSProperties } from "react";
import { useElementParallax, useMouseParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children?: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
  mouseParallax?: boolean;
  mouseIntensity?: number;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * A section wrapper that applies parallax scrolling effects
 */
export function ParallaxSection({
  children,
  className,
  speed = 0.15,
  direction = "up",
  mouseParallax = false,
  mouseIntensity = 0.02,
  disabled = false,
  style,
}: ParallaxSectionProps) {
  const { ref, style: scrollStyle, isVisible } = useElementParallax({ 
    speed, 
    direction, 
    disabled 
  });
  const { style: mouseStyle } = useMouseParallax({ 
    intensity: mouseParallax ? mouseIntensity : 0, 
    disabled: !mouseParallax || disabled 
  });

  const combinedTransform = mouseParallax && !disabled
    ? `${scrollStyle.transform} ${mouseStyle.transform.replace('translate', 'translate3d').replace(')', ', 0)')}`
    : scrollStyle.transform;

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        ...style,
        transform: disabled ? undefined : combinedTransform,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  depth?: number; // 0 = foreground (fast), 1 = background (slow)
  style?: CSSProperties;
}

/**
 * A layer within a parallax container with depth-based movement
 */
export function ParallaxLayer({
  children,
  className,
  depth = 0.5,
  style,
}: ParallaxLayerProps) {
  const speed = 0.1 + depth * 0.4; // depth 0 = 0.1, depth 1 = 0.5
  const { ref, style: parallaxStyle } = useElementParallax({ speed });

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        ...style,
        ...parallaxStyle,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxBackgroundProps {
  className?: string;
  imageUrl?: string;
  gradient?: string;
  speed?: number;
  overlay?: boolean;
  overlayOpacity?: number;
}

/**
 * A parallax background element
 */
export function ParallaxBackground({
  className,
  imageUrl,
  gradient,
  speed = 0.3,
  overlay = false,
  overlayOpacity = 0.4,
}: ParallaxBackgroundProps) {
  const { ref, style } = useElementParallax({ speed, direction: "down" });

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 -z-10 overflow-hidden will-change-transform",
        className
      )}
      style={style}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-[120%] object-cover"
          style={{ transform: "translateY(-10%)" }}
        />
      )}
      {gradient && (
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
        />
      )}
      {overlay && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}
