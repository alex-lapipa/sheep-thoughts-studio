import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BubblesBog } from "@/components/BubblesBog";
import { cn } from "@/lib/utils";

type Posture = "four-legged" | "seated" | "grazing" | "leaning";
type Accessory = "sunglasses" | "cap" | "bucket-hat" | "headphones" | "scarf" | "bandana" | "flower-crown" | "beanie" | "bow-tie" | "glasses" | "none";
type Expression = "neutral" | "distant" | "certain" | "waiting";

const POSTURES: Posture[] = ["four-legged", "seated", "grazing", "leaning"];
const ACCESSORIES: Accessory[] = ["sunglasses", "cap", "bucket-hat", "headphones", "scarf", "bandana", "flower-crown", "beanie", "bow-tie", "glasses", "none"];
const EXPRESSIONS: Expression[] = ["neutral", "distant", "certain", "waiting"];

interface RandomBubblesGeneratorProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showControls?: boolean;
}

function getRandomItem<T>(arr: T[], exclude?: T): T {
  const filtered = exclude ? arr.filter(item => item !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function RandomBubblesGenerator({ 
  className, 
  size = "lg",
  showControls = true 
}: RandomBubblesGeneratorProps) {
  const [posture, setPosture] = useState<Posture>(() => getRandomItem(POSTURES));
  const [accessory, setAccessory] = useState<Accessory>(() => getRandomItem(ACCESSORIES));
  const [expression, setExpression] = useState<Expression>(() => getRandomItem(EXPRESSIONS));
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);

  const shuffle = useCallback(() => {
    setIsShuffling(true);
    
    // Animate through several random states before landing
    let iterations = 0;
    const maxIterations = 6;
    
    const animate = () => {
      iterations++;
      setPosture(prev => getRandomItem(POSTURES, prev));
      setAccessory(prev => getRandomItem(ACCESSORIES, prev));
      setExpression(prev => getRandomItem(EXPRESSIONS, prev));
      
      if (iterations < maxIterations) {
        setTimeout(animate, 80 + iterations * 20);
      } else {
        setIsShuffling(false);
        setShuffleCount(prev => prev + 1);
      }
    };
    
    animate();
  }, []);

  // Format display text
  const formatLabel = (str: string) => 
    str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Character Display */}
      <motion.div
        key={`${posture}-${accessory}-${expression}-${shuffleCount}`}
        initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
        animate={{ 
          scale: 1, 
          opacity: 1, 
          rotate: 0,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        }}
        className="relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shuffleCount}
            initial={{ filter: "blur(4px)" }}
            animate={{ filter: "blur(0px)" }}
            exit={{ filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
          >
            <BubblesBog
              size={size}
              posture={posture}
              accessory={accessory}
              expression={expression}
              weathered={true}
              animated={false}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Shuffle sparkle effect */}
        {isShuffling && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-accent"
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: "50%", 
                  y: "50%" 
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                  x: `${20 + Math.random() * 60}%`,
                  y: `${20 + Math.random() * 60}%`,
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Current Configuration Display */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 text-xs"
        layout
      >
        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {formatLabel(posture)}
        </span>
        <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
          {formatLabel(accessory)}
        </span>
        <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
          {formatLabel(expression)}
        </span>
      </motion.div>

      {/* Shuffle Button */}
      {showControls && (
        <Button
          variant="outline"
          size="sm"
          onClick={shuffle}
          disabled={isShuffling}
          className="gap-2 font-display hover:scale-105 transition-transform"
        >
          <Shuffle className={cn("h-4 w-4", isShuffling && "animate-spin")} />
          {isShuffling ? "Shuffling..." : "Shuffle Bubbles"}
        </Button>
      )}
    </div>
  );
}
