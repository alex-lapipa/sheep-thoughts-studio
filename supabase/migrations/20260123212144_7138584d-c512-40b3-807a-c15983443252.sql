-- Add admin management policies for bubbles_knowledge
CREATE POLICY "Admins can insert knowledge entries"
ON public.bubbles_knowledge
FOR INSERT
WITH CHECK (can_access_admin(auth.uid()));

CREATE POLICY "Admins can update knowledge entries"
ON public.bubbles_knowledge
FOR UPDATE
USING (can_access_admin(auth.uid()))
WITH CHECK (can_access_admin(auth.uid()));

CREATE POLICY "Admins can delete knowledge entries"
ON public.bubbles_knowledge
FOR DELETE
USING (can_access_admin(auth.uid()));