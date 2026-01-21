import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "./ProductGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts(undefined, 8);

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Shop the Flock
            </h2>
            <p className="text-muted-foreground text-lg">
              Premium merch for sheep enthusiasts
            </p>
          </div>
          <Link to="/collections/all">
            <Button variant="outline" className="font-display">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} />
      </div>
    </section>
  );
}
