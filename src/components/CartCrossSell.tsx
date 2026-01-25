import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Sparkles } from "lucide-react";
import { optimizeShopifyImage, IMAGE_PRESETS } from "@/lib/imageOptimization";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartCrossSellProps {
  cartItems: CartItem[];
  maxItems?: number;
  className?: string;
}

/**
 * Cross-sell component for cart drawer
 * Shows complementary products based on cart contents
 */
export function CartCrossSell({ cartItems, maxItems = 3, className }: CartCrossSellProps) {
  const { data: allProducts, isLoading } = useProducts(undefined, 30);
  const { addItem, isLoading: isAdding } = useCartStore();

  const recommendations = useMemo(() => {
    if (!allProducts?.length || !cartItems.length) return [];

    // Get cart item IDs and extract product info
    const cartProductIds = new Set(cartItems.map(item => item.product.node.id));
    const cartTags = new Set<string>();
    const cartProductTypes = new Set<string>();

    cartItems.forEach(item => {
      item.product.node.tags?.forEach(tag => cartTags.add(tag.toLowerCase()));
      // Extract product type from title
      const title = item.product.node.title.toLowerCase();
      ['tee', 't-shirt', 'hoodie', 'mug', 'tote', 'cap', 'pin'].forEach(type => {
        if (title.includes(type)) cartProductTypes.add(type);
      });
    });

    // Score products for cross-sell potential
    const scored = allProducts
      .filter(p => !cartProductIds.has(p.node.id)) // Exclude items already in cart
      .map(product => {
        let score = 0;
        const productTags = product.node.tags?.map(t => t.toLowerCase()) || [];
        const productTitle = product.node.title.toLowerCase();
        
        // Determine product type
        let productType = '';
        ['tee', 't-shirt', 'hoodie', 'mug', 'tote', 'cap', 'pin'].forEach(type => {
          if (productTitle.includes(type)) productType = type;
        });

        // Cross-sell priority: DIFFERENT product types (complementary)
        if (productType && !cartProductTypes.has(productType)) {
          score += 5; // High priority for complementary items
        }

        // Bonus for matching tags (same theme/collection)
        productTags.forEach(tag => {
          if (cartTags.has(tag)) score += 1;
        });

        // Check for mode tags matching
        const modeTags = ['innocent', 'concerned', 'triggered', 'savage'];
        const productMode = productTags.find(t => modeTags.includes(t));
        const cartModes = Array.from(cartTags).filter(t => modeTags.includes(t));
        if (productMode && cartModes.includes(productMode)) {
          score += 2;
        }

        // Available for sale bonus
        const hasAvailableVariant = product.node.variants.edges.some(
          v => v.node.availableForSale
        );
        if (hasAvailableVariant) score += 1;

        return { product, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map(item => item.product);

    // If not enough scored products, fill with random available products
    if (scored.length < maxItems) {
      const remaining = allProducts
        .filter(p => 
          !cartProductIds.has(p.node.id) && 
          !scored.find(r => r.node.id === p.node.id) &&
          p.node.variants.edges.some(v => v.node.availableForSale)
        )
        .slice(0, maxItems - scored.length);
      return [...scored, ...remaining];
    }

    return scored;
  }, [allProducts, cartItems, maxItems]);

  const handleQuickAdd = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges.find(v => v.node.availableForSale)?.node;
    if (!variant) {
      toast.error("This product is currently unavailable");
      return;
    }

    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success(`Added ${product.node.title} to cart`);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>You may also like</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-28">
              <Skeleton className="w-28 h-28 rounded-md" />
              <Skeleton className="h-3 w-20 mt-2" />
              <Skeleton className="h-3 w-12 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-accent" />
        <span>Complete your look</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {recommendations.map((product) => (
          <CrossSellCard 
            key={product.node.id} 
            product={product} 
            onQuickAdd={handleQuickAdd}
            isAdding={isAdding}
          />
        ))}
      </div>
    </div>
  );
}

interface CrossSellCardProps {
  product: ShopifyProduct;
  onQuickAdd: (product: ShopifyProduct) => void;
  isAdding: boolean;
}

function CrossSellCard({ product, onQuickAdd, isAdding }: CrossSellCardProps) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const hasVariants = node.variants.edges.length > 1;

  return (
    <div className="flex-shrink-0 w-28 group">
      <Link to={`/product/${node.handle}`} className="block">
        <div className="relative w-28 h-28 bg-muted rounded-md overflow-hidden">
          {image ? (
            <img
              src={optimizeShopifyImage(image.url, IMAGE_PRESETS.cartThumbnail)}
              alt={image.altText || node.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>
      </Link>
      
      <div className="mt-2">
        <Link to={`/product/${node.handle}`}>
          <h4 className="text-xs font-medium line-clamp-2 leading-tight group-hover:text-accent transition-colors">
            {node.title}
          </h4>
        </Link>
        <p className="text-xs font-semibold mt-1">
          €{parseFloat(price.amount).toFixed(2)}
        </p>
        
        {hasVariants ? (
          <Link to={`/product/${node.handle}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs"
            >
              View options
            </Button>
          </Link>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 h-7 text-xs"
            onClick={(e) => {
              e.preventDefault();
              onQuickAdd(product);
            }}
            disabled={isAdding}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}
