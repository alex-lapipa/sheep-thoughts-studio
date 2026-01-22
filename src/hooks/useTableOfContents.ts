import { useState, useEffect, useCallback } from 'react';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function useTableOfContents(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string>('');

  const handleScroll = useCallback(() => {
    if (items.length === 0) return;

    const scrollPosition = window.scrollY + 120; // Account for header offset
    
    // Find the current section based on scroll position
    let currentId = items[0]?.id || '';
    
    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) {
        const { offsetTop } = element;
        if (scrollPosition >= offsetTop) {
          currentId = item.id;
        }
      }
    }

    setActiveId(currentId);
  }, [items]);

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

  return { activeId, scrollToSection };
}
