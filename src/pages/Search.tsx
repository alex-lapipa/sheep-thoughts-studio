import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchQuery = query.length >= 2 ? `title:*${query}*` : undefined;
  const { data: products, isLoading } = useProducts(searchQuery, 20);

  return (
    <Layout>
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
