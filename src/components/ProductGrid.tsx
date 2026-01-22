import { useEffect, useRef } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ecommerceTracking } from "@/lib/ecommerceTracking";

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading?: boolean;
  listName?: string;
}

export function ProductGrid({ products, isLoading, listName = "default" }: ProductGridProps) {
  const hasTrackedListView = useRef(false);
  const prevProductIds = useRef<string>("");

  // Track product list view when products load
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    
    // Create a stable key from product IDs to detect actual changes
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard 
          key={product.node.id} 
          product={product} 
          position={index + 1}
          listName={listName}
        />
      ))}
    </div>
  );
}
