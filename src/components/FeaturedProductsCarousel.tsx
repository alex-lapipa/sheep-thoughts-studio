import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { toast } from "sonner";

const SCROLL_SPEED = 0.3; // Pixels per frame - slow scroll

interface ParallaxCardProps {
  product: {
    node: {
      id: string;
      title: string;
      description: string;
      handle: string;
      tags: string[];
      priceRange: {
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        };
      };
      images: {
        edges: Array<{
          node: {
            url: string;
            altText: string | null;
          };
        }>;
      };
      variants: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            availableForSale: boolean;
          };
        }>;
      };
    };
  };
  index: number;
}

function ParallaxCard({ product, index }: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem, isLoading } = useCartStore();
  
  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring for parallax effect
  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const scale = useSpring(1, springConfig);
  
  // Image parallax - moves opposite to tilt
  const imageX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springConfig);
  const imageY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  const image = product.node.images.edges[0]?.node;
  const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
  const variant = product.node.variants.edges[0]?.node;
  
  // Determine mode from tags
  const modeTag = product.node.tags.find(tag => tag.startsWith('mode:'))?.replace('mode:', '') || 'innocent';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variant) return;
    
    // Build the cart item
    const cartItem = {
      product: product as import("@/lib/shopify").ShopifyProduct,
      variantId: variant.id,
      variantTitle: variant.title,
      price: product.node.priceRange.minVariantPrice,
      quantity: 1,
      selectedOptions: [],
    };
    
    await addItem(cartItem);
    
    ecommerceTracking.addToCart(
      product.node.id,
      product.node.title,
      variant.id,
      price,
      1
    );
    
    toast.success("Added to cart!", {
      description: product.node.title,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      className="relative group cursor-pointer flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px]"
    >
      <Link to={`/product/${product.node.handle}`}>
        {/* Glassmorphism card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/5 dark:from-white/10 dark:to-black/20 pointer-events-none z-10" />
          
          {/* Shine effect on hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
            style={{
              transform: "translateX(-100%)",
            }}
            animate={{
              transform: ["translateX(-100%)", "translateX(100%)"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />

          {/* Image container with parallax */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/50 to-muted/30">
            {image ? (
              <motion.img
                src={image.url}
                alt={image.altText || product.node.title}
                className="w-full h-full object-cover"
                style={{
                  x: imageX,
                  y: imageY,
                  scale: 1.1, // Slightly larger to allow parallax movement
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🐑</div>
            )}
            
            {/* Mode badge - using semantic mode colors */}
            <div className="absolute top-3 left-3 z-30">
              <Badge 
                className={cn(
                  "backdrop-blur-md border-border/30 text-xs font-medium shadow-lg",
                  modeTag === 'triggered' && "bg-bubbles-mode-triggered/80 text-primary-foreground",
                  modeTag === 'savage' && "bg-destructive/80 text-destructive-foreground",
                  modeTag === 'nuclear' && "bg-accent/80 text-accent-foreground",
                  modeTag === 'innocent' && "bg-bubbles-heather/80 text-primary-foreground",
                  modeTag === 'concerned' && "bg-bubbles-gorse/80 text-foreground",
                  !['triggered', 'savage', 'nuclear', 'innocent', 'concerned'].includes(modeTag) && "bg-primary/80 text-primary-foreground"
                )}
              >
                {modeTag}
              </Badge>
            </div>
            
            {/* New badge for recent products */}
            {index < 5 && (
              <div className="absolute top-3 right-3 z-30">
                <Badge className="bg-bubbles-gorse/90 text-foreground text-xs font-bold backdrop-blur-md shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  NEW
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 relative z-10">
            <h3 className="font-display text-lg font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.node.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.node.description || "Premium Bubbles merch"}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold text-foreground">
                €{price.toFixed(2)}
              </span>
              
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isLoading || !variant?.availableForSale}
                className="bg-primary/90 hover:bg-primary backdrop-blur-sm text-sm h-9 px-4 shadow-lg"
              >
                {!variant?.availableForSale ? "Sold Out" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedProductsCarousel() {
  // Fetch T-shirts only, sorted by newest (created_at desc in Shopify)
  const { data: products, isLoading } = useProducts("product_type:T-Shirt", 20);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const scrollPositionRef = useRef(0);

  // Reverse products to show newest first
  const sortedProducts = products ? [...products].reverse() : [];

  // Continuous slow scroll animation
  useEffect(() => {
    if (!scrollRef.current || sortedProducts.length === 0) return;

    const scroll = () => {
      if (!scrollRef.current || isPaused) {
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }

      scrollPositionRef.current += SCROLL_SPEED;
      
      // Get the total scrollable width
      const scrollWidth = scrollRef.current.scrollWidth;
      const containerWidth = scrollRef.current.offsetWidth;
      const maxScroll = scrollWidth - containerWidth;
      
      // Loop back when we reach the end
      if (scrollPositionRef.current >= maxScroll) {
        scrollPositionRef.current = 0;
      }
      
      scrollRef.current.scrollLeft = scrollPositionRef.current;
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sortedProducts.length, isPaused]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <Skeleton className="h-8 md:h-10 w-48 md:w-64 mb-2" />
              <Skeleton className="h-5 md:h-6 w-36 md:w-48" />
            </div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[420px] w-[320px] rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!sortedProducts.length) return null;

  // Duplicate products for infinite scroll effect
  const displayProducts = [...sortedProducts, ...sortedProducts];

  return (
    <section 
      className="py-14 md:py-20 lg:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden"
    >
      {/* Enhanced decorative blurs */}
      <div className="absolute top-10 left-[5%] w-40 h-40 rounded-full bg-bubbles-gorse/15 blur-3xl hidden sm:block" />
      <div className="absolute bottom-20 right-[10%] w-56 h-56 rounded-full bg-accent/10 blur-3xl hidden sm:block" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container px-4 md:px-6 relative z-10 mb-8 md:mb-10">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-gradient-to-r from-bubbles-gorse/30 to-bubbles-gorse/10 text-bubbles-gorse border-bubbles-gorse/40 text-xs px-3">
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Lost in the City
              </Badge>
              <Badge variant="outline" className="text-xs hidden sm:flex border-primary/30">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                New Collection
              </Badge>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
              Shop the Flock
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md">
              Post-punk merch for the <span className="text-foreground font-medium">confidently wrong</span>
            </p>
          </div>
          
          <Link to="/collections/all">
            <Button className="font-display text-sm h-10 px-5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Continuous scroll carousel */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-hidden px-8 md:px-16 py-4"
          style={{ perspective: "1000px" }}
        >
          {displayProducts.map((product, index) => (
            <ParallaxCard 
              key={`${product.node.id}-${index}`}
              product={product}
              index={index % sortedProducts.length}
            />
          ))}
        </div>
      </div>

      {/* Pause indicator */}
      <div className="flex justify-center mt-6">
        <p className={cn(
          "text-xs text-muted-foreground transition-opacity duration-300",
          isPaused ? "opacity-100" : "opacity-50"
        )}>
          {isPaused ? "Paused — hover to browse" : "Hover to pause"}
        </p>
      </div>
    </section>
  );
}
