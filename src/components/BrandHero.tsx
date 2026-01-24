import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { BubbleMode } from "@/data/thoughtBubbles";

// Official Bubbles assets - the ONLY allowed character images
import bubblesShoppingHappy from "@/assets/bubbles-shopping-happy.jpg";
import bubblesTalkHappy from "@/assets/bubbles-talk-happy.jpg";
import bubblesExplainsHappy from "@/assets/bubbles-explains-happy.jpg";
import bubblesFactsHappy from "@/assets/bubbles-facts-happy.jpg";
import bubblesAdventuresHappy from "@/assets/bubbles-adventures-happy.jpg";
import bubblesScenariosHappy from "@/assets/bubbles-scenarios-happy.jpg";

export type BubblesVariant = 
  | "shopping" 
  | "talk" 
  | "explains" 
  | "facts" 
  | "adventures" 
  | "scenarios";

const BUBBLES_IMAGES: Record<BubblesVariant, string> = {
  shopping: bubblesShoppingHappy,
  talk: bubblesTalkHappy,
  explains: bubblesExplainsHappy,
  facts: bubblesFactsHappy,
  adventures: bubblesAdventuresHappy,
  scenarios: bubblesScenariosHappy,
};

interface BrandHeroProps {
  // Required
  title: string;
  subtitle: string;
  
  // Bubbles variant
  bubblesVariant: BubblesVariant;
  
  // Optional badges
  badge?: string;
  badgeIcon?: LucideIcon;
  secondaryBadge?: string;
  
  // Optional CTAs
  primaryCta?: {
    label: string;
    to: string;
    icon?: LucideIcon;
  };
  secondaryCta?: {
    label: string;
    to: string;
  };
  
  // Optional thought bubble
  thought?: {
    text: string;
    mode?: BubbleMode;
  };
  
  // Styling
  className?: string;
}

export function BrandHero({
  title,
  subtitle,
  bubblesVariant,
  badge,
  badgeIcon: BadgeIcon,
  secondaryBadge,
  primaryCta,
  secondaryCta,
  thought,
  className,
}: BrandHeroProps) {
  const bubblesImage = BUBBLES_IMAGES[bubblesVariant];

  return (
    <section className={cn(
      "hero-gradient py-20 md:py-32 overflow-hidden relative",
      className
    )}>
      {/* Wicklow Landscape Background - Brand Standard */}
      <WicklowLandscape />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badges */}
            {(badge || secondaryBadge) && (
              <motion.div 
                className="flex items-center flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {badge && (
                  <Badge className="bg-gradient-to-r from-bubbles-gorse/30 to-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/40 hover:bg-bubbles-gorse/40 px-3 py-1">
                    {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5 mr-1.5 animate-pulse" />}
                    {badge}
                  </Badge>
                )}
                {secondaryBadge && (
                  <Badge variant="outline" className="px-3 py-1 border-primary/30">
                    {secondaryBadge}
                  </Badge>
                )}
              </motion.div>
            )}

            {/* Title */}
            <div className="space-y-4">
              <motion.h1 
                className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-pop-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                {title}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {subtitle}
              </motion.p>
            </div>
            
            {/* CTAs */}
            {(primaryCta || secondaryCta) && (
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {primaryCta && (
                  <Link to={primaryCta.to}>
                    <Button 
                      size="lg" 
                      className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-105 hover:animate-squish transition-all gap-2"
                    >
                      {primaryCta.icon && <primaryCta.icon className="h-5 w-5" />}
                      {primaryCta.label}
                      <ArrowRight className="ml-1 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {secondaryCta && (
                  <Link to={secondaryCta.to}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="font-display hover:scale-105 hover:animate-wiggle transition-all"
                    >
                      {secondaryCta.label}
                    </Button>
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Official Bubbles Character */}
          <motion.div 
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-bubbles-gorse/30 rounded-3xl blur-3xl scale-110 animate-pulse" />
              
              {/* Main image container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full"
                >
                  <img 
                    src={bubblesImage} 
                    alt="Bubbles the Sheep from Wicklow" 
                    className="w-full h-full object-contain drop-shadow-2xl rounded-2xl"
                  />
                </motion.div>

                {/* Thought bubble */}
                {thought && (
                  <motion.div 
                    className="absolute -top-4 -right-4 md:right-0 max-w-[260px]"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <ThoughtBubble mode={thought.mode || "innocent"} size="md">
                      <p className="text-foreground italic">"{thought.text}"</p>
                    </ThoughtBubble>
                  </motion.div>
                )}
                
                {/* Floating accent badge */}
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Badge className="bg-foreground text-background font-display text-sm px-4 py-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Bog-Certified
                  </Badge>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
