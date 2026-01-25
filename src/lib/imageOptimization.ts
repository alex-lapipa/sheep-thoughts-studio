/**
 * Shopify CDN image optimization utilities
 * Uses Shopify's image transformation API for optimal performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  scale?: 1 | 2 | 3;
  format?: 'jpg' | 'pjpg' | 'png' | 'webp';
}

/**
 * Optimize a Shopify CDN image URL with size and format parameters
 * @param url - Original Shopify image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export function optimizeShopifyImage(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return '';
  
  const { width, height, crop = 'center', scale = 1, format } = options;
  
  // Check if it's a Shopify CDN URL
  if (!url.includes('cdn.shopify.com')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    // Build size modifier
    const sizeParams: string[] = [];
    if (width) sizeParams.push(`${width * scale}x`);
    else if (height) sizeParams.push(`x${height * scale}`);
    
    if (crop && (width || height)) {
      sizeParams.push(`crop_${crop}`);
    }
    
    // Construct optimized URL
    const sizeModifier = sizeParams.length > 0 ? `_${sizeParams.join('_')}` : '';
    const finalExtension = format || extension;
    
    urlObj.pathname = `${basePath}${sizeModifier}.${finalExtension}`;
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Get responsive image srcset for Shopify images
 * @param url - Original Shopify image URL
 * @param sizes - Array of widths for srcset
 * @returns srcset string
 */
export function getShopifySrcSet(
  url: string | undefined | null,
  sizes: number[] = [200, 400, 600, 800, 1200]
): string {
  if (!url) return '';
  
  return sizes
    .map(size => `${optimizeShopifyImage(url, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Predefined size presets for common use cases
 */
export const IMAGE_PRESETS = {
  cartThumbnail: { width: 80, height: 80, crop: 'center' as const },
  productCard: { width: 400, height: 400, crop: 'center' as const },
  productGallery: { width: 800, height: 800, crop: 'center' as const },
  productHero: { width: 1200, crop: 'center' as const },
  quickView: { width: 600, height: 600, crop: 'center' as const },
  wishlistItem: { width: 120, height: 120, crop: 'center' as const },
} as const;
