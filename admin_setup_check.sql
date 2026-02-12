-- Admin Setup Verification Script
-- Run this in your Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if users table exists and has role column
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
    AND column_name IN ('id', 'email', 'role')
ORDER BY ordinal_position;

-- 2. Check if book_templates table exists
SELECT 
    table_name
FROM information_schema.tables
WHERE table_name = 'book_templates';

-- 3. List all users and their roles (verify your admin account)
SELECT 
    email,
    role,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'users';

-- 5. Check RLS policies on book_templates table (if it exists)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'book_templates';

-- 6. Check if book_templates has any data
SELECT 
    COUNT(*) as template_count
FROM book_templates;

-- ====================
-- QUICK FIX COMMANDS
-- ====================

-- If you need to add role column to users table:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'adult';

-- To make yourself an admin (replace with your email):
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- To see all columns in users table:
-- SELECT * FROM information_schema.columns WHERE table_name = 'users';
