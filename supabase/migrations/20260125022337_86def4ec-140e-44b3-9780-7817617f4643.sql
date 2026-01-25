-- Create storage bucket for print files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'print-files',
  'print-files',
  false,
  52428800, -- 50MB limit for high-res print files
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'image/tiff']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for print-files bucket
CREATE POLICY "Authenticated users can upload print files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'print-files');

CREATE POLICY "Authenticated users can view print files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'print-files');

CREATE POLICY "Authenticated users can update their print files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'print-files');

CREATE POLICY "Authenticated users can delete print files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'print-files');

-- Add print_files column to product_designs if not exists
ALTER TABLE public.product_designs
ADD COLUMN IF NOT EXISTS print_files jsonb DEFAULT '[]'::jsonb;

-- Add pod_template_id column to product_designs if not exists
ALTER TABLE public.product_designs
ADD COLUMN IF NOT EXISTS pod_template_id text DEFAULT NULL;