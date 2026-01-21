-- Create table to track share events
CREATE TABLE public.share_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL, -- 'thought', 'scenario', 'citation', etc.
  content_id text, -- optional: specific content ID
  content_title text, -- for display purposes
  share_method text NOT NULL DEFAULT 'native', -- 'native', 'clipboard', 'twitter', etc.
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous shares allowed)
CREATE POLICY "Anyone can record shares"
ON public.share_events
FOR INSERT
WITH CHECK (true);

-- Anyone can read share counts (for displaying indicators)
CREATE POLICY "Anyone can view share stats"
ON public.share_events
FOR SELECT
USING (true);

-- Create index for efficient counting
CREATE INDEX idx_share_events_content ON public.share_events(content_type, content_id);
CREATE INDEX idx_share_events_recent ON public.share_events(created_at DESC);