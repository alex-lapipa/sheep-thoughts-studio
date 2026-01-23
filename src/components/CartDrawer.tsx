import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { analytics } from "@/lib/analytics";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { useABProductTracking } from "@/hooks/useABTracking";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const { trackCheckoutStart } = useABProductTracking();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || 'EUR';

  useEffect(() => { 
    if (isOpen) {
      syncCart();
      analytics.openCart(totalItems);
    }
  }, [isOpen, syncCart, totalItems]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      analytics.beginCheckout(totalItems, totalPrice, currency);
      ecommerceTracking.beginCheckout(totalItems, totalPrice, currency);
      trackCheckoutStart(); // Track for A/B test
      window.open(checkoutUrl, '_blank');
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0">
              {totalItems > 9 ? '9+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0">
        {/* Header */}
        <SheetHeader className="flex-shrink-0 p-4 sm:p-6 pb-0 sm:pb-0">
          <SheetTitle className="font-display text-lg sm:text-xl">Your Cart</SheetTitle>
          <SheetDescription className="text-sm">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-4 sm:pt-6 px-4 sm:px-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-display text-sm sm:text-base">Bubbles thinks you should add something...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6 min-h-0">
                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 sm:gap-4 p-3 rounded-lg bg-secondary/30">
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img 
                            src={item.product.node.images.edges[0].node.url} 
                            alt={item.product.node.title} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h4 className="font-display font-semibold text-sm sm:text-base line-clamp-2">{item.product.node.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{item.selectedOptions.map(option => option.value).join(' • ')}</p>
                        <p className="font-semibold mt-auto text-sm sm:text-base">{item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive" 
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8" 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 sm:w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8" 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Checkout Footer - Fixed at bottom */}
              <div className="flex-shrink-0 space-y-3 sm:space-y-4 pt-4 pb-4 sm:pb-6 border-t bg-background -mx-4 sm:-mx-6 px-4 sm:px-6 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-display font-semibold">Total</span>
                  <span className="text-lg sm:text-xl font-display font-bold">{items[0]?.price.currencyCode || 'EUR'} {totalPrice.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  className="w-full bg-accent hover:bg-accent-hover text-accent-foreground h-12 sm:h-11 text-base" 
                  size="lg" 
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout via Shopify
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
