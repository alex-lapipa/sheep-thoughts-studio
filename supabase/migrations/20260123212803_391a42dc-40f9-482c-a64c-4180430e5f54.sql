-- Create A/B test events table for homepage variant tracking
CREATE TABLE public.ab_test_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  test_name TEXT NOT NULL DEFAULT 'homepage_layout',
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (anonymous tracking)
CREATE POLICY "Anyone can record AB test events"
ON public.ab_test_events
FOR INSERT
WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view AB test analytics"
ON public.ab_test_events
FOR SELECT
USING (can_access_admin(auth.uid()));

-- Create indexes for analytics queries
CREATE INDEX idx_ab_test_events_variant ON public.ab_test_events(variant);
CREATE INDEX idx_ab_test_events_test_name ON public.ab_test_events(test_name);
CREATE INDEX idx_ab_test_events_event_type ON public.ab_test_events(event_type);
CREATE INDEX idx_ab_test_events_session_id ON public.ab_test_events(session_id);
CREATE INDEX idx_ab_test_events_created_at ON public.ab_test_events(created_at DESC);