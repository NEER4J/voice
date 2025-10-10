-- Add recording_url column to voice_conversations table
ALTER TABLE voice_conversations
ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Add index for recording_url for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_conversations_recording_url ON voice_conversations(recording_url);

-- Add comment to document the column
COMMENT ON COLUMN voice_conversations.recording_url IS 'URL to the call recording from Vapi';

-- Also ensure vapi_call_id column exists and has proper index
ALTER TABLE voice_conversations
ADD COLUMN IF NOT EXISTS vapi_call_id TEXT;

CREATE INDEX IF NOT EXISTS idx_voice_conversations_vapi_call_id ON voice_conversations(vapi_call_id);

COMMENT ON COLUMN voice_conversations.vapi_call_id IS 'Vapi call ID for fetching transcript and recording';
