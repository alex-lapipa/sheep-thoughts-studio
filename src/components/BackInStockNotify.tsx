import { useState } from 'react';
import { Bell, BellRing, Loader2, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BackInStockNotifyProps {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  productHandle: string;
  className?: string;
  variant?: 'button' | 'inline';
}

export function BackInStockNotify({
  productId,
  variantId,
  productTitle,
  variantTitle,
  productHandle,
  className,
  variant = 'button',
}: BackInStockNotifyProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('stock-notification-subscribe', {
        body: {
          email,
          productId,
          variantId,
          productTitle,
          variantTitle,
          productHandle,
        },
      });

      if (error) throw error;

      if (data.alreadySubscribed) {
        toast.info("You're already subscribed!", {
          description: "We'll notify you when this item is back in stock.",
        });
      } else {
        toast.success('Subscribed!', {
          description: "We'll email you when this item is back in stock.",
        });
      }

      setIsSubscribed(true);
      setTimeout(() => setOpen(false), 1500);
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'inline') {
    return (
      <div className={cn('bg-muted/50 rounded-lg p-4 border border-dashed', className)}>
        <div className="flex items-center gap-2 mb-3">
          <BellRing className="h-5 w-5 text-accent" />
          <span className="font-medium">Notify me when available</span>
        </div>
        
        {isSubscribed ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">You'll be notified when this is back!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Notify Me'
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn('gap-2', className)}
        >
          <Bell className="h-4 w-4" />
          Notify When Available
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-accent" />
            Get Notified
          </DialogTitle>
          <DialogDescription>
            Enter your email and we'll let you know when{' '}
            <strong>{productTitle}</strong>
            {variantTitle && variantTitle !== 'Default Title' && (
              <> ({variantTitle})</>
            )}{' '}
            is back in stock.
          </DialogDescription>
        </DialogHeader>

        {isSubscribed ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">You're on the list!</h3>
            <p className="text-sm text-muted-foreground">
              We'll email you at <strong>{email}</strong> when this item is available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Me
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We'll only use your email to notify you about this product.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
