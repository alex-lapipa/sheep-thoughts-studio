import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Sparkles, ArrowRight, Star, Truck, Shield, Zap, Heart } from "lucide-react";
import { BubblesSheep } from "./BubblesSheep";
import { cn } from "@/lib/utils";

const floatingProducts = [
  { emoji: "☕", name: "Wisdom Mugs", price: "€18", position: "top-0 right-0", delay: 0.8 },
  { emoji: "👕", name: "Premium Tees", price: "€28", position: "bottom-4 left-0", delay: 1 },
  { emoji: "🎒", name: "Tote Bags", price: "€22", position: "top-1/3 -right-4", delay: 1.2 },
  { emoji: "🧢", name: "Caps & Hats", price: "€24", position: "bottom-1/4 -left-8", delay: 1.4 },
];

const quickBenefits = [
  { icon: Truck, text: "Free Shipping €50+" },
  { icon: Shield, text: "Quality Guarantee" },
  { icon: Zap, text: "Made to Order" },
];

export function ShopHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/5 py-16 md:py-20 lg:py-28">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-bubbles-gorse/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-accent/15 blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full",
              i % 2 === 0 ? "bg-accent/40" : "bg-bubbles-gorse/40"
            )}
            style={{
              width: 4 + (i % 4) * 2,
              height: 4 + (i % 4) * 2,
              left: `${10 + i * 7}%`,
              top: `${15 + (i % 5) * 18}%`,
            }}
            animate={{
              y: [0, -30 - i * 3, 0],
              x: [0, (i % 2 === 0 ? 10 : -10), 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Enhanced badges */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-2 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-gradient-to-r from-bubbles-gorse/30 to-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/40 hover:bg-bubbles-gorse/40 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                New Arrivals
              </Badge>
              <Badge variant="outline" className="hidden sm:flex px-3 py-1 border-yellow-500/30">
                <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-500 text-yellow-500" />
                4.9 Rated
              </Badge>
            </motion.div>

            {/* Headline with gradient animation */}
            <motion.h1 
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="block mb-1">Wear Your</span>
              <motion.span 
                className="block bg-gradient-to-r from-accent via-primary to-bubbles-gorse bg-[length:200%_auto] bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                Wrong Opinions
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Premium merchandise featuring confidently incorrect wisdom from the Wicklow bogs. 
              Each piece crafted with <span className="text-foreground font-medium">questionable certainty</span>.
            </motion.p>

            {/* Enhanced CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto font-display text-base gap-2 h-13 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
              >
                <ShoppingBag className="h-5 w-5" />
                Shop All Products
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/collections/all?mode=nuclear">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto font-display text-base h-13 px-7 border-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
                >
                  🔥 Nuclear Collection
                </Button>
              </Link>
            </motion.div>

            {/* Quick benefits strip */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start flex-wrap gap-4 mt-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {quickBenefits.map((benefit, idx) => (
                <div key={benefit.text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <benefit.icon className="h-4 w-4 text-accent" />
                  <span>{benefit.text}</span>
                  {idx < quickBenefits.length - 1 && (
                    <span className="ml-3 text-border hidden sm:inline">•</span>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-6 mt-8 pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">500+</div>
                <div className="text-xs text-muted-foreground">Happy Customers</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground flex items-center gap-1">
                  4.9 <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-foreground flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> 30+
                </div>
                <div className="text-xs text-muted-foreground">Unique Designs</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Bubbles illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Multi-layer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-bubbles-gorse/40 rounded-full blur-3xl scale-125 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl scale-110" />
              
              {/* Main illustration container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px]">
                <motion.div
                  animate={{ 
                    y: [0, -12, 0],
                    rotate: [-2, 2, -2]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <BubblesSheep size="xl" className="w-full h-full drop-shadow-2xl" />
                </motion.div>

                {/* Floating product hints with enhanced styling */}
                {floatingProducts.map((product, idx) => (
                  <motion.div
                    key={product.name}
                    className={cn(
                      "absolute bg-card/95 backdrop-blur-sm border-2 shadow-xl rounded-xl p-3",
                      product.position
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: product.delay }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <div className="text-xs font-semibold">{product.name}</div>
                        <div className="text-[11px] text-muted-foreground">From {product.price}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* "Shop now" floating badge */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <Badge className="bg-foreground text-background font-display text-sm px-4 py-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    New drops weekly
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
