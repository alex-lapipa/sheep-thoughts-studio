import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, GraduationCap } from "lucide-react";
import bubblesScholar from "@/assets/bubbles-scholar.jpg";

interface ExplainsHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function ExplainsHero({ title, subtitle, className }: ExplainsHeroProps) {
  return (
    <section className={cn(
      "min-h-[50vh] md:min-h-[60vh] py-16 md:py-24 relative overflow-hidden",
      "bg-gradient-to-br from-bubbles-meadow/20 via-background to-bubbles-mist/10",
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [-20, 20, -20],
            y: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            x: [20, -20, 20],
            y: [10, -10, 10],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-10 w-48 h-48 bg-bubbles-gorse/10 rounded-full blur-3xl"
          animate={{ 
            y: [-15, 15, -15],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Floating decorative icons */}
      <motion.div
        className="absolute top-16 left-[10%] text-primary/20"
        animate={{ 
          y: [-10, 10, -10],
          rotate: [-5, 5, -5],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <BookOpen className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-[15%] text-accent/20"
        animate={{ 
          y: [10, -10, 10],
          rotate: [5, -5, 5],
        }}
        transition={{ duration: 7, repeat: Infinity }}
      >
        <GraduationCap className="w-10 h-10 md:w-14 md:h-14" strokeWidth={1} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 left-[5%] text-bubbles-gorse/30"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Scholar Bubbles - looking right */}
          <motion.div 
            className="relative flex-shrink-0 order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glow effect behind Bubbles */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl scale-110" />
            
            {/* The scholar Bubbles image */}
            <motion.div
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 relative"
              animate={{ 
                y: [-5, 5, -5],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <img 
                src={bubblesScholar} 
                alt="Bubbles the Scholar Sheep - Distinguished grammar teacher looking right"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
              
              {/* Sparkle accents around Bubbles */}
              <motion.div
                className="absolute -top-2 -right-2 text-bubbles-gorse"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  rotate: [0, 15, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <motion.div
                className="absolute bottom-4 -left-4 text-accent"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </motion.div>

            {/* Thought bubble with scholarly quote */}
            <motion.div
              className="absolute -top-4 right-0 md:-right-8 max-w-[200px] md:max-w-[240px]"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [0, -5, 0],
              }}
              transition={{ 
                opacity: { delay: 0.5, duration: 0.6 },
                scale: { delay: 0.5, duration: 0.6 },
                y: { delay: 1, duration: 3, repeat: Infinity },
              }}
            >
              <div className="relative bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg">
                <p className="text-sm italic text-foreground/80">
                  "I have studied extensively. In fields. With grass."
                </p>
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-card/90 border-r border-b border-border rotate-45" />
              </div>
            </motion.div>
          </motion.div>

          {/* Hero text - now on the right */}
          <div className="text-center md:text-left flex-1 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Distinguished Scholar</span>
            </motion.div>
            
            <motion.h1
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
            
            {subtitle && (
              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Credentials badge */}
            <motion.div
              className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                Field Studies Expert
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Confidence: Absolute
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
