import { Header } from "./Header";
import { Footer } from "./Footer";
import { UrbanChaosOverlay } from "./UrbanChaosOverlay";
import { useCartSync } from "@/hooks/useCartSync";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useCartSync();

  return (
    <div className="min-h-screen flex flex-col relative">
      <UrbanChaosOverlay />
      <Header />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
