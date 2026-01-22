-- Allow admins to delete OG images from storage
CREATE POLICY "Admins can delete OG images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'og-images' 
  AND can_access_admin(auth.uid())
);