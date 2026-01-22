import { useEffect, useState, useRef, useCallback } from "react";

interface ParallaxOptions {
  speed?: number; // Multiplier for scroll effect (0.1 = slow, 1 = match scroll)
  direction?: "up" | "down"; // Direction of movement
  disabled?: boolean;
}

/**
 * Hook for creating smooth parallax scroll effects
 */
export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, direction = "up", disabled = false } = options;
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const multiplier = direction === "up" ? -1 : 1;
        setOffset(scrollY * speed * multiplier);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [speed, direction, disabled]);

  return { offset, transform: `translateY(${offset}px)` };
}

/**
 * Hook for element-based parallax (triggers when element is in viewport)
 */
export function useElementParallax(options: ParallaxOptions & { threshold?: number } = {}) {
  const { speed = 0.3, direction = "up", disabled = false, threshold = 0.1 } = options;
  const elementRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number>();

  const handleScroll = useCallback(() => {
    if (!elementRef.current || disabled) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the viewport the element is
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Apply parallax based on distance from viewport center
      const multiplier = direction === "up" ? -1 : 1;
      const newOffset = distanceFromCenter * speed * multiplier;
      
      setOffset(newOffset);
    });
  }, [speed, direction, disabled]);

  useEffect(() => {
    if (disabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, disabled, threshold]);

  return { 
    ref: elementRef, 
    offset, 
    isVisible,
    style: { transform: `translateY(${offset}px)` } 
  };
}

/**
 * Hook for mouse-based parallax (follows cursor)
 */
export function useMouseParallax(options: { intensity?: number; disabled?: boolean } = {}) {
  const { intensity = 0.02, disabled = false } = options;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const x = (e.clientX - centerX) * intensity;
        const y = (e.clientY - centerY) * intensity;
        
        setPosition({ x, y });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [intensity, disabled]);

  return { 
    position, 
    style: { transform: `translate(${position.x}px, ${position.y}px)` } 
  };
}
