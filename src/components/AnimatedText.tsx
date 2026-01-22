import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * ANIMATED TEXT COMPONENTS
 * Reusable text animations for headings, paragraphs, and spans
 */

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

// Fade up animation for headings
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Stagger children animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Slide in from left
const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Character by character reveal
const charContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Fade Up Heading
export function AnimatedHeading({ 
  children, 
  className, 
  delay = 0 
}: AnimatedTextProps) {
  return (
    <motion.h1
      className={cn("", className)}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.h1>
  );
}

// Fade Up Subheading
export function AnimatedSubheading({ 
  children, 
  className, 
  delay = 0.1 
}: AnimatedTextProps) {
  return (
    <motion.h2
      className={cn("", className)}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.h2>
  );
}

// Fade Up Paragraph
export function AnimatedParagraph({ 
  children, 
  className, 
  delay = 0.2 
}: AnimatedTextProps) {
  return (
    <motion.p
      className={cn("", className)}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.p>
  );
}

// Staggered container for multiple elements
export function AnimatedStagger({ 
  children, 
  className 
}: AnimatedTextProps) {
  return (
    <motion.div
      className={cn("", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function AnimatedStaggerItem({ 
  children, 
  className 
}: AnimatedTextProps) {
  return (
    <motion.div
      className={cn("", className)}
      variants={childVariants}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left
export function AnimatedSlideIn({ 
  children, 
  className, 
  delay = 0 
}: AnimatedTextProps) {
  return (
    <motion.div
      className={cn("", className)}
      variants={slideInLeftVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// Character by character animation (for short text only)
export function AnimatedCharacters({ 
  children, 
  className 
}: { children: string; className?: string }) {
  const chars = children.split("");
  
  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={charContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={charVariants}
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Viewport-triggered animation wrapper
export function AnimatedOnView({ 
  children, 
  className,
  delay = 0,
}: AnimatedTextProps) {
  return (
    <motion.div
      className={cn("", className)}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}
