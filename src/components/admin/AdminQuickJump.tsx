import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Navigation, ChevronUp, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  level: number;
  top: number;
}

export function AdminQuickJump() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scan for headings and card titles
  const scanSections = useCallback(() => {
    const headings = document.querySelectorAll(
      'main h1[id], main h2[id], main h3[id], main [data-section-id]'
    );
    
    const found: Section[] = [];
    headings.forEach((el) => {
      const id = el.id || el.getAttribute('data-section-id') || '';
      if (!id) return;
      
      const title = el.textContent?.trim() || '';
      const level = el.tagName === 'H1' ? 1 : el.tagName === 'H2' ? 2 : 3;
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      
      found.push({ id, title, level, top });
    });
    
    setSections(found);
  }, []);

  // Track scroll position for active section and scroll-to-top button
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setShowScrollTop(scrollY > 300);
    
    if (sections.length === 0) return;
    
    const offset = 150;
    let current = sections[0]?.id || '';
    
    for (const section of sections) {
      if (scrollY + offset >= section.top) {
        current = section.id;
      }
    }
    
    setActiveId(current);
  }, [sections]);

  // Scan on mount and when content changes
  useEffect(() => {
    // Initial scan after a short delay to allow content to render
    const timer = setTimeout(scanSections, 500);
    
    // Re-scan when route changes (via MutationObserver)
    const observer = new MutationObserver(() => {
      setTimeout(scanSections, 100);
    });
    
    const main = document.querySelector('main');
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [scanSections]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Don't render if no sections found or page is short
  if (sections.length < 2) {
    return showScrollTop ? (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToTop}
          className="h-10 w-10 rounded-full shadow-lg bg-card border animate-fade-in"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </div>
    ) : null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
      {showScrollTop && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToTop}
          className="h-10 w-10 rounded-full shadow-lg bg-card border animate-fade-in"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full shadow-lg bg-card border gap-2 px-4 animate-fade-in"
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">Jump to</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-popover">
          <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
            <Navigation className="h-3 w-3" />
            Page Sections
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sections.map((section) => (
            <DropdownMenuItem
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "cursor-pointer flex items-center gap-2",
                section.level === 2 && "pl-6",
                section.level === 3 && "pl-9",
                activeId === section.id && "bg-accent"
              )}
            >
              <Circle 
                className={cn(
                  "h-2 w-2 transition-colors",
                  activeId === section.id 
                    ? "fill-primary text-primary" 
                    : "text-muted-foreground/50"
                )} 
              />
              <span className="truncate">{section.title}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
