import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const REDIRECT_KEY = "bubbles_lang_redirect_shown";
const DACH_LANGUAGES = ["de", "de-de", "de-at", "de-ch"];
const SPANISH_LANGUAGES = ["es", "es-es", "es-mx", "es-ar", "es-co", "es-cl", "es-pe", "es-ve", "es-419"];
const DACH_PATHS = ["/dach", "/de", "/at", "/ch"];
const HISPANIC_PATHS = ["/es", "/mx", "/ar", "/co", "/latam"];

/**
 * Detects browser language and redirects users to regional pages on first visit.
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
    const isSpanishSpeaker = SPANISH_LANGUAGES.some(lang => browserLang.startsWith(lang));

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
    } else if (isSpanishSpeaker) {
      // Mark as shown before redirecting
      localStorage.setItem(REDIRECT_KEY, "true");
      
      // Determine specific region based on language
      let targetPath = "/es";
      if (browserLang.includes("-mx")) {
        targetPath = "/mx";
      } else if (browserLang.includes("-ar")) {
        targetPath = "/ar";
      } else if (browserLang.includes("-co")) {
        targetPath = "/co";
      } else if (browserLang === "es-419" || browserLang.includes("-cl") || browserLang.includes("-pe") || browserLang.includes("-ve")) {
        targetPath = "/latam";
      }

      navigate(targetPath, { replace: true });
    } else {
      // Not German or Spanish, mark as checked so we don't keep checking
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
 * Check if user is on a Hispanic page
 */
export function useIsHispanicPage() {
  const location = useLocation();
  return HISPANIC_PATHS.some(path => location.pathname.startsWith(path));
}

/**
 * Reset the redirect flag (for testing or user preference)
 */
export function resetLanguageRedirect() {
  localStorage.removeItem(REDIRECT_KEY);
}
