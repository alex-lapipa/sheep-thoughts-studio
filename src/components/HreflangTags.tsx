import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";

// Supported languages with their hreflang codes
// Includes DACH regional variants for more precise targeting
const SUPPORTED_LANGUAGES = [
  { code: "en", hreflang: "en" },
  { code: "es", hreflang: "es" },
  { code: "fr", hreflang: "fr" },
  { code: "de", hreflang: "de" },
  { code: "de-DE", hreflang: "de-DE" },
  { code: "de-AT", hreflang: "de-AT" },
  { code: "de-CH", hreflang: "de-CH" },
] as const;

// DACH-specific page mappings
const DACH_PAGES = ["/dach", "/de", "/at", "/ch"];

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
  
  // Check if this is a DACH-specific page
  const isDACHPage = DACH_PAGES.some(p => currentPath.startsWith(p));
  
  // Build the full URL for each language variant
  const getLanguageUrl = (langCode: string) => {
    // Clean path (remove trailing slash except for root)
    const cleanPath = currentPath === "/" ? "" : currentPath.replace(/\/$/, "");
    
    // For DACH pages, map regional variants to specific paths
    if (isDACHPage) {
      switch (langCode) {
        case "de-DE":
          return `${SITE_URL}/de`;
        case "de-AT":
          return `${SITE_URL}/at`;
        case "de-CH":
          return `${SITE_URL}/ch`;
        case "de":
          return `${SITE_URL}/dach`;
        default:
          return `${SITE_URL}${cleanPath}`;
      }
    }
    
    return `${SITE_URL}${cleanPath}`;
  };

  // Get the appropriate lang attribute for the HTML element
  const getHtmlLang = (): string => {
    // For DACH pages, be more specific
    if (isDACHPage) {
      if (currentPath.startsWith("/at")) return "de-AT";
      if (currentPath.startsWith("/ch")) return "de-CH";
      if (currentPath.startsWith("/de")) return "de-DE";
      return "de";
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
