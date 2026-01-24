import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useShopifyIntegrations, ShopifyProduct } from "@/hooks/useShopifyIntegrations";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Loader2, 
  Package, 
  AlertTriangle, 
  Search, 
  RefreshCw,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StorefrontProductsGridProps {
  initialQuery?: string;
  showSearch?: boolean;
  showInventory?: boolean;
  columns?: 2 | 3 | 4;
  limit?: number;
}

interface ProductWithInventory extends ShopifyProduct {
  inventoryStatus: "in_stock" | "low_stock" | "out_of_stock";
}

export function StorefrontProductsGrid({
  initialQuery = "",
  showSearch = true,
  showInventory = true,
  columns = 4,
  limit = 20,
}: StorefrontProductsGridProps) {
  const { fetchProducts, isLoading: hookLoading } = useShopifyIntegrations();
  const addItem = useCartStore((state) => state.addItem);
  const cartIsLoading = useCartStore((state) => state.isLoading);

  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInventoryStatus = (product: ShopifyProduct): "in_stock" | "low_stock" | "out_of_stock" => {
    const totalInventory = product.totalInventory || 0;
    if (totalInventory <= 0) return "out_of_stock";
    if (totalInventory <= 5) return "low_stock";
    return "in_stock";
  };

  const loadProducts = useCallback(async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchProducts({
        first: limit,
        query: debouncedQuery || undefined,
        after: append ? endCursor : null,
      });

      if (result) {
        const productsWithInventory: ProductWithInventory[] = result.products.map((p) => ({
          ...p,
          inventoryStatus: getInventoryStatus(p),
        }));

        if (append) {
          setProducts((prev) => [...prev, ...productsWithInventory]);
        } else {
          setProducts(productsWithInventory);
        }

        setHasNextPage(result.pageInfo.hasNextPage);
        setEndCursor(result.pageInfo.endCursor);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [fetchProducts, limit, debouncedQuery, endCursor]);

  // Load products on mount and when query changes
  useEffect(() => {
    loadProducts(false);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setEndCursor(null);
    await loadProducts(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      loadProducts(true);
    }
  };

  const handleAddToCart = async (product: ProductWithInventory, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.variants.edges[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) {
      toast.error("Product not available");
      return;
    }

    await addItem({
      product: {
        node: {
          id: product.id,
          title: product.title,
          description: product.description,
          handle: product.handle,
          tags: product.tags,
          priceRange: product.priceRange,
          images: product.images,
          variants: product.variants,
          options: product.options,
        },
      },
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });

    toast.success("Added to cart!", { description: product.title });
  };

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const InventoryBadge = ({ status, quantity }: { status: string; quantity: number }) => {
    if (status === "out_of_stock") {
      return (
        <Badge variant="destructive" className="gap-1">
          <X className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    }
    if (status === "low_stock") {
      return (
        <Badge variant="secondary" className="gap-1 bg-warning/20 text-warning-foreground dark:bg-warning/30">
          <AlertTriangle className="h-3 w-3" />
          Only {quantity} left
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-affirmative/10 text-affirmative">
        <Check className="h-3 w-3" />
        In Stock ({quantity})
      </Badge>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="space-y-6">
        {showSearch && (
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        )}
        <div className={cn("grid gap-4 md:gap-6", gridCols[columns])}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Refresh */}
      {showSearch && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            {debouncedQuery ? "Try a different search term" : "Products will appear here once added"}
          </p>
        </div>
      ) : (
        <div className={cn("grid gap-4 md:gap-6", gridCols[columns])}>
          {products.map((product) => {
            const firstVariant = product.variants.edges[0]?.node;
            const image = product.images.edges[0]?.node;
            const isAvailable = firstVariant?.availableForSale && product.inventoryStatus !== "out_of_stock";

            return (
              <Link
                key={product.id}
                to={`/product/${product.handle}`}
                className="group block"
              >
                <Card className={cn(
                  "overflow-hidden transition-all duration-200 h-full",
                  "hover:shadow-lg hover:-translate-y-1",
                  !isAvailable && "opacity-75"
                )}>
                  {/* Image */}
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}

                    {/* Inventory Badge Overlay */}
                    {showInventory && (
                      <div className="absolute top-2 left-2">
                        <InventoryBadge 
                          status={product.inventoryStatus} 
                          quantity={product.totalInventory} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-semibold text-base leading-tight group-hover:text-accent transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      {product.vendor && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.vendor}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-lg">
                        {product.priceRange.minVariantPrice.currencyCode}{" "}
                        {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                      </span>

                      {product.variants.edges.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {product.variants.edges.length} variants
                        </Badge>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!isAvailable || cartIsLoading}
                      variant={isAvailable ? "default" : "secondary"}
                    >
                      {cartIsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : !isAvailable ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
