import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WicklowLandscape } from "@/components/WicklowLandscape";
import { BubblesHeroImage } from "@/components/BubblesHeroImage";
import { ShoppingBag, Sparkles, ArrowRight, Star, Truck, Shield, Zap, Heart } from "lucide-react";

const quickBenefits = [
  { icon: Truck, text: "Free Shipping €50+" },
  { icon: Shield, text: "Quality Guarantee" },
  { icon: Zap, text: "Made to Order" },
];

export function ShopHero() {
  return (
    <section className="hero-gradient py-20 md:py-32 overflow-hidden relative">
      {/* Wicklow Landscape Background - Brand Standard */}
      <WicklowLandscape />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badges */}
            <motion.div 
              className="flex items-center flex-wrap gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-bubbles-gorse/30 to-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/40 hover:bg-bubbles-gorse/40 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                New Arrivals
              </Badge>
              <Badge variant="outline" className="px-3 py-1 border-yellow-500/30">
                <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-500 text-yellow-500" />
                4.9 Rated
              </Badge>
            </motion.div>

            {/* Title */}
            <div className="space-y-4">
              <motion.h1 
                className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <span className="block mb-1">Wear Your</span>
                <motion.span 
                  className="block text-accent"
                >
                  Wrong Opinions
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Premium merchandise featuring confidently incorrect wisdom from the Wicklow bogs. 
                Each piece crafted with <span className="text-foreground font-medium">questionable certainty</span>.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent-hover text-accent-foreground font-display hover:scale-105 transition-all gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Shop All Products
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Link to="/collections/all?mode=nuclear">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-display hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
                >
                  🔥 Nuclear Collection
                </Button>
              </Link>
            </motion.div>

            {/* Quick benefits */}
            <motion.div 
              className="flex items-center flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
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
              className="flex items-center gap-6 pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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

          {/* Right Side - Official Bubbles Character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-bubbles-gorse/30 rounded-3xl blur-3xl scale-110 animate-pulse" />
              
              {/* Main character container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <BubblesHeroImage size="hero" className="w-full h-full" />
                </motion.div>

                {/* Floating accent badge */}
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Badge className="bg-foreground text-background font-display text-sm px-4 py-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Bog-Certified
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
