import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const REDIRECT_KEY = "bubbles_lang_redirect_shown";
const DACH_LANGUAGES = ["de", "de-de", "de-at", "de-ch"];
const DACH_PATHS = ["/dach", "/de", "/at", "/ch"];

/**
 * Detects browser language and redirects German-speaking users to DACH page on first visit.
 * Uses localStorage to prevent repeated redirects.
 */
export function useLanguageRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run on homepage
    if (location.pathname !== "/") {
      setHasChecked(true);
      return;
    }

    // Check if we've already shown the redirect
    const hasSeenRedirect = localStorage.getItem(REDIRECT_KEY);
    if (hasSeenRedirect) {
      setHasChecked(true);
      return;
    }

    // Detect browser language
    const browserLang = (navigator.language || navigator.languages?.[0] || "").toLowerCase();
    const isGermanSpeaker = DACH_LANGUAGES.some(lang => browserLang.startsWith(lang));

    if (isGermanSpeaker) {
      // Mark as shown before redirecting
      localStorage.setItem(REDIRECT_KEY, "true");
      
      // Determine specific region based on language
      let targetPath = "/dach";
      if (browserLang.includes("-at")) {
        targetPath = "/dach?region=at";
      } else if (browserLang.includes("-ch")) {
        targetPath = "/dach?region=ch";
      } else if (browserLang.includes("-de") || browserLang === "de") {
        targetPath = "/dach?region=de";
      }

      navigate(targetPath, { replace: true });
    } else {
      // Not German, mark as checked so we don't keep checking
      localStorage.setItem(REDIRECT_KEY, "true");
    }

    setHasChecked(true);
  }, [location.pathname, navigate]);

  return { hasChecked };
}

/**
 * Check if user is on a DACH page
 */
export function useIsDACHPage() {
  const location = useLocation();
  return DACH_PATHS.some(path => location.pathname.startsWith(path));
}

/**
 * Reset the redirect flag (for testing or user preference)
 */
export function resetLanguageRedirect() {
  localStorage.removeItem(REDIRECT_KEY);
}
