-- Add INSERT policy for admin users on bubbles_thoughts
CREATE POLICY "Admins can insert bubbles_thoughts"
ON public.bubbles_thoughts
FOR INSERT
TO authenticated
WITH CHECK (public.can_access_admin(auth.uid()));

-- Add UPDATE policy for admin users on bubbles_thoughts
CREATE POLICY "Admins can update bubbles_thoughts"
ON public.bubbles_thoughts
FOR UPDATE
TO authenticated
USING (public.can_access_admin(auth.uid()))
WITH CHECK (public.can_access_admin(auth.uid()));

-- Add DELETE policy for admin users on bubbles_thoughts
CREATE POLICY "Admins can delete bubbles_thoughts"
ON public.bubbles_thoughts
FOR DELETE
TO authenticated
USING (public.can_access_admin(auth.uid()));