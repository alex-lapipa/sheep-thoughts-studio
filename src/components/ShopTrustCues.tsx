import { motion } from "framer-motion";
import { Truck, Shield, Leaf, RefreshCw, Clock, Heart } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Delivered straight from our print partners to your door",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Sustainably sourced materials & ethical production",
  },
  {
    icon: RefreshCw,
    title: "Made to Order",
    description: "Each piece printed fresh, reducing waste",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Premium materials that last wash after wash",
  },
  {
    icon: Clock,
    title: "5-12 Day Delivery",
    description: "Express options available at checkout",
  },
  {
    icon: Heart,
    title: "100% Satisfaction",
    description: "Love it or we'll make it right",
  },
];

export function ShopTrustCues() {
  return (
    <section className="py-12 md:py-16 bg-secondary/30 border-y border-border/50">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Why Shop With Bubbles?
          </h2>
          <p className="text-muted-foreground">
            Questionable wisdom, unquestionable quality
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-background/50 hover:bg-background transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
