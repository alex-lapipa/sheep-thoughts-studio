import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { ModesSection } from "@/components/ModesSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ModesSection />
      <FeaturedProducts />
    </Layout>
  );
};

export default Index;
