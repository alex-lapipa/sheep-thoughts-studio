import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AUTO_ROTATE_INTERVAL = 5000;
const SWIPE_THRESHOLD = 50;

export function FeaturedProductsCarousel() {
  const { data: products, isLoading } = useProducts(undefined, 12);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);
  
  // Touch handling for swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, (products?.length || 0) - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Auto-rotation
  useEffect(() => {
    if (isPaused || !products?.length) return;

    const interval = setInterval(nextSlide, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, products?.length, nextSlide]);

  // Reset index when products change
  useEffect(() => {
    setCurrentIndex(0);
  }, [products?.length]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <Skeleton className="h-8 md:h-10 w-48 md:w-64 mb-2" />
              <Skeleton className="h-5 md:h-6 w-36 md:w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72 md:h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) return null;

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);
  const filledProducts = visibleProducts.length < itemsPerView
    ? [...visibleProducts, ...products.slice(0, itemsPerView - visibleProducts.length)]
    : visibleProducts;

  return (
    <section 
      className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative elements - hidden on mobile */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-bubbles-gorse/10 blur-3xl hidden sm:block" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl hidden sm:block" />

      <div className="container px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-bubbles-gorse/20 text-bubbles-gorse border-bubbles-gorse/30 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Bestsellers
              </Badge>
              <Badge variant="outline" className="text-xs hidden sm:flex">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Top Picks
              </Badge>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              Shop the Flock
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Premium merch for confidently wrong enthusiasts
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Carousel controls - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full"
                aria-label="Previous products"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "h-8 w-8 md:h-9 md:w-9 rounded-full transition-colors",
                  isPaused ? "text-muted-foreground" : "text-primary"
                )}
                aria-label={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full"
                aria-label="Next products"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Link to="/collections/all">
              <Button variant="outline" size="sm" className="font-display text-xs sm:text-sm h-8 sm:h-9">
                View All
                <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress indicator - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: isPaused ? `${((currentIndex + 1) / (maxIndex + 1)) * 100}%` : "100%" 
              }}
              transition={{
                duration: isPaused ? 0.3 : AUTO_ROTATE_INTERVAL / 1000,
                ease: "linear",
              }}
              key={isPaused ? "paused" : currentIndex}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium min-w-[3rem] text-right">
            {currentIndex + 1} / {maxIndex + 1}
          </span>
        </div>

        {/* Carousel - Touch enabled */}
        <div 
          ref={containerRef}
          className="relative touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {filledProducts.map((product, index) => (
                <motion.div
                  key={`${product.node.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={product} 
                    listName="homepage_carousel"
                    position={currentIndex + index}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Mobile swipe hint */}
          <div className="flex sm:hidden justify-center mt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ChevronLeft className="h-3 w-3" />
              Swipe to browse
              <ChevronRight className="h-3 w-3" />
            </p>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-primary w-5 sm:w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
