-- Create contact_messages table for storing user messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  notes TEXT,
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can send a message)
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- Only admins and ops can view contact messages
CREATE POLICY "Admins and ops can view contact messages"
ON public.contact_messages
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::public.user_role) OR 
  public.has_role(auth.uid(), 'ops'::public.user_role) OR
  public.has_role(auth.uid(), 'super_admin'::public.user_role)
);

CREATE POLICY "Admins and ops can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::public.user_role) OR 
  public.has_role(auth.uid(), 'ops'::public.user_role) OR
  public.has_role(auth.uid(), 'super_admin'::public.user_role)
);