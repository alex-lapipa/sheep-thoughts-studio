import { useEffect, useRef, memo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

export const PageTransition = memo(function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only scroll to top if path actually changed
    if (previousPathRef.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
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
  );
});
