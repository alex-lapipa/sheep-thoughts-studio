import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LowStockBadge, calculateTotalInventory } from "./LowStockBadge";
import { WishlistButton } from "./WishlistButton";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductRecommendationsProps {
  currentProductId: string;
  currentProductTags?: string[];
  currentProductType?: string;
  maxRecommendations?: number;
  className?: string;
}

/**
 * "You May Also Like" product recommendations component
 * Uses tag matching, product type, and mode to find related products
 */
export function ProductRecommendations({
  currentProductId,
  currentProductTags = [],
  currentProductType,
  maxRecommendations = 4,
  className,
}: ProductRecommendationsProps) {
  // Fetch a larger pool of products to filter from
  const { data: allProducts, isLoading } = useProducts(undefined, 50);

  const recommendations = useMemo(() => {
    if (!allProducts?.length) return [];

    // Extract meaningful tags (exclude mode tags for scoring, use them separately)
    const modeTags = ['innocent', 'concerned', 'triggered', 'savage'];
    const currentMode = currentProductTags.find(tag => 
      modeTags.includes(tag.toLowerCase())
    )?.toLowerCase();
    
    const meaningfulTags = currentProductTags
      .filter(tag => !modeTags.includes(tag.toLowerCase()))
      .map(t => t.toLowerCase());

    // Score each product based on relevance
    const scoredProducts = allProducts
      .filter(p => p.node.id !== currentProductId) // Exclude current product
      .map(product => {
        let score = 0;
        const productTags = product.node.tags?.map(t => t.toLowerCase()) || [];
        const productTitle = product.node.title.toLowerCase();
        
        // Extract product type from title/tags
        const getProductType = (title: string, tags: string[]) => {
          const types = ['tee', 't-shirt', 'hoodie', 'mug', 'tote', 'cap', 'pin'];
          for (const type of types) {
            if (title.includes(type) || tags.some(t => t.includes(type))) {
              return type;
            }
          }
          return null;
        };

        const thisProductType = getProductType(productTitle, productTags);
        const currentType = currentProductType?.toLowerCase() || 
          getProductType('', meaningfulTags);

        // Score: Same product type (highest priority for cross-sell)
        if (thisProductType && currentType && thisProductType === currentType) {
          score += 3;
        }

        // Score: Same mode/mood
        const productMode = productTags.find(t => modeTags.includes(t));
        if (currentMode && productMode === currentMode) {
          score += 2;
        }

        // Score: Matching tags (1 point per match)
        meaningfulTags.forEach(tag => {
          if (productTags.includes(tag) || productTitle.includes(tag)) {
            score += 1;
          }
        });

        // Bonus: Different product type (encourages variety)
        if (thisProductType && currentType && thisProductType !== currentType) {
          score += 0.5;
        }

        return { product, score };
      })
      .filter(item => item.score > 0) // Only include products with some relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
      .map(item => item.product);

    // If not enough scored products, fill with random products
    if (scoredProducts.length < maxRecommendations) {
      const remaining = allProducts
        .filter(p => 
          p.node.id !== currentProductId && 
          !scoredProducts.find(r => r.node.id === p.node.id)
        )
        .slice(0, maxRecommendations - scoredProducts.length);
      return [...scoredProducts, ...remaining].slice(0, maxRecommendations);
    }

    return scoredProducts;
  }, [allProducts, currentProductId, currentProductTags, currentProductType, maxRecommendations]);

  if (isLoading) {
    return (
      <section className={cn("mt-12 pt-8 border-t border-border", className)}>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <section className={cn("mt-12 pt-8 border-t border-border", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          You May Also Like
        </h2>
        <Link 
          to="/collections/all" 
          className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product, index) => (
          <RecommendationCard 
            key={product.node.id} 
            product={product} 
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

interface RecommendationCardProps {
  product: ShopifyProduct;
  index: number;
}

function RecommendationCard({ product, index }: RecommendationCardProps) {
  const { node } = product;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const totalInventory = calculateTotalInventory(node.variants.edges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/product/${node.handle}`}>
        <Card className="group overflow-hidden border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
          <div className="relative aspect-square overflow-hidden bg-muted">
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
            
            {/* Low Stock Badge */}
            {totalInventory > 0 && totalInventory <= 10 && (
              <div className="absolute bottom-2 left-2">
                <LowStockBadge quantity={totalInventory} variant="compact" />
              </div>
            )}
            
            {/* Wishlist Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <WishlistButton product={product} />
            </div>
          </div>
          
          <CardContent className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
              {node.title}
            </h3>
            <p className="text-sm font-bold mt-1">
              €{parseFloat(price.amount).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
