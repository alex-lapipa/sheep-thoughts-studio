-- Add confirmation token and pending status support for double opt-in
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS confirmation_token text,
ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token 
ON public.newsletter_subscribers(confirmation_token) 
WHERE confirmation_token IS NOT NULL;