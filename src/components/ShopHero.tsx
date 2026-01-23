import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles, ArrowRight, Star } from "lucide-react";
import { BubblesSheep } from "./BubblesSheep";

export function ShopHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/5 py-16 md:py-24 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-bubbles-gorse/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-[15%] w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        
        {/* Floating shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-accent/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <Badge className="bg-bubbles-gorse/20 text-bubbles-gorse border-bubbles-gorse/30 hover:bg-bubbles-gorse/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Made to Order
              </Badge>
              <Badge variant="outline" className="hidden sm:flex">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                Premium Quality
              </Badge>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6">
              <span className="block">Wear Your</span>
              <span className="block bg-gradient-to-r from-accent via-primary to-bubbles-gorse bg-clip-text text-transparent">
                Wrong Opinions
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 md:mb-8">
              Premium merchandise featuring confidently incorrect wisdom from the Wicklow bogs. 
              Each piece crafted with questionable certainty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Button size="lg" className="w-full sm:w-auto font-display text-base gap-2 h-12 px-8">
                <ShoppingBag className="h-5 w-5" />
                Shop All Products
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Link to="/collections/all?mode=nuclear">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-display text-base h-12 px-6">
                  🔥 Nuclear Collection
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">500+</div>
                <div className="text-xs text-muted-foreground">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">30+</div>
                <div className="text-xs text-muted-foreground">Unique Designs</div>
              </div>
            </div>
          </motion.div>

          {/* Bubbles illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-bubbles-gorse/30 rounded-full blur-3xl scale-110" />
              
              {/* Main illustration container */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [-2, 2, -2]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <BubblesSheep size="xl" className="w-full h-full" />
                </motion.div>

                {/* Floating product hints */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-card border shadow-lg rounded-xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☕</span>
                    <div>
                      <div className="text-xs font-medium">Wisdom Mugs</div>
                      <div className="text-[10px] text-muted-foreground">From €18</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-4 bg-card border shadow-lg rounded-xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👕</span>
                    <div>
                      <div className="text-xs font-medium">Premium Tees</div>
                      <div className="text-[10px] text-muted-foreground">From €28</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-8 bg-card border shadow-lg rounded-xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧢</span>
                    <div>
                      <div className="text-xs font-medium">Caps & Hats</div>
                      <div className="text-[10px] text-muted-foreground">From €24</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
