import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://bubblesheep.xyz";
const SUPABASE_URL = "https://exdpmwoucahnfbgpzmzr.supabase.co/functions/v1";

// Map of page types to their dynamic OG image function names
const DYNAMIC_OG_ENDPOINTS: Record<string, string> = {
  "og-about.jpg": "og-about-image",
  "og-achievements.jpg": "og-achievements-image",
  "og-collections.jpg": "og-collections-image",
  "og-contact.jpg": "og-contact-image",
  "og-explains.jpg": "og-explains-image",
  "og-facts.jpg": "og-facts-image",
  "og-faq.jpg": "og-faq-image",
  "og-home.jpg": "og-home-image",
  "og-privacy.jpg": "og-privacy-image",
  "og-shipping.jpg": "og-shipping-image",
  "og-dach.jpg": "og-dach-image",
  "og-francophone.jpg": "og-francophone-image",
};

/**
 * Hook to generate language-aware OG image URLs
 * Returns the appropriate OG image URL based on current language
 * Supports both static images and dynamic edge function endpoints
 */
export function useOgImage(imageName: string, useDynamic: boolean = true) {
  const { language } = useLanguage();
  
  const getOgImageUrl = (): string => {
    // Check if we have a dynamic endpoint for this image
    const dynamicEndpoint = DYNAMIC_OG_ENDPOINTS[imageName];
    
    if (useDynamic && dynamicEndpoint) {
      // Use the edge function endpoint with language param
      return `${SUPABASE_URL}/${dynamicEndpoint}?lang=${language}`;
    }
    
    // Fallback to static images
    if (language !== "en") {
      const langSuffix = `-${language}`;
      const baseName = imageName.replace(/\.jpg$/, "");
      return `${SITE_URL}/${baseName}${langSuffix}.jpg`;
    }
    return `${SITE_URL}/${imageName}`;
  };

  return {
    ogImageUrl: getOgImageUrl(),
    siteUrl: SITE_URL,
    language,
  };
}

/**
 * Get dynamic OG image URL for a specific page type
 */
export function getDynamicOgImageUrl(pageType: string, language: string = "en"): string {
  const endpoint = DYNAMIC_OG_ENDPOINTS[`og-${pageType}.jpg`];
  if (endpoint) {
    return `${SUPABASE_URL}/${endpoint}?lang=${language}`;
  }
  return `${SITE_URL}/og-${pageType}.jpg`;
}

/**
 * Get language-aware OG image URL without hook (for use outside components)
 */
export function getLanguageAwareOgImage(imageName: string, language: string): string {
  const dynamicEndpoint = DYNAMIC_OG_ENDPOINTS[imageName];
  
  if (dynamicEndpoint) {
    return `${SUPABASE_URL}/${dynamicEndpoint}?lang=${language}`;
  }
  
  if (language !== "en") {
    const baseName = imageName.replace(/\.jpg$/, "");
    return `${SITE_URL}/${baseName}-${language}.jpg`;
  }
  return `${SITE_URL}/${imageName}`;
}

export { SITE_URL, SUPABASE_URL };
