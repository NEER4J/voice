-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  call_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_assistants table for reusing assistants
CREATE TABLE IF NOT EXISTS voice_assistants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL,
  vapi_assistant_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_conversations table
CREATE TABLE IF NOT EXISTS voice_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES voice_assistants(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  vapi_call_id TEXT,
  duration_seconds INTEGER,
  transcript JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode ON voice_assistants(mode);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_vapi_id ON voice_assistants(vapi_assistant_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_id ON voice_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_assistant_id ON voice_conversations(assistant_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_started_at ON voice_conversations(started_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
-- Users table: Allow public read/write for demo purposes
CREATE POLICY "Allow public access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Voice assistants table: Allow public read/write for demo purposes
CREATE POLICY "Allow public access to voice_assistants" ON voice_assistants
  FOR ALL USING (true) WITH CHECK (true);

-- Voice conversations table: Allow public read/write for demo purposes  
CREATE POLICY "Allow public access to voice_conversations" ON voice_conversations
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_assistants_updated_at 
  BEFORE UPDATE ON voice_assistants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();