-- Add character_for_finding to stories (frontend migration mirror)
-- Used by frontend admin and preview flows to display 'character for finding' images per story

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS character_for_finding TEXT[];

COMMENT ON COLUMN stories.character_for_finding IS 'Array of URLs to character-for-finding images (story pages format) for interactive/search stories';

CREATE INDEX IF NOT EXISTS idx_stories_character_for_finding ON stories USING GIN (character_for_finding);
