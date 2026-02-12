-- Storage Bucket Setup for Book Template Images
-- Run this in your Supabase SQL Editor
-- 
-- Storage Structure:
-- /book-templates/[template-name]/cover_image.png
-- /book-templates/[template-name]/copyright_page_image.png
-- /book-templates/[template-name]/dedication_page_image.png
-- /book-templates/[template-name]/story-page-1.png
-- /book-templates/[template-name]/story-page-2.png
-- /book-templates/[template-name]/last_story_page_image.png
-- /book-templates/[template-name]/back_cover_image.png

-- Create the storage bucket for book images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-images',
  'book-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all images
CREATE POLICY "Public read access to book images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload book images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-images');

-- Allow admins to update images
CREATE POLICY "Admins can update book images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete book images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-images' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'book-images';
