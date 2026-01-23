import { motion } from "framer-motion";
import { Compass, Mountain, Map } from "lucide-react";
import bubblesAdventuresHappy from "@/assets/bubbles-adventures-happy.jpg";

/**
 * ADVENTURES HERO — Wicklow wilderness-themed hero
 * Features happy Bubbles explorer illustration
 */

interface AdventuresHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function AdventuresHero({ title, subtitle, className }: AdventuresHeroProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className || ""}`}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/50 via-background to-secondary/30">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 md:py-16">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 justify-center md:justify-start mb-4"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  <Compass className="w-3 h-3" />
                  Directionally challenged
                </span>
              </motion.div>

              <motion.h1
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {title}
              </motion.h1>

              {subtitle && (
                <motion.p
                  className="text-lg md:text-xl text-muted-foreground max-w-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Explorer credentials */}
              <motion.div
                className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Mountain className="w-3 h-3" />
                  Never Lost
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  <Map className="w-3 h-3" />
                  Maps Optional
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  Wicklow Native
                </span>
              </motion.div>
            </div>

            {/* Explorer Bubbles Image */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.img
                src={bubblesAdventuresHappy}
                alt="Bubbles the explorer sheep"
                className="w-full max-w-sm rounded-2xl shadow-2xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
