-- Create table for submitted questions
CREATE TABLE public.submitted_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'added_to_faq')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  notes TEXT,
  ip_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.submitted_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit questions (insert)
CREATE POLICY "Anyone can submit questions"
ON public.submitted_questions
FOR INSERT
WITH CHECK (true);

-- Admins and ops can view and manage submitted questions
CREATE POLICY "Admins and ops can manage submitted questions"
ON public.submitted_questions
FOR ALL
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'ops'::user_role));

-- Add index for status filtering
CREATE INDEX idx_submitted_questions_status ON public.submitted_questions(status);
CREATE INDEX idx_submitted_questions_submitted_at ON public.submitted_questions(submitted_at DESC);