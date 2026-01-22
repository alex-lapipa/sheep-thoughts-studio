-- Pre-authorize Alex Lawton's emails as super_admin with full access
-- First, we need to create a pre-authorized users table for automatic role assignment

-- Create pre_authorized_users table to store emails that should get auto-assigned roles
CREATE TABLE IF NOT EXISTS public.pre_authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role public.user_role NOT NULL DEFAULT 'readonly',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pre_authorized_users ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view/manage pre-authorized users
CREATE POLICY "Super admins can view pre-authorized users"
ON public.pre_authorized_users
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage pre-authorized users"
ON public.pre_authorized_users
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Insert Alex Lawton's emails as super_admin and owner
INSERT INTO public.pre_authorized_users (email, name, role, is_owner)
VALUES 
  ('alex@rmtv.io', 'Alex Lawton', 'super_admin', true),
  ('alex@idiomas.io', 'Alex Lawton', 'super_admin', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_owner = EXCLUDED.is_owner,
  updated_at = now();

-- Create function to auto-assign roles when pre-authorized users sign up
CREATE OR REPLACE FUNCTION public.auto_assign_preauthorized_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preauth_record RECORD;
BEGIN
  -- Check if the new user's email is pre-authorized
  SELECT * INTO preauth_record
  FROM public.pre_authorized_users
  WHERE email = NEW.email;
  
  IF FOUND THEN
    -- Assign the pre-authorized role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, preauth_record.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign roles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_preauthorized_role();

-- Also assign roles to existing users if they match pre-authorized emails
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, p.role
FROM auth.users u
JOIN public.pre_authorized_users p ON u.email = p.email
ON CONFLICT (user_id, role) DO NOTHING;