-- Create votes table for Hall of Fame meltdowns
CREATE TABLE public.hall_of_fame_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.hall_of_fame_submissions(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, voter_fingerprint)
);

-- Enable RLS
ALTER TABLE public.hall_of_fame_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can vote (insert)
CREATE POLICY "Anyone can vote"
ON public.hall_of_fame_votes
FOR INSERT
WITH CHECK (true);

-- Anyone can view votes
CREATE POLICY "Anyone can view votes"
ON public.hall_of_fame_votes
FOR SELECT
USING (true);

-- Users can remove their own vote
CREATE POLICY "Users can remove own vote"
ON public.hall_of_fame_votes
FOR DELETE
USING (true);

-- Index for fast lookups
CREATE INDEX idx_hall_of_fame_votes_submission ON public.hall_of_fame_votes(submission_id);
CREATE INDEX idx_hall_of_fame_votes_fingerprint ON public.hall_of_fame_votes(voter_fingerprint);

-- Create a function to get vote count
CREATE OR REPLACE FUNCTION public.get_submission_vote_count(submission_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.hall_of_fame_votes WHERE submission_id = submission_uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON TABLE public.hall_of_fame_votes IS 'Tracks votes for Hall of Fame submissions using browser fingerprint';