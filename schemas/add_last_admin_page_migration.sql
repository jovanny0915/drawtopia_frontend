-- Migration: Add last_admin_page_image for "Last Admin Page" (promo page after last story, before back cover)
-- Run in Supabase SQL Editor.

-- 1. Book templates: template image for the last admin page
ALTER TABLE book_templates
ADD COLUMN IF NOT EXISTS last_admin_page_image TEXT;
COMMENT ON COLUMN book_templates.last_admin_page_image IS 'URL to last admin (promo) page template image; shown after last story page, before back cover.';

-- 2. Stories: generated last admin page image URL (per story)
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS last_admin_page_image TEXT;
COMMENT ON COLUMN stories.last_admin_page_image IS 'URL to generated last admin (promo) page image for this story.';
