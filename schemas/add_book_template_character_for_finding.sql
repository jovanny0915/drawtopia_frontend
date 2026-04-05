-- Add character_for_finding to book_templates (frontend migration)
-- Used by admin UI for interactive/story search-and-find templates

ALTER TABLE book_templates
ADD COLUMN IF NOT EXISTS character_for_finding TEXT[];

COMMENT ON COLUMN book_templates.character_for_finding IS 'Array of URLs to character-for-finding images (story pages format) for interactive story templates';

CREATE INDEX IF NOT EXISTS idx_book_templates_character_for_finding ON book_templates USING GIN (character_for_finding);
