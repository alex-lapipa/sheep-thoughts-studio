import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to handle smooth scrolling to anchor links on page load or navigation
 * @param offset - Offset from top for fixed header (default: -100)
 */
export function useSmoothScroll(offset: number = -100) {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [location.hash, offset]);
}

/**
 * Programmatically scroll to a section by ID
 * @param id - The element ID to scroll to
 * @param offset - Offset from top for fixed header (default: -100)
 */
export function scrollToSection(id: string, offset: number = -100) {
  const element = document.getElementById(id);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
