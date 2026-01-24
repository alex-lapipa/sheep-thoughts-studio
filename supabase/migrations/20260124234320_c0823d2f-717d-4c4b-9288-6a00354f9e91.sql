-- Create table for tracking abandoned carts
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  cart_id TEXT NOT NULL,
  checkout_url TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovered', 'expired', 'unsubscribed')),
  recovered_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient lookups
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status, created_at);
CREATE INDEX idx_abandoned_carts_cart_id ON public.abandoned_carts(cart_id);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow inserts from edge functions (service role)
CREATE POLICY "Service role can manage abandoned carts"
ON public.abandoned_carts
FOR ALL
USING (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_abandoned_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER update_abandoned_carts_timestamp
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
EXECUTE FUNCTION public.update_abandoned_cart_timestamp();