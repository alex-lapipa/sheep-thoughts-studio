-- Create mentor trigger events table for analytics
CREATE TABLE public.mentor_trigger_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id TEXT NOT NULL,
  mentor_name TEXT NOT NULL,
  session_id UUID,
  trigger_words TEXT[] DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_trigger_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert trigger events (fire-and-forget from edge functions)
CREATE POLICY "Anyone can record mentor triggers"
ON public.mentor_trigger_events
FOR INSERT
WITH CHECK (true);

-- Admins can view all events
CREATE POLICY "Admins can view mentor analytics"
ON public.mentor_trigger_events
FOR SELECT
USING (can_access_admin(auth.uid()));

-- Create index for analytics queries
CREATE INDEX idx_mentor_trigger_events_mentor_id ON public.mentor_trigger_events(mentor_id);
CREATE INDEX idx_mentor_trigger_events_created_at ON public.mentor_trigger_events(created_at DESC);