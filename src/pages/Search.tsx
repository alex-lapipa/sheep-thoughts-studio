import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, ShoppingBag, Brain, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const siteUrl = "https://sheep-thoughts-studio.lovable.app";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const sourceLabels = {
  knowledge: { label: "Knowledge", icon: Brain, color: "bg-blue-500/20 text-blue-600" },
  thoughts: { label: "Thoughts", icon: Sparkles, color: "bg-purple-500/20 text-purple-600" },
  rag: { label: "Wisdom", icon: Sparkles, color: "bg-amber-500/20 text-amber-600" },
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "content">("all");
  const debouncedQuery = useDebounce(query, 300);
  
  // Product search
  const productSearchQuery = debouncedQuery.length >= 2 ? `title:*${debouncedQuery}*` : undefined;
  const { data: products, isLoading: productsLoading } = useProducts(productSearchQuery, 12);
  
  // Semantic search
  const { 
    results: contentResults, 
    isLoading: contentLoading, 
    searchMethod,
    search: performSemanticSearch,
    clearResults 
  } = useSemanticSearch();

  // Trigger semantic search on debounced query change
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSemanticSearch(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, performSemanticSearch, clearResults]);

  const isLoading = productsLoading || contentLoading;
  const hasQuery = query.length >= 2;
  const hasProducts = (products?.length || 0) > 0;
  const hasContent = contentResults.length > 0;

  return (
    <Layout>
      <Helmet>
        <title>Search | Bubbles Merch & Wisdom</title>
        <meta name="description" content="Search for Bubbles merchandise and wisdom. Find t-shirts, mugs, and confidently incorrect insights." />
        <meta property="og:title" content="Search Bubbles" />
        <meta property="og:description" content="Find the perfect confidently wrong merchandise and wisdom." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/search`} />
        <meta property="og:image" content={`${siteUrl}/og-search.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Bubbles" />
        <meta name="twitter:image" content={`${siteUrl}/og-search.jpg`} />
        <link rel="canonical" href={`${siteUrl}/search`} />
      </Helmet>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-center">
            Search
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, wisdom, or ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-xl"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            )}
          </div>
          
          {searchMethod && hasQuery && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {searchMethod === "semantic" ? "✨ AI-Powered Search" : "📝 Text Search"}
              </Badge>
            </div>
          )}
        </div>

        {hasQuery ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                {(hasProducts || hasContent) && (
                  <Badge variant="secondary" className="text-xs">
                    {(products?.length || 0) + contentResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Products
                {hasProducts && (
                  <Badge variant="secondary" className="text-xs">{products?.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Wisdom
                {hasContent && (
                  <Badge variant="secondary" className="text-xs">{contentResults.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Content Results */}
              {hasContent && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Related Wisdom
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contentResults.slice(0, 6).map((result) => {
                      const sourceInfo = sourceLabels[result.source];
                      const Icon = sourceInfo.icon;
                      return (
                        <Card key={`${result.source}-${result.id}`} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge className={cn("text-xs", sourceInfo.color)}>
                                <Icon className="h-3 w-3 mr-1" />
                                {sourceInfo.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round((result.similarity || 0) * 100)}% match
                              </span>
                            </div>
                            {result.title && (
                              <h3 className="font-medium mb-2 line-clamp-2">{result.title}</h3>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {result.preview || result.text || result.bubbles_wrong_take}
                            </p>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Products */}
              {hasProducts && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Products
                  </h2>
                  <ProductGrid products={products || []} isLoading={productsLoading} listName="search_results" />
                </section>
              )}

              {!hasProducts && !hasContent && !isLoading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🤷</div>
                  <p className="text-muted-foreground">
                    No results found for "{query}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or ask Bubbles a question
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products">
              {hasProducts ? (
                <ProductGrid products={products || []} isLoading={productsLoading} listName="search_results" />
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🛍️</div>
                  <p className="text-muted-foreground">
                    {isLoading ? "Searching..." : `No products found for "${query}"`}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content">
              {hasContent ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contentResults.map((result) => {
                    const sourceInfo = sourceLabels[result.source];
                    const Icon = sourceInfo.icon;
                    return (
                      <Card key={`${result.source}-${result.id}`} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge className={cn("text-xs", sourceInfo.color)}>
                              <Icon className="h-3 w-3 mr-1" />
                              {sourceInfo.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((result.similarity || 0) * 100)}% match
                            </span>
                          </div>
                          {result.title && (
                            <h3 className="font-medium mb-2 line-clamp-2">{result.title}</h3>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {result.preview || result.text || result.bubbles_wrong_take}
                          </p>
                          {result.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {result.category}
                            </Badge>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🧠</div>
                  <p className="text-muted-foreground">
                    {isLoading ? "Searching wisdom..." : `No wisdom found for "${query}"`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-muted-foreground mb-2">
              Start typing to search for products and wisdom...
            </p>
            <p className="text-sm text-muted-foreground">
              Uses AI-powered semantic search to find related content
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
