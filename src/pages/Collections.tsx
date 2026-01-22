import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { ModeBadge } from "@/components/ModeBadge";
import { BubbleMode } from "@/data/thoughtBubbles";

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMode = searchParams.get('mode') as BubbleMode | null;
  
  const query = activeMode ? `tag:${activeMode}` : undefined;
  const { data: products, isLoading } = useProducts(query, 40);

  const modes: BubbleMode[] = ['innocent', 'concerned', 'triggered', 'savage'];
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";

  const handleModeClick = (mode: BubbleMode) => {
    if (activeMode === mode) {
      searchParams.delete('mode');
    } else {
      searchParams.set('mode', mode);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <Helmet>
        <title>Bubbles Merch | Shop All Products</title>
        <meta name="description" content="Browse the full collection of Bubbles merchandise. T-shirts, mugs, and more featuring confidently incorrect wisdom." />
        <meta property="og:title" content="Bubbles Merch | Shop All Products" />
        <meta property="og:description" content="T-shirts, mugs, and more featuring confidently incorrect wisdom from the Wicklow bogs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/collections/all`} />
        <meta property="og:image" content={`${siteUrl}/og-collections.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bubbles Merch Collection" />
        <meta name="twitter:description" content="Shop confidently incorrect wisdom merchandise." />
        <meta name="twitter:image" content={`${siteUrl}/og-collections.jpg`} />
        <link rel="canonical" href={`${siteUrl}/collections/all`} />
      </Helmet>
      <div className="container py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            All Products
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Browse our full collection of Bubbles merch
          </p>

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
                Clear filter
              </button>
            )}
          </div>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default Collections;
