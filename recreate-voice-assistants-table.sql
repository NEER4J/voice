-- Drop the table if it exists to recreate it properly
DROP TABLE IF EXISTS voice_assistants CASCADE;

-- Recreate voice_assistants table
CREATE TABLE voice_assistants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    vapi_assistant_id TEXT NOT NULL UNIQUE,
    tone TEXT DEFAULT 'friendly',
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_assistants_user_id ON voice_assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode ON voice_assistants(mode);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_tone ON voice_assistants(tone);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_language ON voice_assistants(language);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_vapi_assistant_id ON voice_assistants(vapi_assistant_id);

-- Add comments to document the table and columns
COMMENT ON TABLE voice_assistants IS 'Stores Vapi assistant configurations for each user';
COMMENT ON COLUMN voice_assistants.id IS 'Primary key for the assistant record';
COMMENT ON COLUMN voice_assistants.user_id IS 'Reference to the user who owns this assistant';
COMMENT ON COLUMN voice_assistants.mode IS 'The mode/type of assistant (e.g., Assistant, Coach, etc.)';
COMMENT ON COLUMN voice_assistants.vapi_assistant_id IS 'The Vapi assistant ID from the Vapi API';
COMMENT ON COLUMN voice_assistants.tone IS 'The tone of the assistant (professional, casual, friendly)';
COMMENT ON COLUMN voice_assistants.language IS 'The language of the assistant (english, arabic)';
COMMENT ON COLUMN voice_assistants.created_at IS 'When the assistant was created';
COMMENT ON COLUMN voice_assistants.updated_at IS 'When the assistant was last updated';

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voice_assistants_updated_at 
    BEFORE UPDATE ON voice_assistants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
