import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { useProducts } from "@/hooks/useProducts";
import { useBestsellerRanking, sortByBestseller } from "@/hooks/useBestsellerRanking";
import { ModeBadge } from "@/components/ModeBadge";
import { BubbleMode } from "@/data/thoughtBubbles";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOgImage } from "@/hooks/useOgImage";
import { useMemo } from "react";

type SortOption = 'bestseller' | 'newest' | 'price-low' | 'price-high';

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMode = searchParams.get('mode') as BubbleMode | null;
  const sortBy = (searchParams.get('sort') as SortOption) || 'bestseller';
  const { t } = useLanguage();
  const { ogImageUrl, siteUrl } = useOgImage("og-collections.jpg");
  
  const query = activeMode ? `tag:${activeMode}` : undefined;
  const { data: products, isLoading } = useProducts(query, 40);
  const { data: bestsellerRankings } = useBestsellerRanking();

  const modes: BubbleMode[] = ['innocent', 'concerned', 'triggered', 'savage'];

  const handleModeClick = (mode: BubbleMode) => {
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
      <PageHeroWithBubbles
        title={t("collectionsPage.title")}
        subtitle={t("collectionsPage.subtitle")}
        bubbleSize="md"
      />
      <div className="container py-12">
        <div className="mb-8">

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Mode Filters */}
            <div className="flex flex-wrap gap-3">
              {modes.map((mode) => (
                <ModeBadge 
                  key={mode} 
                  mode={mode} 
                  active={activeMode === mode}
                  onClick={() => handleModeClick(mode)}
                />
              ))}
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

        <ProductGrid 
          products={sortedProducts} 
          isLoading={isLoading} 
          listName={activeMode ? `collection_${activeMode}` : "collection_all"}
        />
      </div>
    </Layout>
  );
};

export default Collections;
