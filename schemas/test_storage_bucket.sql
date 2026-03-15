-- Quick Test: Verify Storage Bucket Setup
-- Run these queries in Supabase SQL Editor to check your storage configuration

-- 1. Check if the bucket exists
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'book-images';

-- Expected result: Should return 1 row with bucket details
-- If no rows: The bucket doesn't exist yet - run storage_bucket_setup.sql


-- 2. Check storage policies for the bucket
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Expected result: Should show policies for SELECT, INSERT, UPDATE, DELETE
-- If no rows: Policies are missing - run storage_bucket_setup.sql


-- 3. List all storage buckets (to see what buckets you have)
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- This shows all your storage buckets
-- If 'book-images' is missing, you need to create it


-- 4. Check if you have admin access (verify you're an admin)
SELECT 
  id,
  email,
  role
FROM users
WHERE id = auth.uid();

-- Expected result: Should show your user with role = 'admin'
-- If role is not 'admin': You need admin privileges to upload images


-- 5. Test query to see if storage.objects table is accessible
SELECT count(*) as total_files
FROM storage.objects
WHERE bucket_id = 'book-images';

-- Expected result: Number of files in the bucket (0 if newly created)
-- If error: Check if storage extension is enabled
