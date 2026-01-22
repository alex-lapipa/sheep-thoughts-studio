import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const REDIRECT_KEY = "bubbles_lang_redirect_shown";
const REGION_PREF_KEY = "bubbles_region_preference";
const DACH_LANGUAGES = ["de", "de-de", "de-at", "de-ch"];
const SPANISH_LANGUAGES = ["es", "es-es", "es-mx", "es-ar", "es-co", "es-cl", "es-pe", "es-ve", "es-419"];
const DACH_PATHS = ["/dach", "/de", "/at", "/ch"];
const HISPANIC_PATHS = ["/es", "/mx", "/ar", "/co", "/latam"];
const FRANCOPHONE_PATHS = ["/fr", "/be", "/lu"];

// All valid region paths
const ALL_REGION_PATHS = ["/", ...DACH_PATHS, ...HISPANIC_PATHS, ...FRANCOPHONE_PATHS];

/**
 * Save the user's region preference
 */
export function saveRegionPreference(path: string) {
  // Normalize the path (remove query params)
  const normalizedPath = path.split("?")[0];
  localStorage.setItem(REGION_PREF_KEY, normalizedPath);
}

/**
 * Get the saved region preference
 */
export function getRegionPreference(): string | null {
  return localStorage.getItem(REGION_PREF_KEY);
}

/**
 * Clear the region preference
 */
export function clearRegionPreference() {
  localStorage.removeItem(REGION_PREF_KEY);
}

/**
 * Detects browser language and redirects users to regional pages on first visit.
 * Also checks for saved region preferences and redirects accordingly.
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

    // First, check for saved region preference
    const savedRegion = getRegionPreference();
    if (savedRegion && savedRegion !== "/" && ALL_REGION_PATHS.includes(savedRegion)) {
      navigate(savedRegion, { replace: true });
      setHasChecked(true);
      return;
    }

    // Check if we've already shown the browser language redirect
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
      localStorage.setItem(REDIRECT_KEY, "true");
      
      let targetPath = "/dach";
      if (browserLang.includes("-at")) {
        targetPath = "/at";
      } else if (browserLang.includes("-ch")) {
        targetPath = "/ch";
      } else if (browserLang.includes("-de") || browserLang === "de") {
        targetPath = "/de";
      }

      navigate(targetPath, { replace: true });
    } else if (isSpanishSpeaker) {
      localStorage.setItem(REDIRECT_KEY, "true");
      
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
  localStorage.removeItem(REGION_PREF_KEY);
}
