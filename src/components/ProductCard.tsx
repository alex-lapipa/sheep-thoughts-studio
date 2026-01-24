import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "./ModeBadge";
import { ProductQuickView } from "./ProductQuickView";
import { WishlistButton } from "./WishlistButton";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { useABProductTracking } from "@/hooks/useABTracking";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ShopifyProduct;
  position?: number;
  listName?: string;
  enableHoverQuickView?: boolean;
}

export function ProductCard({ product, position, listName, enableHoverQuickView = true }: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hasTrackedImpression = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const { trackProductView, trackAddToCart } = useABProductTracking();
  
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants.edges[0]?.node;
  
  // Get mode from tags
  const modeTag = node.tags?.find(tag => 
    ['innocent', 'concerned', 'triggered', 'savage'].includes(tag.toLowerCase())
  )?.toLowerCase() as BubbleMode | undefined;

  // Track product impression when card becomes visible
  useEffect(() => {
    const element = cardRef.current;
    if (!element || hasTrackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression.current) {
            hasTrackedImpression.current = true;
            ecommerceTracking.productImpression(
              node.id,
              node.title,
              parseFloat(price.amount),
              position,
              listName
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [node.id, node.title, price.amount, position, listName]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;
    
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    });
    
    ecommerceTracking.addToCart(
      node.id,
      node.title,
      firstVariant.id,
      parseFloat(firstVariant.price?.amount || '0')
    );
    
    // Track for A/B test conversion
    trackAddToCart(node.id, node.title, parseFloat(firstVariant.price?.amount || '0'));
    
    toast.success("Added to cart!", {
      description: node.title,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleProductClick = () => {
    ecommerceTracking.viewProduct(
      node.id,
      node.title,
      parseFloat(price.amount)
    );
    
    // Track for A/B test conversion
    trackProductView(node.id, node.title);
  };

  // Hover-triggered Quick View (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (!enableHoverQuickView || window.innerWidth < 640) return;
    setIsHovering(true);
    
    // Open Quick View after 600ms of hovering
    hoverTimeoutRef.current = setTimeout(() => {
      setQuickViewOpen(true);
    }, 600);
  }, [enableHoverQuickView]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Link 
        ref={cardRef} 
        to={`/product/${node.handle}`} 
        className="group block touch-manipulation"
        onClick={handleProductClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onTouchCancel={() => setIsPressed(false)}
      >
        <div className={cn(
          "product-card bg-card rounded-xl overflow-hidden border border-border transition-all duration-200",
          isPressed && "scale-[0.98] shadow-sm",
          isHovering && enableHoverQuickView && "ring-2 ring-accent/50 shadow-lg",
          "active:scale-[0.98]"
        )}>
          {/* Image Container */}
          <div className="aspect-square bg-muted relative overflow-hidden">
            {image ? (
              <img 
                src={image.url} 
                alt={image.altText || node.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            
            {/* Mode Badge */}
            {modeTag && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <ModeBadge mode={modeTag} />
              </div>
            )}
            
            {/* Wishlist Button */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <WishlistButton product={product} />
            </div>
            
            {/* Desktop: Quick View Button (hover) */}
            <div className={cn(
              "absolute bottom-3 left-1/2 -translate-x-1/2 transition-all hidden sm:flex gap-2",
              isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
              <Button
                size="sm"
                variant="secondary"
                className="bg-background/90 backdrop-blur-sm shadow-lg"
                onClick={handleQuickView}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Quick View
              </Button>
              {isHovering && (
                <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md self-center">
                  Hold to preview
                </span>
              )}
            </div>
            
            {/* Mobile: Quick Add Button (always visible) */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 h-9 w-9 rounded-full shadow-md sm:hidden bg-background/90 backdrop-blur-sm"
              onClick={handleAddToCart}
              disabled={isLoading || !firstVariant?.availableForSale}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Product Info */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div>
              <h3 className="font-display font-semibold text-base sm:text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2">
                {node.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2 hidden sm:block">
                {node.description}
              </p>
            </div>
            
            {/* Price and Add Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-bold text-base sm:text-lg">
                {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
              </span>
              
              {/* Desktop: Full Add Button */}
              <Button 
                size="sm" 
                onClick={handleAddToCart}
                disabled={isLoading || !firstVariant?.availableForSale}
                className="bg-accent hover:bg-accent-hover text-accent-foreground hidden sm:flex"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
              
              {/* Mobile: Quick View Link */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleQuickView}
                className="sm:hidden text-xs h-8 px-2"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <ProductQuickView 
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
