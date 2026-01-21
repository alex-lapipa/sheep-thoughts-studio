-- Step 1: Add super_admin to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';