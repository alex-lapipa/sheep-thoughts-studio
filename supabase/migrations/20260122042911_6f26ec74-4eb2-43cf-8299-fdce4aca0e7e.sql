-- Create table to track OG image cache events
CREATE TABLE public.og_cache_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('hit', 'miss', 'regenerate')),
  image_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create index for efficient querying
CREATE INDEX idx_og_cache_events_created_at ON public.og_cache_events(created_at DESC);
CREATE INDEX idx_og_cache_events_type ON public.og_cache_events(event_type);

-- Enable RLS
ALTER TABLE public.og_cache_events ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to insert events
CREATE POLICY "Service role can insert cache events"
ON public.og_cache_events FOR INSERT
WITH CHECK (true);

-- Allow admins to view cache events
CREATE POLICY "Admins can view cache events"
ON public.og_cache_events FOR SELECT
USING (can_access_admin(auth.uid()));

-- Allow admins to delete old cache events
CREATE POLICY "Admins can delete cache events"
ON public.og_cache_events FOR DELETE
USING (can_access_admin(auth.uid()));