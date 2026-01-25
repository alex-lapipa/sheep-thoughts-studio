import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShoppingCart, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  playOrderSound, 
  getSoundSettings, 
  saveSoundSettings,
  testNotificationSound 
} from '@/lib/notificationSound';

interface OrderNotification {
  id: string;
  orderId: string | number;
  orderName: string;
  customerEmail: string;
  totalPrice: string;
  currency: string;
  itemCount: number;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'admin-order-notifications';
const MAX_NOTIFICATIONS = 20;

export function OrderNotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  // Load sound settings on mount
  useEffect(() => {
    const settings = getSoundSettings();
    setSoundEnabled(settings.enabled);
    setVolume(settings.volume);
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OrderNotification[];
        setNotifications(parsed);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
  }, [notifications]);

  const formatCurrency = useCallback((amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(num);
  }, []);

  const addNotification = useCallback((order: Omit<OrderNotification, 'id' | 'read'>) => {
    const newNotification: OrderNotification = {
      ...order,
      id: `${order.orderId}-${Date.now()}`,
      read: false,
    };
    
    // Play sound for new order
    playOrderSound();
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    saveSoundSettings({ enabled });
    if (enabled) {
      testNotificationSound();
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    saveSoundSettings({ volume: newVolume });
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;
    if (isSubscribedRef.current) return;

    const channel = supabase.channel('admin-notifications-bell', {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'new_order' }, ({ payload }) => {
        console.log('Bell received new order:', payload);
        addNotification(payload as Omit<OrderNotification, 'id' | 'read'>);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Bell subscribed to notifications');
          isSubscribedRef.current = true;
        }
      });

    channel
      .on('broadcast', { event: 'new_order' }, ({ payload }) => {
        console.log('Bell received new order:', payload);
        addNotification(payload as Omit<OrderNotification, 'id' | 'read'>);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Bell subscribed to notifications');
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
  }, [user, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Mark all as read when dropdown opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Delay marking as read so user sees the unread state briefly
      setTimeout(markAllAsRead, 1500);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Recent Orders
          </span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSoundSettings(!showSoundSettings);
                  }}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sound settings</TooltipContent>
            </Tooltip>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  clearAll();
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        {showSoundSettings && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound alerts</span>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              {soundEnabled && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Volume</span>
                    <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    onValueCommit={() => testNotificationSound()}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent orders</p>
            <p className="text-xs mt-1">New orders will appear here</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !notification.read && "bg-accent/50"
                )}
                onClick={() => markAsRead(notification.id)}
                asChild
              >
                <Link to="/admin/orders">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-foreground">
                      {notification.orderName}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {formatCurrency(notification.totalPrice, notification.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span className="truncate max-w-[140px]">
                      {notification.customerEmail}
                    </span>
                    <span>
                      {notification.itemCount} item{notification.itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                  {!notification.read && (
                    <div className="absolute right-3 top-3">
                      <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                    </div>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link 
            to="/admin/orders" 
            className="flex items-center justify-center gap-2 text-sm font-medium"
          >
            View all orders
            <ExternalLink className="h-3 w-3" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
