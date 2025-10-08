-- Database Migration: Add voice_assistants table and update voice_conversations
-- Run this script if you already have the basic tables set up

-- Create voice_assistants table for reusing assistants
CREATE TABLE IF NOT EXISTS voice_assistants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL,
  vapi_assistant_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add assistant_id column to voice_conversations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'voice_conversations' 
        AND column_name = 'assistant_id'
    ) THEN
        ALTER TABLE voice_conversations 
        ADD COLUMN assistant_id UUID REFERENCES voice_assistants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode ON voice_assistants(mode);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_vapi_id ON voice_assistants(vapi_assistant_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_assistant_id ON voice_conversations(assistant_id);

-- Enable Row Level Security (RLS) for voice_assistants table
ALTER TABLE voice_assistants ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for voice_assistants table
CREATE POLICY "Allow public access to voice_assistants" ON voice_assistants
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for voice_assistants
CREATE TRIGGER update_voice_assistants_updated_at 
  BEFORE UPDATE ON voice_assistants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: If you want to make assistant_id required in voice_conversations
-- (Uncomment the line below if you want to enforce this constraint)
-- ALTER TABLE voice_conversations ALTER COLUMN assistant_id SET NOT NULL;
