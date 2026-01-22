-- Add RLS policy to allow admins and ops to delete contact messages
CREATE POLICY "Admins and ops can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::user_role) 
  OR has_role(auth.uid(), 'ops'::user_role) 
  OR has_role(auth.uid(), 'super_admin'::user_role)
);