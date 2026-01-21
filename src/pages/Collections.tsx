import { useSearchParams } from "react-router-dom";
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
