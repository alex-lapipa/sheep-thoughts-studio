import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { ScrollableProductGrid } from "@/components/ScrollableProductGrid";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { ShopHero } from "@/components/ShopHero";
import { ShopTrustCues } from "@/components/ShopTrustCues";
import { ShopTestimonials } from "@/components/ShopTestimonials";
import { ShopCollectionTiles } from "@/components/ShopCollectionTiles";
import { FeaturedProductsCarousel } from "@/components/FeaturedProductsCarousel";
import { useProducts } from "@/hooks/useProducts";
import { useBestsellerRanking, sortByBestseller } from "@/hooks/useBestsellerRanking";
import { ModeEscalationScale, ExtendedBubbleMode } from "@/components/ModeBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { useOgImage } from "@/hooks/useOgImage";
import { useMemo, useState } from "react";
import { AnimatedOnView } from "@/components/AnimatedText";
import { LayoutGrid, GalleryHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortOption = 'bestseller' | 'newest' | 'price-low' | 'price-high';
type ViewMode = 'grid' | 'scroll';

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMode = searchParams.get('mode') as ExtendedBubbleMode | null;
  const sortBy = (searchParams.get('sort') as SortOption) || 'bestseller';
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const { t } = useLanguage();
  const { isEnabled } = useFeatureFlags();
  const { ogImageUrl, siteUrl } = useOgImage("og-collections.jpg");
  
  const enhancedShopEnabled = isEnabled('enhancedShop');
  const query = activeMode ? `tag:${activeMode}` : undefined;
  const { data: products, isLoading } = useProducts(query, 40);
  const { data: bestsellerRankings } = useBestsellerRanking();

  const handleModeSelect = (mode: ExtendedBubbleMode) => {
    if (activeMode === mode) {
      searchParams.delete('mode');
    } else {
      searchParams.set('mode', mode);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (sort: SortOption) => {
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
  };

  // Sort products based on selected option
  const sortedProducts = useMemo(() => {
    if (!products) return [];

    switch (sortBy) {
      case 'bestseller':
        return bestsellerRankings 
          ? sortByBestseller(products, bestsellerRankings)
          : products;
      case 'price-low':
        return [...products].sort((a, b) => {
          const aPrice = parseFloat(a.node.priceRange?.minVariantPrice?.amount || '0');
          const bPrice = parseFloat(b.node.priceRange?.minVariantPrice?.amount || '0');
          return aPrice - bPrice;
        });
      case 'price-high':
        return [...products].sort((a, b) => {
          const aPrice = parseFloat(a.node.priceRange?.minVariantPrice?.amount || '0');
          const bPrice = parseFloat(b.node.priceRange?.minVariantPrice?.amount || '0');
          return bPrice - aPrice;
        });
      case 'newest':
      default:
        return products; // Shopify returns newest first by default
    }
  }, [products, sortBy, bestsellerRankings]);

  return (
    <Layout>
      <Helmet>
        <title>Bubbles Merch | Shop All Products</title>
        <meta name="description" content="Browse the full collection of Bubbles merchandise. T-shirts, mugs, and more featuring confidently incorrect wisdom." />
        <meta property="og:title" content="Bubbles Merch | Shop All Products" />
        <meta property="og:description" content="T-shirts, mugs, and more featuring confidently incorrect wisdom from the Wicklow bogs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/collections/all`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bubbles Merch Collection" />
        <meta name="twitter:description" content="Shop confidently incorrect wisdom merchandise." />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/collections/all`} />
      </Helmet>

      {/* Enhanced Shop: New hero, collection tiles, featured carousel, trust cues */}
      {enhancedShopEnabled ? (
        <>
          <ShopHero />
          <ShopCollectionTiles />
          <FeaturedProductsCarousel />
          <ShopTestimonials />
          <ShopTrustCues />
        </>
      ) : (
        <section className="-mx-4 mb-12">
          <PageHeroWithBubbles
            title={t("collectionsPage.title")}
            subtitle={t("collectionsPage.subtitle")}
            bubbleSize="md"
            scene="collections"
          />
        </section>
      )}

      <div className="container py-12">
        <div className="mb-8 space-y-6">
          {/* Mode Escalation Filter */}
          <AnimatedOnView>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {enhancedShopEnabled ? "Filter by Mood" : "Shop by Mood"}
                </h3>
              {activeMode && (
                <button 
                  onClick={() => {
                    searchParams.delete('mode');
                    setSearchParams(searchParams);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  {t("collectionsPage.clearFilter")}
                </button>
              )}
            </div>
              <ModeEscalationScale 
                activeMode={activeMode} 
                onModeSelect={handleModeSelect} 
              />
            </div>
          </AnimatedOnView>

          {/* Sort & View Toggle */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 rounded-md",
                  viewMode === 'scroll' && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode('scroll')}
              >
                <GalleryHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Scroll</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 rounded-md",
                  viewMode === 'grid' && "bg-background shadow-sm"
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bestseller">Bestselling</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'scroll' ? (
          <ScrollableProductGrid 
            products={sortedProducts} 
            isLoading={isLoading} 
            listName={activeMode ? `collection_${activeMode}` : "collection_all"}
          />
        ) : (
          <ProductGrid 
            products={sortedProducts} 
            isLoading={isLoading} 
            listName={activeMode ? `collection_${activeMode}` : "collection_all"}
          />
        )}
      </div>
    </Layout>
  );
};

export default Collections;
