import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";

// Supported languages with their hreflang codes
// Includes DACH regional variants for more precise targeting
const SUPPORTED_LANGUAGES = [
  { code: "en", hreflang: "en" },
  { code: "ga", hreflang: "ga" },
  { code: "es", hreflang: "es" },
  { code: "es-ES", hreflang: "es-ES" },
  { code: "es-MX", hreflang: "es-MX" },
  { code: "es-AR", hreflang: "es-AR" },
  { code: "es-CO", hreflang: "es-CO" },
  { code: "es-419", hreflang: "es-419" },
  { code: "fr", hreflang: "fr" },
  { code: "fr-FR", hreflang: "fr-FR" },
  { code: "fr-BE", hreflang: "fr-BE" },
  { code: "fr-LU", hreflang: "fr-LU" },
  { code: "de", hreflang: "de" },
  { code: "de-DE", hreflang: "de-DE" },
  { code: "de-AT", hreflang: "de-AT" },
  { code: "de-CH", hreflang: "de-CH" },
] as const;

// Regional page mappings
const DACH_PAGES = ["/dach", "/de", "/at", "/ch"];
const HISPANIC_PAGES = ["/es", "/mx", "/ar", "/co", "/latam"];
const FRANCOPHONE_PAGES = ["/fr", "/be", "/lu"];
const GAELIC_PAGES = ["/ga"];

interface HreflangTagsProps {
  // Optional override for the current path
  path?: string;
}

/**
 * HreflangTags component adds hreflang link elements for multilingual SEO.
 * These tags help search engines understand which language versions of a page exist
 * and serve the correct version to users based on their language preferences.
 */
export function HreflangTags({ path }: HreflangTagsProps) {
  const location = useLocation();
  const { language: currentLanguage } = useLanguage();
  
  // Use provided path or current location
  const currentPath = path || location.pathname;
  
  // Check page type
  const isDACHPage = DACH_PAGES.some(p => currentPath.startsWith(p));
  const isHispanicPage = HISPANIC_PAGES.some(p => currentPath.startsWith(p));
  const isFrancophonePage = FRANCOPHONE_PAGES.some(p => currentPath.startsWith(p));
  const isGaelicPage = GAELIC_PAGES.some(p => currentPath.startsWith(p));
  
  // Build the full URL for each language variant
  const getLanguageUrl = (langCode: string) => {
    // Clean path (remove trailing slash except for root)
    const cleanPath = currentPath === "/" ? "" : currentPath.replace(/\/$/, "");
    
    // For Gaelic pages
    if (isGaelicPage) {
      if (langCode === "ga") return `${SITE_URL}/ga`;
      return `${SITE_URL}${cleanPath}`;
    }
    
    // For DACH pages
    if (isDACHPage) {
      switch (langCode) {
        case "de-DE": return `${SITE_URL}/de`;
        case "de-AT": return `${SITE_URL}/at`;
        case "de-CH": return `${SITE_URL}/ch`;
        case "de": return `${SITE_URL}/dach`;
        default: return `${SITE_URL}${cleanPath}`;
      }
    }
    
    // For Hispanic pages
    if (isHispanicPage) {
      switch (langCode) {
        case "es-ES": return `${SITE_URL}/es`;
        case "es-MX": return `${SITE_URL}/mx`;
        case "es-AR": return `${SITE_URL}/ar`;
        case "es-CO": return `${SITE_URL}/co`;
        case "es-419": return `${SITE_URL}/latam`;
        case "es": return `${SITE_URL}/es`;
        default: return `${SITE_URL}${cleanPath}`;
      }
    }
    
    // For Francophone pages
    if (isFrancophonePage) {
      switch (langCode) {
        case "fr-FR": return `${SITE_URL}/fr`;
        case "fr-BE": return `${SITE_URL}/be`;
        case "fr-LU": return `${SITE_URL}/lu`;
        case "fr": return `${SITE_URL}/fr`;
        default: return `${SITE_URL}${cleanPath}`;
      }
    }
    
    return `${SITE_URL}${cleanPath}`;
  };

  // Get the appropriate lang attribute for the HTML element
  const getHtmlLang = (): string => {
    if (isGaelicPage) {
      return "ga";
    }
    if (isDACHPage) {
      if (currentPath.startsWith("/at")) return "de-AT";
      if (currentPath.startsWith("/ch")) return "de-CH";
      if (currentPath.startsWith("/de")) return "de-DE";
      return "de";
    }
    if (isHispanicPage) {
      if (currentPath.startsWith("/mx")) return "es-MX";
      if (currentPath.startsWith("/ar")) return "es-AR";
      if (currentPath.startsWith("/co")) return "es-CO";
      if (currentPath.startsWith("/latam")) return "es-419";
      return "es-ES";
    }
    if (isFrancophonePage) {
      if (currentPath.startsWith("/be")) return "fr-BE";
      if (currentPath.startsWith("/lu")) return "fr-LU";
      return "fr-FR";
    }
    return currentLanguage;
  };

  return (
    <Helmet>
      {/* Add hreflang for each supported language */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.hreflang}
          href={getLanguageUrl(lang.code)}
        />
      ))}
      
      {/* x-default for language selector or fallback */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}${currentPath === "/" ? "" : currentPath}`}
      />
      
      {/* Set the html lang attribute based on current language or DACH region */}
      <html lang={getHtmlLang()} />
    </Helmet>
  );
}

export default HreflangTags;
