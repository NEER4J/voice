-- Complete database fix for RLS policies
-- This addresses all the authentication and RLS issues

-- 1. Fix voice_assistants table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public access to voice_assistants" ON voice_assistants;
DROP POLICY IF EXISTS "Authenticated users can insert voice_assistants" ON voice_assistants;
DROP POLICY IF EXISTS "Authenticated users can update voice_assistants" ON voice_assistants;

-- Create new policies for voice_assistants
-- Assistants are shared resources, so authenticated users can manage them
CREATE POLICY "Authenticated users can view assistants" ON voice_assistants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert assistants" ON voice_assistants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assistants" ON voice_assistants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. Ensure users table RLS policies are correct
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view and update their own profile" ON users;
DROP POLICY IF EXISTS "Allow public access to users" ON users;

-- Create proper user policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- 3. Ensure voice_conversations table RLS policies are correct
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view and manage their own conversations" ON voice_conversations;
DROP POLICY IF EXISTS "Allow public access to voice_conversations" ON voice_conversations;

-- Create proper conversation policies
CREATE POLICY "Users can view their own conversations" ON voice_conversations
  FOR SELECT USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can create their own conversations" ON voice_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_auth_id);

CREATE POLICY "Users can update their own conversations" ON voice_conversations
  FOR UPDATE USING (auth.uid() = user_auth_id);

-- 4. Ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_assistants ENABLE ROW LEVEL SECURITY;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_auth_id ON voice_conversations(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode ON voice_assistants(mode);
CREATE INDEX IF NOT EXISTS idx_voice_assistants_vapi_id ON voice_assistants(vapi_assistant_id);

-- 6. Verify the setup
-- This query should return the current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('users', 'voice_conversations', 'voice_assistants')
ORDER BY tablename, policyname;
