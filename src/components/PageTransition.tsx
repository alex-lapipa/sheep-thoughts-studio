import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BubblesSheep } from "./BubblesSheep";

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only trigger transition if path actually changed
    if (previousPathRef.current !== location.pathname) {
      setIsTransitioning(true);
      setShowLoader(true);
      
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: "instant" });
      
      // Hide loader after content starts appearing
      const loaderTimer = setTimeout(() => {
        setShowLoader(false);
      }, 350);
      
      // End transition after animation
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
      
      previousPathRef.current = location.pathname;
      return () => {
        clearTimeout(timer);
        clearTimeout(loaderTimer);
      };
    }
  }, [location.pathname]);

  return (
    <>
      {/* Swivelling sheep loader */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <BubblesSheep size="lg" animated={false} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page transition loading bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-[100]"
        initial={{ width: "0%", opacity: 0 }}
        animate={{ 
          width: isTransitioning ? "100%" : "0%",
          opacity: isTransitioning ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          boxShadow: isTransitioning ? "0 0 10px hsl(var(--primary) / 0.5)" : "none"
        }}
      />
      
      {/* Page content with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
