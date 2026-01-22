import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger transition if path actually changed
    if (previousPathRef.current !== location.pathname) {
      setIsTransitioning(true);
      setIsVisible(false);
      
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: "instant" });
      
      // Fade in after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsTransitioning(false);
      }, 150);
      
      previousPathRef.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Page transition loading bar */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-[100] transition-all duration-300",
          isTransitioning ? "w-full opacity-100" : "w-0 opacity-0"
        )}
        style={{
          boxShadow: isTransitioning ? "0 0 10px hsl(var(--primary) / 0.5)" : "none"
        }}
      />
      
      {/* Page content with transition */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-3"
        )}
      >
        {children}
      </div>
    </>
  );
}
