import { motion } from "framer-motion";
import { Truck, Shield, Leaf, RefreshCw, Clock, Heart, CheckCircle, Award, Recycle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryTrustItems = [
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Delivered from print partners to your door",
    highlight: true,
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Premium materials, wash after wash",
    highlight: true,
  },
  {
    icon: RefreshCw,
    title: "Made to Order",
    description: "Each piece printed fresh for you",
    highlight: true,
  },
];

const secondaryTrustItems = [
  { icon: Leaf, text: "Eco-Friendly Materials" },
  { icon: Clock, text: "5-12 Day Delivery" },
  { icon: Heart, text: "100% Satisfaction" },
  { icon: Award, text: "Premium Quality" },
  { icon: Recycle, text: "Sustainable Production" },
  { icon: Globe, text: "EU & US Fulfillment" },
];

const guarantees = [
  "Secure checkout",
  "No-hassle returns",
  "Tracked shipping",
  "Premium packaging",
];

export function ShopTrustCues() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 border-y border-border/30">
      <div className="container px-4 md:px-6">
        {/* Primary trust pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Why Shop With Bubbles?
          </h2>
          <p className="text-muted-foreground">
            Questionable wisdom, <span className="text-foreground font-medium">unquestionable quality</span>
          </p>
        </motion.div>

        {/* Main trust cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {primaryTrustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative group p-6 rounded-2xl border-2 transition-all duration-300",
                "bg-gradient-to-br from-card to-background",
                "hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10",
                item.highlight ? "border-accent/30" : "border-border"
              )}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                    "bg-gradient-to-br from-accent/20 to-primary/10",
                    "group-hover:from-accent/30 group-hover:to-primary/20 transition-colors"
                  )}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <item.icon className="h-7 w-7 text-accent" />
                </motion.div>
                <h3 className="font-display text-lg font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-accent/10 to-transparent rounded-tr-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Secondary trust badges - scrolling strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden py-6 -mx-4 px-4"
        >
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
          
          <motion.div
            className="flex gap-8 md:gap-12"
            animate={{ x: [0, -600] }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...secondaryTrustItems, ...secondaryTrustItems, ...secondaryTrustItems].map((item, index) => (
              <div
                key={`${item.text}-${index}`}
                className="flex items-center gap-2.5 text-muted-foreground whitespace-nowrap shrink-0"
              >
                <item.icon className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom guarantees bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 pt-8 border-t border-border/50"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={guarantee}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{guarantee}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
