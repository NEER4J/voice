-- Migration to add tone and language fields to voice_assistants table
-- This migration adds support for tone and language customization

-- Add tone and language columns to voice_assistants table
ALTER TABLE voice_assistants 
ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'friendly',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';

-- Update existing records to have default values
UPDATE voice_assistants 
SET tone = 'friendly', language = 'english' 
WHERE tone IS NULL OR language IS NULL;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_voice_assistants_tone ON voice_assistants(tone);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_language ON voice_assistants(language);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode_tone_language ON voice_assistants(mode, tone, language);

-- Update the unique constraint to include tone and language
-- First, drop the existing unique constraint on vapi_assistant_id if it exists
ALTER TABLE voice_assistants DROP CONSTRAINT IF EXISTS voice_assistants_vapi_assistant_id_key;

-- Add a new unique constraint that includes mode, tone, and language
-- This allows multiple assistants with the same vapi_assistant_id but different configurations
ALTER TABLE voice_assistants ADD CONSTRAINT voice_assistants_unique_config 
UNIQUE (mode, tone, language);

-- Update RLS policies if needed (they should still work with the new columns)
-- No changes needed to existing policies as they don't reference the new columns
