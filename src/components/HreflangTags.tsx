import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";

// Supported languages with their hreflang codes
const SUPPORTED_LANGUAGES = [
  { code: "en", hreflang: "en" },
  { code: "es", hreflang: "es" },
  { code: "fr", hreflang: "fr" },
] as const;

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
  
  // Build the full URL for each language variant
  // For now, we use query params for language switching (could be subdomains or subdirectories)
  const getLanguageUrl = (langCode: string) => {
    // Clean path (remove trailing slash except for root)
    const cleanPath = currentPath === "/" ? "" : currentPath.replace(/\/$/, "");
    
    // Option 1: Using query parameter approach
    // return `${SITE_URL}${cleanPath}?lang=${langCode}`;
    
    // Option 2: Using the same URL (site handles language via context/localStorage)
    // This is suitable when the content is dynamically translated client-side
    return `${SITE_URL}${cleanPath}`;
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
      
      {/* Set the html lang attribute based on current language */}
      <html lang={currentLanguage} />
    </Helmet>
  );
}

export default HreflangTags;
