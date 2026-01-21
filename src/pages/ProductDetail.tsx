import { useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useProductByHandle } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { getRandomBubble, BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "@/components/ModeBadge";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useProductByHandle(handle || '');
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);

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
  
  const modeTag = product.tags?.find((tag: string) => 
    ['innocent', 'concerned', 'triggered', 'savage'].includes(tag.toLowerCase())
  )?.toLowerCase() as BubbleMode | undefined;

  // Find matching variant based on selected options
  const selectedVariant = variants.find((v: { node: { selectedOptions: Array<{ name: string; value: string }> } }) => {
    return v.node.selectedOptions.every(
      opt => selectedOptions[opt.name] === opt.value || !selectedOptions[opt.name]
    );
  })?.node || variants[0]?.node;

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

    toast.success("Added to cart!", {
      description: product.title,
    });
  };

  const thoughtBubble = modeTag ? getRandomBubble(modeTag) : getRandomBubble();

  return (
    <Layout>
      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              {images[activeImage] ? (
                <img 
                  src={images[activeImage].node.url} 
                  alt={images[activeImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
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
                    <label className="block font-display font-medium mb-2">
                      {option.name}
                    </label>
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

            {/* Add to Cart */}
            <Button 
              size="lg" 
              className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-display"
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
            >
              {cartLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Availability */}
            {selectedVariant?.availableForSale && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                In stock and ready to ship
              </div>
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
      </div>
    </Layout>
  );
};

export default ProductDetail;
