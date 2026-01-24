-- Fix pricing_rules RLS policy to include super_admin
DROP POLICY IF EXISTS "Admins and merch can manage pricing rules" ON public.pricing_rules;

CREATE POLICY "Admins and merch can manage pricing rules" 
ON public.pricing_rules 
FOR ALL 
USING (is_super_admin(auth.uid()) OR is_admin(auth.uid()) OR has_role(auth.uid(), 'merch'::user_role))
WITH CHECK (is_super_admin(auth.uid()) OR is_admin(auth.uid()) OR has_role(auth.uid(), 'merch'::user_role));