-- SQL Migration: Book Templates Table
-- This table stores book template configurations for the admin panel

CREATE TABLE IF NOT EXISTS book_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- Image URLs stored from Supabase storage
  cover_image TEXT, -- URL to cover image
  copyright_page_image TEXT, -- URL to copyright page image
  dedication_page_image TEXT, -- URL to dedication page image
  story_page_images TEXT[], -- Array of URLs to story page images
  last_story_page_image TEXT, -- URL to last story page image
  back_cover_image TEXT, -- URL to back cover image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_book_templates_created_at ON book_templates(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE book_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read book templates
CREATE POLICY "Allow admins to read book_templates" ON book_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can insert book templates
CREATE POLICY "Allow admins to insert book_templates" ON book_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can delete book templates
CREATE POLICY "Allow admins to delete book_templates" ON book_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Only admins can update book templates
CREATE POLICY "Allow admins to update book_templates" ON book_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert a default template as an example
INSERT INTO book_templates (name)
VALUES ('Standard Book')
ON CONFLICT DO NOTHING;
