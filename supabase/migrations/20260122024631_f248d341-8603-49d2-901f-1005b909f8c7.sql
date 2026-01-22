-- Add preferences column to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
ADD COLUMN preferences jsonb DEFAULT '{"announcements": true, "product_drops": true, "weekly_digest": true, "promotions": true}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.newsletter_subscribers.preferences IS 'Email preferences: announcements, product_drops, weekly_digest, promotions';