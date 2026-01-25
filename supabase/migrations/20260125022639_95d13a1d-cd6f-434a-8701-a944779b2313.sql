-- Add pod_provider column if not exists
ALTER TABLE public.product_designs
ADD COLUMN IF NOT EXISTS pod_provider text DEFAULT NULL;