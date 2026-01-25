import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { useProductByHandle } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Loader2, Check, Expand } from "lucide-react";
import { toast } from "sonner";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { getRandomBubble, BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "@/components/ModeBadge";
import { LowStockBadge, getVariantInventory, calculateTotalInventory } from "@/components/LowStockBadge";
import { analytics } from "@/lib/analytics";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { ImageLightbox } from "@/components/ImageLightbox";
import { BackInStockNotify } from "@/components/BackInStockNotify";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { StickyAddToCart } from "@/components/StickyAddToCart";
import { RecentlyViewedProducts } from "@/components/RecentlyViewedProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useProductByHandle(handle || '');
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();

  // Track product view and add to recently viewed
  useEffect(() => {
    if (product?.title && product?.id && handle) {
      analytics.viewProduct(product.title);
      ecommerceTracking.viewProduct(product.id, product.title, parseFloat(product.priceRange?.minVariantPrice?.amount || '0'));
      
      // Add to recently viewed
      const imageUrl = product.images?.edges?.[0]?.node?.url || '';
      addToRecentlyViewed({
        id: product.id,
        handle,
        title: product.title,
        price: product.priceRange?.minVariantPrice?.amount || '0',
        currencyCode: product.priceRange?.minVariantPrice?.currencyCode || 'EUR',
        imageUrl,
      });
    }
  }, [product?.title, product?.id, product?.priceRange?.minVariantPrice?.amount, handle, addToRecentlyViewed, product?.images?.edges, product?.priceRange?.minVariantPrice?.currencyCode]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <div className="text-6xl mb-4">🐑</div>
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <p className="text-muted-foreground mt-2">This product seems to have wandered off...</p>
        </div>
      </Layout>
    );
  }

  const images = product.images?.edges || [];
  const variants = product.variants?.edges || [];
  const options = product.options || [];
  const price = product.priceRange?.minVariantPrice;
  
  // Calculate total inventory for urgency badge
  const totalInventory = calculateTotalInventory(variants);
  
  const modeTag = product.tags?.find((tag: string) => 
    ['innocent', 'concerned', 'triggered', 'savage'].includes(tag.toLowerCase())
  )?.toLowerCase() as BubbleMode | undefined;

  // Find matching variant based on selected options
  const selectedVariant = variants.find((v: { node: { selectedOptions: Array<{ name: string; value: string }>; quantityAvailable?: number } }) => {
    return v.node.selectedOptions.every(
      opt => selectedOptions[opt.name] === opt.value || !selectedOptions[opt.name]
    );
  })?.node || variants[0]?.node;
  
  // Get current variant's inventory for precise urgency
  const variantInventory = getVariantInventory(selectedVariant);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    });

    // Track add to cart (GA + DB)
    analytics.addToCart(product.title, parseFloat(selectedVariant.price?.amount || '0'));
    ecommerceTracking.addToCart(
      product.id,
      product.title,
      selectedVariant.id,
      parseFloat(selectedVariant.price?.amount || '0')
    );

    toast.success("Added to cart!", {
      description: product.title,
    });
  };

  const thoughtBubble = modeTag ? getRandomBubble(modeTag) : getRandomBubble();

  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  const productUrl = `${siteUrl}/product/${handle}`;
  const ogImageUrl = `${SUPABASE_URL}/functions/v1/og-product-image?title=${encodeURIComponent(product.title)}&price=${encodeURIComponent(price?.amount || '')}&mode=${encodeURIComponent(modeTag || 'innocent')}&type=${encodeURIComponent(product.productType || 'product')}`;

  return (
    <Layout>
      <Helmet>
        <title>{product.title} | Bubbles Merch</title>
        <meta name="description" content={product.description || `${product.title} - Confidently wrong fashion from Bubbles the Sheep.`} />
        <meta property="og:title" content={`${product.title} | Bubbles Merch`} />
        <meta property="og:description" content={product.description || 'Wear your confusion with pride.'} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="product:price:amount" content={price?.amount || ''} />
        <meta property="product:price:currency" content={price?.currencyCode || 'EUR'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.description || 'Confidently wrong fashion.'} />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={productUrl} />
      </Helmet>
      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div 
              className="aspect-square bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              {images[activeImage] ? (
                <>
                  <img 
                    src={images[activeImage].node.url} 
                    alt={images[activeImage].node.altText || product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-3">
                      <Expand className="h-6 w-6" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: { node: { url: string; altText: string | null } }, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImage === idx ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={img.node.url} 
                      alt={img.node.altText || `${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Lightbox */}
            <ImageLightbox
              images={images.map((img: { node: { url: string; altText: string | null } }) => img.node)}
              initialIndex={activeImage}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {modeTag && <ModeBadge mode={modeTag} />}
            
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {product.title}
              </h1>
              <p className="font-display text-2xl font-semibold text-accent">
                {price?.currencyCode} {parseFloat(price?.amount || '0').toFixed(2)}
              </p>
            </div>

            <p className="text-muted-foreground">
              {product.description}
            </p>

            {/* Thought Bubble */}
            <ThoughtBubble mode={modeTag || 'innocent'} size="sm">
              <p className="text-sm italic">"{thoughtBubble.text}"</p>
            </ThoughtBubble>

            {/* Options */}
            {options.length > 0 && options[0].values.length > 1 && (
              <div className="space-y-4">
                {options.map((option: { name: string; values: string[] }) => (
                  <div key={option.name}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-display font-medium">
                        {option.name}
                      </label>
                      {option.name.toLowerCase() === 'size' && (
                        <SizeGuideModal 
                          productType={product.productType?.toLowerCase().includes('hoodie') ? 'hoodie' : 
                                       product.productType?.toLowerCase().includes('cap') ? 'cap' : 'tshirt'} 
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedOptions[option.name] === value || 
                            (!selectedOptions[option.name] && option.values[0] === value)
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Low Stock Urgency Badge */}
            {selectedVariant?.availableForSale && variantInventory > 0 && variantInventory <= 10 && (
              <div className="mb-4">
                <LowStockBadge quantity={variantInventory} />
              </div>
            )}

            {/* Add to Cart or Back in Stock Notify */}
            {selectedVariant?.availableForSale ? (
              <>
                <Button 
                  size="lg" 
                  className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-display"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Check className="h-4 w-4" />
                  In stock and ready to ship
                </div>
              </>
            ) : (
              <BackInStockNotify
                productId={product.id}
                variantId={selectedVariant?.id || ''}
                productTitle={product.title}
                variantTitle={selectedVariant?.title}
                productHandle={handle || ''}
                variant="inline"
              />
            )}

            {/* Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="shipping">
                <AccordionTrigger className="font-display">Shipping & Delivery</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Free shipping on orders over €50. Standard delivery takes 3-5 business days. Express shipping available at checkout.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="font-display">Returns & Exchanges</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  30-day return policy. Items must be unworn and in original packaging. Contact us to initiate a return.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="font-display">Care Instructions</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewedProducts excludeProductId={product.id} />
      </div>

      {/* Sticky Mobile Add to Cart */}
      <StickyAddToCart
        productTitle={product.title}
        price={selectedVariant?.price}
        onAddToCart={handleAddToCart}
        isLoading={cartLoading}
        isAvailable={selectedVariant?.availableForSale ?? false}
      />
    </Layout>
  );
};

export default ProductDetail;
