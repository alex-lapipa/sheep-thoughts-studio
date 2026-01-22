-- Create hall_of_fame_submissions table for user-submitted nuclear meltdown moments
CREATE TABLE public.hall_of_fame_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  challenge TEXT NOT NULL,
  nuclear_response TEXT NOT NULL,
  inner_thought TEXT,
  category TEXT NOT NULL DEFAULT 'Culture',
  tags TEXT[] DEFAULT '{}',
  submitter_name TEXT,
  submitter_email TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_spam BOOLEAN DEFAULT false,
  spam_score NUMERIC,
  spam_reasons TEXT[],
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  votes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hall_of_fame_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit (insert)
CREATE POLICY "Anyone can submit hall of fame entries"
ON public.hall_of_fame_submissions
FOR INSERT
WITH CHECK (true);

-- Policy: Approved entries are publicly visible
CREATE POLICY "Approved submissions are viewable"
ON public.hall_of_fame_submissions
FOR SELECT
USING (status = 'approved' OR auth.uid() IS NOT NULL);

-- Policy: Admins can update
CREATE POLICY "Admins can update submissions"
ON public.hall_of_fame_submissions
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Policy: Admins can delete
CREATE POLICY "Admins can delete submissions"
ON public.hall_of_fame_submissions
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create index for faster status queries
CREATE INDEX idx_hall_of_fame_submissions_status ON public.hall_of_fame_submissions(status);
CREATE INDEX idx_hall_of_fame_submissions_submitted_at ON public.hall_of_fame_submissions(submitted_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_hall_of_fame_submissions_updated_at
BEFORE UPDATE ON public.hall_of_fame_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.hall_of_fame_submissions IS 'User-submitted nuclear meltdown moments for Hall of Fame consideration';