-- SQL Migration: Update Book Templates Table to Add Image Fields
-- Run this if you already have a book_templates table and need to add image fields
-- This migration adds URL fields for storing image references from Supabase storage

-- Remove old boolean and array fields if they exist
ALTER TABLE book_templates 
DROP COLUMN IF EXISTS has_cover,
DROP COLUMN IF EXISTS has_copyright_page,
DROP COLUMN IF EXISTS has_dedication_page,
DROP COLUMN IF EXISTS story_rows;

-- Add image URL columns if they don't exist
ALTER TABLE book_templates 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS copyright_page_image TEXT,
ADD COLUMN IF NOT EXISTS dedication_page_image TEXT,
ADD COLUMN IF NOT EXISTS story_page_images TEXT[],
ADD COLUMN IF NOT EXISTS last_story_page_image TEXT,
ADD COLUMN IF NOT EXISTS back_cover_image TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN book_templates.cover_image IS 'URL to cover image stored in Supabase storage bucket: book-templates';
COMMENT ON COLUMN book_templates.copyright_page_image IS 'URL to copyright page image stored in Supabase storage bucket: book-templates';
COMMENT ON COLUMN book_templates.dedication_page_image IS 'URL to dedication page image stored in Supabase storage bucket: book-templates';
COMMENT ON COLUMN book_templates.story_page_images IS 'Array of URLs to story page images stored in Supabase storage bucket: book-templates';
COMMENT ON COLUMN book_templates.last_story_page_image IS 'URL to last story page image stored in Supabase storage bucket: book-templates';
COMMENT ON COLUMN book_templates.back_cover_image IS 'URL to back cover image stored in Supabase storage bucket: book-templates';
