import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopifyProduct } from '@/lib/shopify';
import { useWishlistStore } from '@/stores/wishlistStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistButtonProps {
  product: ShopifyProduct;
  variant?: 'icon' | 'full';
  className?: string;
}

export function WishlistButton({ product, variant = 'icon', className }: WishlistButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { isInWishlist, toggleItem } = useWishlistStore();
  
  const isWishlisted = isInWishlist(product.node.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    toggleItem(product);
    
    if (!isWishlisted) {
      toast.success('Added to wishlist', {
        description: product.node.title,
      });
    } else {
      toast.info('Removed from wishlist');
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'full') {
    return (
      <Button
        variant={isWishlisted ? 'secondary' : 'outline'}
        onClick={handleClick}
        className={cn(
          'gap-2 transition-all',
          isAnimating && 'scale-95',
          className
        )}
      >
        <Heart 
          className={cn(
            'h-4 w-4 transition-all',
            isWishlisted && 'fill-red-500 text-red-500',
            isAnimating && 'scale-125'
          )} 
        />
        {isWishlisted ? 'Saved' : 'Save to Wishlist'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        'h-9 w-9 rounded-full transition-all',
        isWishlisted && 'bg-red-50 dark:bg-red-950',
        isAnimating && 'scale-110',
        className
      )}
    >
      <Heart 
        className={cn(
          'h-5 w-5 transition-all',
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
          isAnimating && 'scale-125'
        )} 
      />
      <span className="sr-only">
        {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      </span>
    </Button>
  );
}
