import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Flame, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  id: string;
  quote: string;
  title: string;
  category: string;
  votes: number;
  hasVoted: boolean;
  onVote: () => void;
  featured?: boolean;
  innerThought?: string;
  index: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  Economics: { bg: "from-accent/20 to-accent/5", text: "text-accent", glow: "shadow-accent/20" },
  Personal: { bg: "from-mode-savage/20 to-mode-savage/5", text: "text-mode-savage", glow: "shadow-mode-savage/20" },
  Technology: { bg: "from-primary/20 to-primary/5", text: "text-primary", glow: "shadow-primary/20" },
  Science: { bg: "from-mode-triggered/20 to-mode-triggered/5", text: "text-triggered", glow: "shadow-mode-triggered/20" },
  Culture: { bg: "from-bubbles-gorse/20 to-bubbles-gorse/5", text: "text-bubbles-gorse", glow: "shadow-bubbles-gorse/20" },
};

export function QuoteCard({
  id,
  quote,
  title,
  category,
  votes,
  hasVoted,
  onVote,
  featured,
  innerThought,
  index,
}: QuoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const categoryStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.Culture;
  
  // Extract the most impactful phrase (first sentence or ~80 chars)
  const impactPhrase = quote.split(/[.!?]/)[0].slice(0, 100) + (quote.length > 100 ? "..." : "");

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.08,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative aspect-square cursor-pointer group perspective-1000",
          "rounded-2xl overflow-hidden",
          "bg-gradient-to-br",
          categoryStyle.bg,
          "border border-border/50 hover:border-mode-nuclear/50",
          "transition-all duration-300",
          "hover:shadow-2xl",
          categoryStyle.glow
        )}
      >
        {/* Floating decoration */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 3 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-mode-nuclear/10 blur-xl"
        />
        
        <motion.div
          animate={{ 
            y: [0, 6, 0],
            x: [0, -4, 0]
          }}
          transition={{ 
            duration: 4 + index * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-bubbles-gorse/10 blur-xl"
        />

        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-between z-10">
          {/* Top: Category & Featured */}
          <div className="flex items-start justify-between">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] uppercase tracking-wider font-bold",
                "bg-background/80 backdrop-blur-sm border-0"
              )}
            >
              {category}
            </Badge>
            {featured && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-bubbles-gorse" />
              </motion.div>
            )}
          </div>

          {/* Center: The Quote */}
          <div className="flex-1 flex items-center justify-center py-4">
            <p className={cn(
              "font-display text-center leading-tight",
              "text-lg md:text-xl font-bold",
              "text-foreground",
              "group-hover:scale-105 transition-transform duration-300"
            )}>
              "{impactPhrase}"
            </p>
          </div>

          {/* Bottom: Vote count & hint */}
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onVote();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                "transition-colors",
                hasVoted 
                  ? "bg-bubbles-gorse/20 text-bubbles-gorse" 
                  : "bg-background/60 backdrop-blur-sm text-muted-foreground hover:text-bubbles-gorse"
              )}
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", hasVoted && "fill-current")} />
              <span>{votes.toLocaleString()}</span>
            </motion.button>
            
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to read →
            </span>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-mode-nuclear/20 via-transparent to-transparent" />
        </div>
      </motion.div>

      {/* Full Quote Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-card via-card to-mode-nuclear/5 border-mode-nuclear/20">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-8 pt-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-mode-nuclear/10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-mode-nuclear" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <Badge variant="secondary" className={cn("mt-1", categoryStyle.text)}>
                  {category}
                </Badge>
              </div>
            </div>

            {/* Inner thought */}
            {innerThought && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm italic text-mode-nuclear/60 mb-6 pl-4 border-l-2 border-mode-nuclear/30"
              >
                [internal: {innerThought}]
              </motion.p>
            )}

            {/* The Full Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-2 -top-4 text-6xl text-mode-nuclear/10 font-serif">"</div>
              <p className="text-lg leading-relaxed text-foreground/90 pl-6">
                {quote}
              </p>
              <div className="absolute -right-2 bottom-0 text-6xl text-mode-nuclear/10 font-serif">"</div>
            </motion.div>

            {/* Vote button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-between"
            >
              <Button
                variant={hasVoted ? "default" : "outline"}
                onClick={onVote}
                className={cn(
                  "gap-2",
                  hasVoted && "bg-bubbles-gorse text-peat-earth hover:bg-bubbles-gorse/90"
                )}
              >
                <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-current")} />
                {hasVoted ? "Voted!" : "This is legendary"}
                <span className="ml-1 font-bold">{votes.toLocaleString()}</span>
              </Button>

              <span className="text-sm text-muted-foreground">
                Share the wrongness
              </span>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
