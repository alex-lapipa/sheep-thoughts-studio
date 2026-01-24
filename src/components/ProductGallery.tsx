import { useState, useMemo } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  Filter, 
  LayoutGrid, 
  Grid2X2, 
  Grid3X3,
  SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProductGalleryProps {
  products: ShopifyProduct[];
  isLoading?: boolean;
  listName?: string;
}

type GridDensity = 2 | 3 | 4;
type PriceRange = 'all' | 'under-25' | '25-50' | '50-100' | 'over-100';

export function ProductGallery({ 
  products, 
  isLoading, 
  listName = "gallery" 
}: ProductGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gridDensity, setGridDensity] = useState<GridDensity>(3);
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const hasTrackedListView = useRef(false);
  const prevProductIds = useRef<string>("");

  // Extract unique product types from tags
  const productTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => {
      // Look for common type patterns in tags
      const typeTags = p.node.tags?.filter(tag => 
        ['tee', 't-shirt', 'hoodie', 'mug', 'tote', 'cap', 'pin', 'accessory'].some(
          type => tag.toLowerCase().includes(type)
        )
      ) || [];
      typeTags.forEach(t => types.add(t.toLowerCase()));
      
      // Also check title for product type hints
      const title = p.node.title.toLowerCase();
      if (title.includes('tee') || title.includes('t-shirt')) types.add('t-shirt');
      if (title.includes('hoodie')) types.add('hoodie');
      if (title.includes('mug')) types.add('mug');
      if (title.includes('tote')) types.add('tote');
      if (title.includes('cap')) types.add('cap');
      if (title.includes('pin')) types.add('pin');
    });
    return Array.from(types).sort();
  }, [products]);

  // Filter products based on search, price range, and type
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
          product.node.title.toLowerCase().includes(search) ||
          product.node.description?.toLowerCase().includes(search) ||
          product.node.tags?.some(tag => tag.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Price range filter
      const price = parseFloat(product.node.priceRange?.minVariantPrice?.amount || '0');
      switch (priceRange) {
        case 'under-25':
          if (price >= 25) return false;
          break;
        case '25-50':
          if (price < 25 || price >= 50) return false;
          break;
        case '50-100':
          if (price < 50 || price >= 100) return false;
          break;
        case 'over-100':
          if (price < 100) return false;
          break;
      }

      // Type filter
      if (selectedTypes.length > 0) {
        const title = product.node.title.toLowerCase();
        const tags = product.node.tags?.map(t => t.toLowerCase()) || [];
        const matchesType = selectedTypes.some(type => 
          title.includes(type) || tags.some(tag => tag.includes(type))
        );
        if (!matchesType) return false;
      }

      return true;
    });
  }, [products, searchTerm, priceRange, selectedTypes]);

  // Track product list view when products load
  useEffect(() => {
    if (isLoading || filteredProducts.length === 0) return;
    
    const productIds = filteredProducts.map(p => p.node.id).join(",");
    if (productIds === prevProductIds.current) return;
    
    prevProductIds.current = productIds;
    hasTrackedListView.current = true;
    
    ecommerceTracking.viewProductList(
      listName,
      filteredProducts.map(p => ({
        id: p.node.id,
        title: p.node.title,
        price: parseFloat(p.node.priceRange.minVariantPrice.amount),
      }))
    );
  }, [filteredProducts, isLoading, listName]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange('all');
    setSelectedTypes([]);
  };

  const activeFilterCount = 
    (searchTerm ? 1 : 0) + 
    (priceRange !== 'all' ? 1 : 0) + 
    selectedTypes.length;

  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className={cn("grid gap-4 md:gap-6", gridClasses[gridDensity])}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-3">
          {/* Price Range */}
          <Select value={priceRange} onValueChange={(v) => setPriceRange(v as PriceRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-25">Under €25</SelectItem>
              <SelectItem value="25-50">€25 - €50</SelectItem>
              <SelectItem value="50-100">€50 - €100</SelectItem>
              <SelectItem value="over-100">€100+</SelectItem>
            </SelectContent>
          </Select>

          {/* Grid Density */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md", gridDensity === 2 && "bg-background shadow-sm")}
              onClick={() => setGridDensity(2)}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md", gridDensity === 3 && "bg-background shadow-sm")}
              onClick={() => setGridDensity(3)}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md", gridDensity === 4 && "bg-background shadow-sm")}
              onClick={() => setGridDensity(4)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down your search</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Price Range Mobile */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'under-25', label: 'Under €25' },
                    { value: '25-50', label: '€25-€50' },
                    { value: '50-100', label: '€50-€100' },
                    { value: 'over-100', label: '€100+' },
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={priceRange === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriceRange(option.value as PriceRange)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Product Types Mobile */}
              {productTypes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Product Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map(type => (
                      <Button
                        key={type}
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid Density Mobile */}
              <div>
                <h4 className="font-medium mb-3">Grid Size</h4>
                <div className="flex gap-2">
                  <Button
                    variant={gridDensity === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGridDensity(2)}
                  >
                    <Grid2X2 className="h-4 w-4 mr-2" />
                    Large
                  </Button>
                  <Button
                    variant={gridDensity === 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGridDensity(3)}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Medium
                  </Button>
                  <Button
                    variant={gridDensity === 4 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGridDensity(4)}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Small
                  </Button>
                </div>
              </div>

              {/* Apply/Clear */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear All
                </Button>
                <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Product Type Pills */}
      {productTypes.length > 0 && (
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Type:</span>
          {productTypes.map(type => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className={cn(
                "cursor-pointer capitalize transition-colors",
                selectedTypes.includes(type) 
                  ? "bg-primary hover:bg-primary/90" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleType(type)}
            >
              {type}
            </Badge>
          ))}
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length === products.length 
            ? `${products.length} products`
            : `${filteredProducts.length} of ${products.length} products`
          }
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐑</div>
          <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search term
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className={cn("grid gap-4 md:gap-6", gridClasses[gridDensity])}>
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.node.id} 
              product={product} 
              position={index + 1}
              listName={listName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
