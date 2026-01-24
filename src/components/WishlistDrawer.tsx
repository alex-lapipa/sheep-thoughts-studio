import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function WishlistDrawer() {
  const { items, removeItem, clearWishlist, syncWithCloud, loadFromCloud, isLoading, isSynced } = useWishlistStore();
  const addToCart = useCartStore(state => state.addItem);
  const { user } = useAuth();

  // Sync with cloud when user logs in
  useEffect(() => {
    if (user?.id) {
      loadFromCloud(user.id);
    }
  }, [user?.id, loadFromCloud]);

  // Auto-sync when items change and user is logged in
  useEffect(() => {
    if (user?.id && !isSynced && items.length > 0) {
      const timeout = setTimeout(() => {
        syncWithCloud(user.id);
      }, 2000); // Debounce sync
      return () => clearTimeout(timeout);
    }
  }, [user?.id, items, isSynced, syncWithCloud]);

  const handleAddToCart = async (item: typeof items[0]) => {
    // This would need the full product data - for now just show message
    toast.info('View product to add to cart', {
      description: 'Click on the product to see all variants',
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {items.length}
            </Badge>
          )}
          <span className="sr-only">Wishlist</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Wishlist
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? 'Save products you love for later'
              : `${items.length} saved item${items.length !== 1 ? 's' : ''}`
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Your wishlist is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Click the heart icon on products to save them
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.productId} 
                    className="flex gap-3 p-3 bg-muted/30 rounded-lg group"
                  >
                    <Link 
                      to={`/product/${item.handle}`}
                      className="w-16 h-16 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0"
                    >
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Heart className="h-6 w-6" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${item.handle}`}
                        className="font-medium text-sm line-clamp-2 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm font-semibold mt-1">
                        {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="flex-shrink-0 pt-4 border-t space-y-3">
                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Sign in to sync your wishlist across devices
                  </p>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      clearWishlist();
                      toast.info('Wishlist cleared');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/collections/all">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
