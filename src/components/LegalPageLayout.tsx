import { useState, ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { useTableOfContents, TocItem } from "@/hooks/useTableOfContents";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { cn } from "@/lib/utils";

interface LegalPageLayoutProps {
  children: ReactNode;
  tocItems: TocItem[];
  tocTitle?: string;
  mobileTocTitle?: string;
}

export function LegalPageLayout({ 
  children, 
  tocItems, 
  tocTitle = "On This Page",
  mobileTocTitle = "Jump to Section"
}: LegalPageLayoutProps) {
  // Enable smooth scrolling to anchor links
  useSmoothScroll();

  const { activeId, scrollToSection } = useTableOfContents(tocItems);
  const [showMobileToc, setShowMobileToc] = useState(false);

  return (
    <Layout>
      <ScrollProgressBar />

      <div className="container py-12">
        <div className="flex gap-8">
          {/* Sticky Table of Contents Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <List className="w-4 h-4" />
                    {tocTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          "block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all duration-200",
                          activeId === item.id
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile TOC Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <Button
              size="icon"
              onClick={() => setShowMobileToc(!showMobileToc)}
              className="rounded-full shadow-lg h-12 w-12"
            >
              <List className="w-5 h-5" />
            </Button>
            
            {showMobileToc && (
              <Card className="absolute bottom-16 right-0 w-64 bg-card/95 backdrop-blur-sm shadow-xl animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{mobileTocTitle}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          scrollToSection(item.id);
                          setShowMobileToc(false);
                        }}
                        className={cn(
                          "block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all",
                          activeId === item.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}
