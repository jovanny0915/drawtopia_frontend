-- SQL Migration: Add story_world field to book_templates table
-- This field is used to match book templates with story worlds (forest, underwater, outerspace)

-- Add story_world column if it doesn't exist
ALTER TABLE book_templates 
ADD COLUMN IF NOT EXISTS story_world TEXT;

-- Add a check constraint to ensure story_world has valid values
ALTER TABLE book_templates 
DROP CONSTRAINT IF EXISTS valid_story_world;

ALTER TABLE book_templates 
ADD CONSTRAINT valid_story_world 
CHECK (story_world IS NULL OR story_world IN ('forest', 'underwater', 'outerspace'));

-- Add index for better query performance when filtering by story_world
CREATE INDEX IF NOT EXISTS idx_book_templates_story_world ON book_templates(story_world);

-- Add comment to describe the column
COMMENT ON COLUMN book_templates.story_world IS 'Story world theme: forest, underwater, or outerspace. Used to match templates with story creation flow.';
