import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useOgImage } from "@/hooks/useOgImage";
import { HighlightedText } from "@/components/HighlightedText";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Search as SearchIcon, 
  ShoppingBag, 
  Brain, 
  Sparkles, 
  Loader2, 
  Bookmark, 
  BookmarkCheck, 
  X,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { ogImageUrl, siteUrl } = useOgImage("og-search.jpg");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "content">("all");
  const [showSavedSearches, setShowSavedSearches] = useState(false);
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

  // Saved searches
  const {
    savedSearches,
    sortedByUsage,
    saveSearch,
    removeSearch,
    useSearch,
    isSearchSaved,
  } = useSavedSearches();

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
  const isSaved = isSearchSaved(query);

  const handleSaveSearch = () => {
    if (hasQuery) {
      saveSearch(query);
    }
  };

  const handleUseSavedSearch = (savedQuery: string, id: string) => {
    setQuery(savedQuery);
    useSearch(id);
    setShowSavedSearches(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Search | Bubbles Merch & Wisdom</title>
        <meta name="description" content="Search for Bubbles merchandise and wisdom. Find t-shirts, mugs, and confidently incorrect insights." />
        <meta property="og:title" content="Search Bubbles" />
        <meta property="og:description" content="Find the perfect confidently wrong merchandise and wisdom." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/search`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Bubbles" />
        <meta name="twitter:image" content={ogImageUrl} />
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
              onFocus={() => setShowSavedSearches(true)}
              onBlur={() => setTimeout(() => setShowSavedSearches(false), 200)}
              className="pl-12 pr-24 h-14 text-lg rounded-xl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isLoading && (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              )}
              {hasQuery && !isLoading && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={handleSaveSearch}
                        disabled={isSaved}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSaved ? "Search saved" : "Save this search"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Saved Searches Dropdown */}
            {showSavedSearches && savedSearches.length > 0 && !hasQuery && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto shadow-lg animate-fade-in">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      Saved Searches
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {savedSearches.length}
                    </Badge>
                  </div>
                  
                  {/* Most used */}
                  {sortedByUsage.length > 0 && sortedByUsage[0].useCount > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Most Used
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sortedByUsage.slice(0, 3).filter(s => s.useCount > 0).map((search) => (
                          <Button
                            key={search.id}
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleUseSavedSearch(search.query, search.id)}
                          >
                            {search.query}
                            <Badge variant="outline" className="ml-1 text-[10px] px-1">
                              {search.useCount}×
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent */}
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      Recent
                    </span>
                    <div className="space-y-1">
                      {savedSearches.slice(0, 5).map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between group hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 cursor-pointer"
                          onClick={() => handleUseSavedSearch(search.query, search.id)}
                        >
                          <span className="text-sm truncate flex-1">{search.query}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearch(search.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {searchMethod && hasQuery && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {searchMethod === "semantic" ? "✨ AI-Powered Search" : "📝 Text Search"}
              </Badge>
              {isSaved && (
                <Badge variant="outline" className="text-xs">
                  <BookmarkCheck className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
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
                      const displayText = result.preview || result.text || result.bubbles_wrong_take || "";
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
                              <h3 className="font-medium mb-2 line-clamp-2">
                                <HighlightedText text={result.title} query={debouncedQuery} />
                              </h3>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              <HighlightedText text={displayText} query={debouncedQuery} />
                            </p>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    <HighlightedText text={tag} query={debouncedQuery} />
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
                    const displayText = result.preview || result.text || result.bubbles_wrong_take || "";
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
                            <h3 className="font-medium mb-2 line-clamp-2">
                              <HighlightedText text={result.title} query={debouncedQuery} />
                            </h3>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            <HighlightedText text={displayText} query={debouncedQuery} />
                          </p>
                          {result.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <HighlightedText text={result.category} query={debouncedQuery} />
                            </Badge>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <HighlightedText text={tag} query={debouncedQuery} />
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
            <p className="text-sm text-muted-foreground mb-6">
              Uses AI-powered semantic search to find related content
            </p>

            {/* Show saved searches when no query */}
            {savedSearches.length > 0 && (
              <div className="max-w-md mx-auto mt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Your Saved Searches</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {savedSearches.slice(0, 8).map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      size="sm"
                      className="group"
                      onClick={() => handleUseSavedSearch(search.query, search.id)}
                    >
                      <SearchIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      {search.query}
                      {search.useCount > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                          {search.useCount}×
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
