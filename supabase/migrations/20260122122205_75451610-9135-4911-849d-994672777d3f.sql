-- Create table for character combination feedback and fine-tuning
CREATE TABLE public.character_combination_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posture TEXT NOT NULL,
  accessory TEXT NOT NULL,
  expression TEXT NOT NULL DEFAULT 'neutral',
  status TEXT NOT NULL DEFAULT 'review' CHECK (status IN ('approved', 'review', 'needs-work', 'rejected')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  design_issues TEXT[],
  priority INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(posture, accessory, expression)
);

-- Enable RLS
ALTER TABLE public.character_combination_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view combination feedback"
ON public.character_combination_feedback FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert feedback"
ON public.character_combination_feedback FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update feedback"
ON public.character_combination_feedback FOR UPDATE
TO authenticated
USING (true);

-- Create index for common queries
CREATE INDEX idx_combination_feedback_status ON public.character_combination_feedback(status);
CREATE INDEX idx_combination_feedback_posture ON public.character_combination_feedback(posture);

-- Trigger for updated_at
CREATE TRIGGER update_character_combination_feedback_updated_at
BEFORE UPDATE ON public.character_combination_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();