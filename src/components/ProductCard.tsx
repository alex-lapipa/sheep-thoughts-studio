import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "./ModeBadge";
import { ecommerceTracking } from "@/lib/ecommerceTracking";

interface ProductCardProps {
  product: ShopifyProduct;
  position?: number;
}

export function ProductCard({ product, position }: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hasTrackedImpression = useRef(false);
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  
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
              position
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 } // Track when 50% of card is visible
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [node.id, node.title, price.amount, position]);

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
    
    // Track add to cart in DB
    ecommerceTracking.addToCart(
      node.id,
      node.title,
      firstVariant.id,
      parseFloat(firstVariant.price?.amount || '0')
    );
    
    toast.success("Added to cart!", {
      description: node.title,
    });
  };

  return (
    <Link ref={cardRef} to={`/product/${node.handle}`} className="group">
      <div className="product-card bg-card rounded-xl overflow-hidden border border-border">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {image ? (
            <img 
              src={image.url} 
              alt={image.altText || node.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {modeTag && (
            <div className="absolute top-3 left-3">
              <ModeBadge mode={modeTag} />
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-accent transition-colors">
              {node.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {node.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-lg">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </span>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isLoading || !firstVariant?.availableForSale}
              className="bg-accent hover:bg-accent-hover text-accent-foreground"
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
          </div>
        </div>
      </div>
    </Link>
  );
}
