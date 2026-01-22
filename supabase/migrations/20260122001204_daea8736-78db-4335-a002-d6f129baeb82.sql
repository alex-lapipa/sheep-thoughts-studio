-- Create table for GDPR deletion requests
CREATE TABLE public.deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  notes TEXT,
  ip_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit deletion requests (no auth required for GDPR compliance)
CREATE POLICY "Anyone can submit deletion requests"
ON public.deletion_requests
FOR INSERT
WITH CHECK (true);

-- Admins and ops can view and manage deletion requests
CREATE POLICY "Admins and ops can manage deletion requests"
ON public.deletion_requests
FOR ALL
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'ops'::user_role));

-- Add index for faster lookups
CREATE INDEX idx_deletion_requests_status ON public.deletion_requests(status);
CREATE INDEX idx_deletion_requests_email ON public.deletion_requests(email);