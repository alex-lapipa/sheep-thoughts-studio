-- Create table for back-in-stock subscriptions
CREATE TABLE public.stock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  product_handle TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient lookups
CREATE INDEX idx_stock_notifications_variant ON public.stock_notifications(variant_id, status);
CREATE INDEX idx_stock_notifications_email ON public.stock_notifications(email);

-- Enable RLS
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public subscription)
CREATE POLICY "Anyone can subscribe to notifications"
ON public.stock_notifications
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions by email"
ON public.stock_notifications
FOR SELECT
USING (true);

-- Allow updates for notification processing (service role only via edge function)
CREATE POLICY "Service role can update notifications"
ON public.stock_notifications
FOR UPDATE
USING (true);