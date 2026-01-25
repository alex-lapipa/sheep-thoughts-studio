import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { createElement } from 'react';

interface OrderNotification {
  orderId: string | number;
  orderName: string;
  customerEmail: string;
  totalPrice: string;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export function useOrderNotifications() {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  const formatCurrency = useCallback((amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(num);
  }, []);

  const showOrderToast = useCallback((order: OrderNotification) => {
    toast.success(`New Order: ${order.orderName}`, {
      description: `${formatCurrency(order.totalPrice, order.currency)} • ${order.itemCount} item${order.itemCount !== 1 ? 's' : ''} • ${order.customerEmail}`,
      duration: 8000,
      icon: createElement(ShoppingCart, { className: 'h-5 w-5 text-green-500' }),
      action: {
        label: 'View Orders',
        onClick: () => {
          window.location.href = '/admin/orders';
        },
      },
    });
  }, [formatCurrency]);

  useEffect(() => {
    // Only subscribe if user is authenticated (admin)
    if (!user) {
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    const channel = supabase.channel('admin-notifications', {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on('broadcast', { event: 'new_order' }, ({ payload }) => {
        console.log('Received new order notification:', payload);
        showOrderToast(payload as OrderNotification);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to admin notifications channel');
          isSubscribedRef.current = true;
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user, showOrderToast]);

  // Function to manually trigger a test notification (for development)
  const sendTestNotification = useCallback(async () => {
    if (!channelRef.current) {
      toast.error('Not connected to notifications');
      return;
    }

    await channelRef.current.send({
      type: 'broadcast',
      event: 'new_order',
      payload: {
        orderId: 'test-' + Date.now(),
        orderName: '#TEST-1001',
        customerEmail: 'test@example.com',
        totalPrice: '49.99',
        currency: 'EUR',
        itemCount: 2,
        createdAt: new Date().toISOString(),
      },
    });
  }, []);

  return { sendTestNotification };
}
