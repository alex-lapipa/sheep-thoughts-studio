-- Fix function search_path for update_abandoned_cart_timestamp
CREATE OR REPLACE FUNCTION public.update_abandoned_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix function search_path for get_submission_vote_count
CREATE OR REPLACE FUNCTION public.get_submission_vote_count(submission_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.hall_of_fame_votes WHERE submission_id = submission_uuid;
$$;

-- Tighten spam_training_log INSERT policy to require authentication
DROP POLICY IF EXISTS "Anyone can insert training logs" ON public.spam_training_log;
CREATE POLICY "Admins can insert training logs"
ON public.spam_training_log
FOR INSERT
WITH CHECK (public.can_access_admin(auth.uid()));

-- Tighten audit_logs INSERT to only allow authenticated users (already done but strengthen to require actual user)
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Tighten og_cache_events to require authentication
DROP POLICY IF EXISTS "Service role can insert cache events" ON public.og_cache_events;
CREATE POLICY "Authenticated users can insert cache events"
ON public.og_cache_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Tighten character_combination_feedback UPDATE to own entries
DROP POLICY IF EXISTS "Authenticated users can update feedback" ON public.character_combination_feedback;
CREATE POLICY "Admins can update feedback"
ON public.character_combination_feedback
FOR UPDATE
USING (public.can_access_admin(auth.uid()));

-- Tighten stock_notifications UPDATE to require admin
DROP POLICY IF EXISTS "Service role can update notifications" ON public.stock_notifications;
CREATE POLICY "Admins can update notifications"
ON public.stock_notifications
FOR UPDATE
USING (public.can_access_admin(auth.uid()));

-- Tighten hall_of_fame_votes DELETE (no public deletes - votes are permanent)
DROP POLICY IF EXISTS "Users can remove own vote" ON public.hall_of_fame_votes;
-- Votes should be permanent to prevent manipulation