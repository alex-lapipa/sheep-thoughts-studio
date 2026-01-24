import { useEffect, useRef, useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollableProductGridProps {
  products: ShopifyProduct[];
  isLoading?: boolean;
  listName?: string;
}

export function ScrollableProductGrid({ 
  products, 
  isLoading, 
  listName = "default" 
}: ScrollableProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasTrackedListView = useRef(false);
  const prevProductIds = useRef<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Track product list view when products load
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    
    const productIds = products.map(p => p.node.id).join(",");
    if (productIds === prevProductIds.current) return;
    
    prevProductIds.current = productIds;
    hasTrackedListView.current = true;
    
    ecommerceTracking.viewProductList(
      listName,
      products.map(p => ({
        id: p.node.id,
        title: p.node.title,
        price: parseFloat(p.node.priceRange.minVariantPrice.amount),
      }))
    );
  }, [products, isLoading, listName]);

  // Update scroll button visibility
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();
    
    return () => container.removeEventListener('scroll', updateScrollButtons);
  }, [products]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.cursor = 'grab';
      }
    }
  };

  // Scroll button handlers
  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex gap-4 overflow-hidden pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🐑</div>
        <h3 className="font-display text-xl font-semibold mb-2">No products yet</h3>
        <p className="text-muted-foreground">
          Bubbles is still thinking about what to sell...
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-background/90 backdrop-blur-sm hover:bg-background",
          !canScrollLeft && "hidden"
        )}
        onClick={() => scrollByAmount('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product, index) => (
          <div 
            key={product.node.id} 
            className="flex-shrink-0 w-[280px] md:w-[320px] snap-start"
            onClick={(e) => {
              // Prevent click if we were dragging
              if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <ProductCard 
              product={product} 
              position={index + 1}
              listName={listName}
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-background/90 backdrop-blur-sm hover:bg-background",
          !canScrollRight && "hidden"
        )}
        onClick={() => scrollByAmount('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Scroll hint indicator */}
      <div className="flex justify-center mt-4 gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <ChevronLeft className="h-3 w-3" />
          Drag or scroll to browse
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
