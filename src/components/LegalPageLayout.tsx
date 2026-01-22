import { useState, useEffect, ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, ArrowUp, ChevronDown, ChevronRight } from "lucide-react";
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

// Recursive TOC item renderer
function TocItemButton({ 
  item, 
  activeId, 
  scrollToSection, 
  onNavigate,
  depth = 0 
}: { 
  item: TocItem; 
  activeId: string;
  scrollToSection: (id: string) => void;
  onNavigate?: () => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeId === item.id;
  const hasActiveChild = item.children?.some(child => 
    child.id === activeId || child.children?.some(grandchild => grandchild.id === activeId)
  );

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 mr-1 rounded hover:bg-muted/50 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        )}
        <button
          onClick={() => {
            scrollToSection(item.id);
            onNavigate?.();
          }}
          className={cn(
            "flex-1 text-left text-sm py-1.5 px-2 rounded-md transition-all duration-200",
            depth > 0 && "text-xs",
            !hasChildren && depth === 0 && "ml-5",
            isActive
              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
              : hasActiveChild
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {item.title}
        </button>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-2">
          {item.children!.map((child) => (
            <TocItemButton
              key={child.id}
              item={child}
              activeId={activeId}
              scrollToSection={scrollToSection}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                  <nav className="space-y-0.5">
                    {tocItems.map((item) => (
                      <TocItemButton
                        key={item.id}
                        item={item}
                        activeId={activeId}
                        scrollToSection={scrollToSection}
                      />
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile TOC Toggle + Back to Top */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {showBackToTop && (
              <Button
                size="icon"
                variant="secondary"
                onClick={scrollToTop}
                className="rounded-full shadow-lg h-12 w-12 animate-fade-in"
                aria-label="Back to top"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            )}
            <Button
              size="icon"
              onClick={() => setShowMobileToc(!showMobileToc)}
              className="rounded-full shadow-lg h-12 w-12"
            >
              <List className="w-5 h-5" />
            </Button>
            
            {showMobileToc && (
              <Card className="absolute bottom-16 right-0 w-72 max-h-[60vh] overflow-y-auto bg-card/95 backdrop-blur-sm shadow-xl animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{mobileTocTitle}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <nav className="space-y-0.5">
                    {tocItems.map((item) => (
                      <TocItemButton
                        key={item.id}
                        item={item}
                        activeId={activeId}
                        scrollToSection={scrollToSection}
                        onNavigate={() => setShowMobileToc(false)}
                      />
                    ))}
                  </nav>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Back to Top Button */}
          {showBackToTop && (
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollToTop}
              className="hidden lg:flex fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-12 w-12 animate-fade-in"
              aria-label="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          )}

          {/* Main Content */}
          <div className="flex-1 max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}
