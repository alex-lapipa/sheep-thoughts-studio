-- Create storage bucket for cached OG images
INSERT INTO storage.buckets (id, name, public)
VALUES ('og-images', 'og-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to OG images
CREATE POLICY "OG images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'og-images');

-- Allow service role to insert/update/delete OG images (edge functions use service role)
CREATE POLICY "Service role can manage OG images"
ON storage.objects FOR ALL
USING (bucket_id = 'og-images' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'og-images' AND auth.role() = 'service_role');