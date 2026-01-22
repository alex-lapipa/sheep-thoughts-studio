import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const siteUrl = "https://sheep-thoughts-studio.lovable.app";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchQuery = query.length >= 2 ? `title:*${query}*` : undefined;
  const { data: products, isLoading } = useProducts(searchQuery, 20);

  return (
    <Layout>
      <Helmet>
        <title>Search | Bubbles Merch</title>
        <meta name="description" content="Search for Bubbles merchandise. Find t-shirts, mugs, and more featuring confidently incorrect wisdom." />
        <meta property="og:title" content="Search Bubbles Merch" />
        <meta property="og:description" content="Find the perfect confidently wrong merchandise." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/search`} />
        <meta property="og:image" content={`${siteUrl}/og-search.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Bubbles Merch" />
        <meta name="twitter:image" content={`${siteUrl}/og-search.jpg`} />
        <link rel="canonical" href={`${siteUrl}/search`} />
      </Helmet>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-center">
            Search
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-lg rounded-xl"
            />
          </div>
        </div>

        {query.length >= 2 ? (
          <ProductGrid products={products || []} isLoading={isLoading} />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-muted-foreground">
              Start typing to search for Bubbles merch...
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
