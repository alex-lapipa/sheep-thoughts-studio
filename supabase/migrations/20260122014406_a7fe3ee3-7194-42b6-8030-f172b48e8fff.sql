-- Create ecommerce_events table for tracking product interactions
CREATE TABLE public.ecommerce_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  product_id text,
  product_title text,
  variant_id text,
  price numeric,
  quantity integer DEFAULT 1,
  currency text DEFAULT 'EUR',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecommerce_events ENABLE ROW LEVEL SECURITY;

-- Anyone can record events (anonymous tracking)
CREATE POLICY "Anyone can record ecommerce events"
ON public.ecommerce_events
FOR INSERT
WITH CHECK (true);

-- Admins can view events
CREATE POLICY "Admins can view ecommerce events"
ON public.ecommerce_events
FOR SELECT
USING (can_access_admin(auth.uid()));

-- Create index for efficient querying
CREATE INDEX idx_ecommerce_events_type ON public.ecommerce_events(event_type);
CREATE INDEX idx_ecommerce_events_created ON public.ecommerce_events(created_at DESC);
CREATE INDEX idx_ecommerce_events_product ON public.ecommerce_events(product_id);