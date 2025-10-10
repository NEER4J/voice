-- Run this SQL in your Supabase SQL Editor
-- This adds the tone and language columns to the voice_assistants table

ALTER TABLE voice_assistants 
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'friendly';

ALTER TABLE voice_assistants 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';

-- Update existing records to have default values
UPDATE voice_assistants 
SET tone = 'friendly', language = 'english' 
WHERE tone IS NULL OR language IS NULL;
