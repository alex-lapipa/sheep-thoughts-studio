import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://sheep-thoughts-studio.lovable.app";

/**
 * Hook to generate language-aware OG image URLs
 * Returns the appropriate OG image URL based on current language
 */
export function useOgImage(imageName: string) {
  const { language } = useLanguage();
  
  // For static OG images, append language suffix if not English
  // e.g., og-home.jpg -> og-home-es.jpg for Spanish
  const getOgImageUrl = (): string => {
    // Check if we have a language-specific version
    if (language !== "en") {
      // Try language-specific version first (e.g., og-home-es.jpg)
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
 * Get language-aware OG image URL without hook (for use outside components)
 */
export function getLanguageAwareOgImage(imageName: string, language: string): string {
  if (language !== "en") {
    const baseName = imageName.replace(/\.jpg$/, "");
    return `${SITE_URL}/${baseName}-${language}.jpg`;
  }
  return `${SITE_URL}/${imageName}`;
}

export { SITE_URL };
