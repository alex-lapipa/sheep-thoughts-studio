import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Flame, Smile, AlertTriangle, Zap, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

const collections = [
  {
    mode: "innocent",
    title: "Innocent",
    description: "Blissfully unaware wisdom",
    icon: Smile,
    gradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    iconColor: "text-green-500",
  },
  {
    mode: "concerned",
    title: "Concerned",
    description: "Something seems off...",
    icon: AlertTriangle,
    gradient: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-500",
  },
  {
    mode: "triggered",
    title: "Triggered",
    description: "Now wait just a minute",
    icon: Zap,
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-500",
  },
  {
    mode: "savage",
    title: "Savage",
    description: "Gloves are coming off",
    icon: Flame,
    gradient: "from-red-500/20 to-pink-500/20",
    borderColor: "border-red-500/30",
    iconColor: "text-red-500",
  },
  {
    mode: "nuclear",
    title: "Nuclear",
    description: "Maximum wrongness achieved",
    icon: Skull,
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-500",
  },
];

export function ShopCollectionTiles() {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-10"
        >
          <Badge variant="outline" className="mb-3">Shop by Mood</Badge>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            Browse by Escalation Level
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From blissfully ignorant to weapons-grade wrong. Find your vibe.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.mode}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/collections/all?mode=${collection.mode}`}
                className={cn(
                  "group block p-4 md:p-6 rounded-xl border bg-gradient-to-br transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg hover:-translate-y-1",
                  collection.gradient,
                  collection.borderColor
                )}
              >
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 flex items-center justify-center mb-3 md:mb-4",
                  "group-hover:scale-110 transition-transform"
                )}>
                  <collection.icon className={cn("h-5 w-5 md:h-6 md:w-6", collection.iconColor)} />
                </div>
                
                <h3 className="font-display font-bold text-base md:text-lg mb-1">
                  {collection.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {collection.description}
                </p>
                
                <div className="flex items-center text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                  Shop Now
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
