import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RecentlyViewedProductsProps {
  excludeProductId?: string;
  title?: string;
  maxItems?: number;
}

export function RecentlyViewedProducts({
  excludeProductId,
  title = "Recently Viewed",
  maxItems = 6,
}: RecentlyViewedProductsProps) {
  const { getRecentlyViewed } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const products = getRecentlyViewed(excludeProductId).slice(0, maxItems);

  // Update scroll buttons visibility
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();

    return () => container.removeEventListener("scroll", updateScrollButtons);
  }, [products.length]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display font-semibold">{title}</h3>
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg h-8 w-8",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-background/90 backdrop-blur-sm hover:bg-background",
            !canScrollLeft && "hidden"
          )}
          onClick={() => scrollByAmount("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.handle}`}
              className="flex-shrink-0 w-[140px] md:w-[160px] group/item"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium truncate">{product.title}</p>
                  <p className="text-xs text-accent font-semibold">
                    {product.currencyCode} {parseFloat(product.price).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg h-8 w-8",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-background/90 backdrop-blur-sm hover:bg-background",
            !canScrollRight && "hidden"
          )}
          onClick={() => scrollByAmount("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
