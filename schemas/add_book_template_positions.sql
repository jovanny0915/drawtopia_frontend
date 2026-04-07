-- SQL Migration: Add positions field to book_templates table
-- Stores an array of coordinate objects (jsonb array) for interactive templates

ALTER TABLE book_templates
ADD COLUMN IF NOT EXISTS positions jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN book_templates.positions IS 'JSON array of coordinate objects for template characters: [{"x":0.1,"y":0.2}, ...]';

-- GIN index for fast querying on jsonb array
CREATE INDEX IF NOT EXISTS idx_book_templates_positions ON book_templates USING GIN (positions);
