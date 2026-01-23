import { motion } from "framer-motion";
import bubblesFactsHappy from "@/assets/bubbles-facts-happy.jpg";

/**
 * FACTS HERO — Laboratory-themed hero for the Facts page
 * Features happy Bubbles scientist illustration
 */

interface FactsHeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function FactsHero({ title, subtitle, className }: FactsHeroProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className || ""}`}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary/50 via-background to-secondary/30">
          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 md:py-16">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  🔬 Peer-reviewed by grass
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

              {/* Lab credentials */}
              <motion.div
                className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  0% Accuracy Guaranteed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  100% Confidence
                </span>
                <span className="px-2 py-1 text-xs rounded bg-secondary/50 text-secondary-foreground">
                  Bog-Certified
                </span>
              </motion.div>
            </div>

            {/* Scientist Bubbles Image */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.img
                src={bubblesFactsHappy}
                alt="Bubbles the scientist sheep"
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
