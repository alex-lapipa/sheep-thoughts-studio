import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StickyAddToCartProps {
  productTitle: string;
  price: { amount: string; currencyCode: string } | undefined;
  onAddToCart: () => void;
  isLoading: boolean;
  isAvailable: boolean;
  triggerOffset?: number; // Scroll offset to show the bar
}

export function StickyAddToCart({
  productTitle,
  price,
  onAddToCart,
  isLoading,
  isAvailable,
  triggerOffset = 400,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show after scrolling past the main add-to-cart button
      setIsVisible(scrollY > triggerOffset);

      // Check if near bottom of page
      setIsAtBottom(scrollY + windowHeight >= documentHeight - 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerOffset]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only show on mobile/tablet
  if (!isAvailable) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
            "bg-background/95 backdrop-blur-lg border-t border-border",
            "safe-area-inset-bottom"
          )}
        >
          <div className="container py-3">
            <div className="flex items-center gap-3">
              {/* Product info (compact) */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium text-sm truncate">
                  {productTitle}
                </p>
                <p className="font-display text-accent font-semibold">
                  {price?.currencyCode} {parseFloat(price?.amount || "0").toFixed(2)}
                </p>
              </div>

              {/* Scroll to top button */}
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={scrollToTop}
                aria-label="Scroll to top"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>

              {/* Add to Cart button */}
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-hover text-accent-foreground font-display h-11 px-6"
                onClick={onAddToCart}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Safe area spacing for iOS */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
