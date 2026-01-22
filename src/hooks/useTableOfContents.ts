import { useState, useEffect, useCallback, useMemo } from 'react';

export interface TocItem {
  id: string;
  title: string;
  level: number;
  children?: TocItem[];
}

// Flatten nested TOC items for scroll tracking
function flattenTocItems(items: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) {
      result.push(...flattenTocItems(item.children));
    }
  }
  return result;
}

export function useTableOfContents(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string>('');

  // Flatten items for scroll tracking
  const flatItems = useMemo(() => flattenTocItems(items), [items]);

  const handleScroll = useCallback(() => {
    if (flatItems.length === 0) return;

    const scrollPosition = window.scrollY + 120; // Account for header offset
    
    // Find the current section based on scroll position
    let currentId = flatItems[0]?.id || '';
    
    for (const item of flatItems) {
      const element = document.getElementById(item.id);
      if (element) {
        const { offsetTop } = element;
        if (scrollPosition >= offsetTop) {
          currentId = item.id;
        }
      }
    }

    setActiveId(currentId);
  }, [flatItems]);

  useEffect(() => {
    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return { activeId, scrollToSection, flatItems };
}
