-- Simple migration to add tone and language columns
ALTER TABLE voice_assistants ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'friendly';
ALTER TABLE voice_assistants ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';
