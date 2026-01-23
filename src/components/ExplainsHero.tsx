import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";
import bubblesExplainsHappy from "@/assets/bubbles-explains-happy.jpg";

interface ExplainsHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function ExplainsHero({ title, subtitle, className }: ExplainsHeroProps) {
  return (
    <section className={cn(
      "relative py-12 md:py-20 overflow-hidden",
      "bg-gradient-to-br from-secondary/30 via-background to-secondary/20",
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            x: [-20, 20, -20],
            y: [-10, 10, -10],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          animate={{ 
            x: [20, -20, 20],
            y: [10, -10, 10],
          }}
          transition={{ duration: 18, repeat: Infinity }}
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

      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <motion.div
            className="relative flex justify-center md:justify-start order-2 md:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.img
              src={bubblesExplainsHappy}
              alt="Bubbles the scholar sheep"
              className="w-full max-w-md rounded-2xl shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Sparkle accent */}
            <motion.div
              className="absolute -top-2 -right-2 text-primary"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.div>

          {/* Text content */}
          <div className="text-center md:text-left order-1 md:order-2">
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

            {/* Credentials */}
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
