import { Header } from "./Header";
import { Footer } from "./Footer";
import { useCartSync } from "@/hooks/useCartSync";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useCartSync();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
