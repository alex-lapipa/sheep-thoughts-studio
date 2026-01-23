import { Header } from "./Header";
import { Footer } from "./Footer";
import { UrbanChaosOverlay } from "./UrbanChaosOverlay";
import { FloatingBubbles } from "./FloatingBubbles";
import { PageTransition } from "./PageTransition";
import { StructuredData } from "./StructuredData";
import { HreflangTags } from "./HreflangTags";
import { SeasonalBanner } from "./SeasonalBanner";
import { FeatureFlagBadge } from "./FeatureFlagBadge";
import { useCartSync } from "@/hooks/useCartSync";
import { useWinterTheme } from "@/contexts/WinterThemeContext";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useCartSync();
  useWhatsNew(); // Show "What's New" toast on first visit after updates
  const { isWinterMode } = useWinterTheme();

  return (
    <div className={cn(
      "min-h-screen flex flex-col relative",
      isWinterMode && "ice-pattern"
    )}>
      <StructuredData />
      <HreflangTags />
      <FloatingBubbles />
      <UrbanChaosOverlay />
      <FeatureFlagBadge />
      
      {/* Winter frost overlay */}
      {isWinterMode && (
        <div className="fixed inset-0 pointer-events-none z-[1]">
          {/* Top frost edge */}
          <div 
            className="absolute top-0 left-0 right-0 h-24 opacity-30"
            style={{
              background: "linear-gradient(to bottom, hsl(200 80% 95% / 0.5), transparent)"
            }}
          />
          {/* Corner frost decorations */}
          <div className="absolute top-4 left-4 text-2xl opacity-20 animate-float">❄</div>
          <div className="absolute top-6 right-8 text-lg opacity-15" style={{ animationDelay: "1s" }}>❄</div>
          <div className="absolute top-12 left-1/4 text-sm opacity-10" style={{ animationDelay: "2s" }}>✦</div>
        </div>
      )}
      
      <SeasonalBanner />
      <Header />
      <main className={cn(
        "flex-1 relative z-10",
        isWinterMode && "cozy-glow"
      )}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
