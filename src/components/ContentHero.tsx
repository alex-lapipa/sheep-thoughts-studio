import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * CONTENT HERO — Brand-consistent hero for content pages
 * 
 * Uses Ireland Green primary color, consistent animations,
 * and standardized layout across Facts, Adventures, Scenarios, etc.
 */

interface ContentHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  credentials?: Array<{
    icon?: LucideIcon;
    text: string;
  }>;
  className?: string;
  imagePosition?: "left" | "right";
}

export function ContentHero({
  title,
  subtitle,
  image,
  imageAlt,
  badge,
  credentials = [],
  className,
  imagePosition = "right",
}: ContentHeroProps) {
  const BadgeIcon = badge?.icon;

  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <div className="container relative">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20">
          <div className={cn(
            "relative z-10 flex flex-col items-center justify-between gap-8 px-8 py-12 md:py-16",
            imagePosition === "right" ? "md:flex-row" : "md:flex-row-reverse"
          )}>
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              {badge && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 justify-center md:justify-start mb-4"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/15 text-primary border border-primary/20">
                    {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                    {badge.text}
                  </span>
                </motion.div>
              )}

              <motion.h1
                className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"
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

              {/* Credentials */}
              {credentials.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {credentials.map((credential, index) => {
                    const CredIcon = credential.icon;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-secondary/60 text-secondary-foreground border border-border/50"
                      >
                        {CredIcon && <CredIcon className="w-3 h-3 text-primary" />}
                        {credential.text}
                      </span>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Character Image */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Glow effect using primary color */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-3xl scale-110" />
              
              <motion.img
                src={image}
                alt={imageAlt}
                className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl shadow-2xl border border-primary/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Decorative background elements using primary/accent */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl rotate-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
