-- Add RLS policies for bubbles_scenarios to allow admin management

-- Allow admins to insert scenarios
CREATE POLICY "Admins can insert bubbles_scenarios"
ON public.bubbles_scenarios
FOR INSERT
WITH CHECK (can_access_admin(auth.uid()));

-- Allow admins to update scenarios
CREATE POLICY "Admins can update bubbles_scenarios"
ON public.bubbles_scenarios
FOR UPDATE
USING (can_access_admin(auth.uid()))
WITH CHECK (can_access_admin(auth.uid()));

-- Allow admins to delete scenarios
CREATE POLICY "Admins can delete bubbles_scenarios"
ON public.bubbles_scenarios
FOR DELETE
USING (can_access_admin(auth.uid()));