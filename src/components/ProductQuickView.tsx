import { useState } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Minus,
  Plus,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { BubbleMode } from "@/data/thoughtBubbles";
import { ModeBadge } from "./ModeBadge";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductQuickViewProps {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  if (!product) return null;

  const { node } = product;
  const images = node.images.edges;
  const variants = node.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const currentImage = images[currentImageIndex]?.node;

  // Get mode from tags
  const modeTag = node.tags?.find(tag => 
    ['innocent', 'concerned', 'triggered', 'savage'].includes(tag.toLowerCase())
  )?.toLowerCase() as BubbleMode | undefined;

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setAddedToCart(false);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || []
    });
    
    // Track add to cart
    ecommerceTracking.addToCart(
      node.id,
      node.title,
      selectedVariant.id,
      parseFloat(selectedVariant.price?.amount || '0'),
      quantity
    );
    
    setAddedToCart(true);
    toast.success("Added to cart!", {
      description: `${quantity}x ${node.title}${selectedVariant.title !== 'Default Title' ? ` - ${selectedVariant.title}` : ''}`,
    });
    
    // Reset after a delay
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleViewFullDetails = () => {
    ecommerceTracking.viewProduct(
      node.id,
      node.title,
      parseFloat(selectedVariant?.price?.amount || '0')
    );
    onOpenChange(false);
  };

  // Group options for better display
  const groupedOptions = node.options?.filter(opt => opt.name !== 'Title') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">{node.title} - Quick View</DialogTitle>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:h-full">
            <AnimatePresence mode="wait">
              {currentImage ? (
                <motion.img
                  key={currentImageIndex}
                  src={currentImage.url}
                  alt={currentImage.altText || node.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </AnimatePresence>

            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        idx === currentImageIndex 
                          ? "bg-white w-4" 
                          : "bg-white/50 hover:bg-white/70"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Mode badge */}
            {modeTag && (
              <div className="absolute top-3 left-3">
                <ModeBadge mode={modeTag} />
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-12 left-3 right-3 flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all",
                      idx === currentImageIndex 
                        ? "border-primary" 
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img 
                      src={img.node.url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="space-y-2 mb-4">
              <h2 className="font-display text-2xl font-bold">{node.title}</h2>
              <p className="text-2xl font-bold text-primary">
                {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {node.description || "No description available."}
            </p>

            {/* Variant Options */}
            {groupedOptions.length > 0 && (
              <div className="space-y-4 mb-6">
                {groupedOptions.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-medium mb-2 block">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        // Find variant with this option value
                        const variantIndex = variants.findIndex(v => 
                          v.node.selectedOptions?.some(
                            opt => opt.name === option.name && opt.value === value
                          )
                        );
                        const variant = variants[variantIndex]?.node;
                        const isSelected = selectedVariant?.selectedOptions?.some(
                          opt => opt.name === option.name && opt.value === value
                        );
                        const isAvailable = variant?.availableForSale !== false;

                        return (
                          <Button
                            key={value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={!isAvailable}
                            onClick={() => variantIndex >= 0 && handleVariantChange(variantIndex)}
                            className={cn(
                              "min-w-[3rem]",
                              !isAvailable && "opacity-50 line-through"
                            )}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium text-lg w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Availability */}
              {selectedVariant && (
                <div className="mb-6">
                  {selectedVariant.availableForSale ? (
                    <Badge variant="secondary" className="bg-affirmative/10 text-affirmative border-affirmative/30">
                      <Check className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/30">
                      <X className="h-3 w-3 mr-1" />
                      Out of Stock
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <Button
                className={cn(
                  "w-full h-12 text-base font-display transition-all",
                  addedToCart 
                    ? "bg-affirmative hover:bg-affirmative/90 text-affirmative-foreground" 
                    : "bg-accent hover:bg-accent-hover text-accent-foreground"
                )}
                onClick={handleAddToCart}
                disabled={isLoading || !selectedVariant?.availableForSale}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : addedToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Link to={`/product/${node.handle}`} onClick={handleViewFullDetails}>
                <Button variant="outline" className="w-full">
                  View Full Details
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
