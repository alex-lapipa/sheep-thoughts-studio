import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "./ModeBadge";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
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
    
    toast.success("Added to cart!", {
      description: node.title,
    });
  };

  return (
    <Link to={`/product/${node.handle}`} className="group">
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
