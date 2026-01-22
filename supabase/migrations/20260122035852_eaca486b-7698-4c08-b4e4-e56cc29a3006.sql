-- Create spam patterns table to store learned patterns from admin decisions
CREATE TABLE public.spam_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL, -- 'keyword', 'email_domain', 'email_pattern', 'phrase'
  pattern_value TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 10, -- Score contribution when matched
  match_count INTEGER NOT NULL DEFAULT 1, -- How many times this pattern has been confirmed
  false_positive_count INTEGER NOT NULL DEFAULT 0, -- How many times this was wrongly flagged
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'learned', -- 'learned', 'manual', 'default'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_matched_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(pattern_type, pattern_value)
);

-- Create index for fast lookups
CREATE INDEX idx_spam_patterns_active ON public.spam_patterns(is_active, pattern_type);
CREATE INDEX idx_spam_patterns_weight ON public.spam_patterns(weight DESC) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.spam_patterns ENABLE ROW LEVEL SECURITY;

-- Admins can manage spam patterns
CREATE POLICY "Admins can manage spam patterns"
ON public.spam_patterns
FOR ALL
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'ops'::user_role))
WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'ops'::user_role));

-- Create spam training log to track decisions
CREATE TABLE public.spam_training_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_table TEXT NOT NULL, -- 'contact_messages', 'submitted_questions'
  source_id UUID NOT NULL,
  decision TEXT NOT NULL, -- 'spam', 'not_spam'
  original_score NUMERIC,
  patterns_extracted JSONB DEFAULT '[]'::jsonb,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spam_training_log ENABLE ROW LEVEL SECURITY;

-- Admins can view training log
CREATE POLICY "Admins can view training log"
ON public.spam_training_log
FOR SELECT
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'ops'::user_role));

-- System can insert training logs (via service role)
CREATE POLICY "Anyone can insert training logs"
ON public.spam_training_log
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_spam_patterns_updated_at
BEFORE UPDATE ON public.spam_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();