-- Simple Database Migration for Authentication
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_mode TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Step 2: Add user_auth_id to voice_conversations table
ALTER TABLE voice_conversations ADD COLUMN IF NOT EXISTS user_auth_id UUID;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_auth_id ON voice_conversations(user_auth_id);

-- Step 4: Update RLS policies
DROP POLICY IF EXISTS "Allow public access to users" ON users;
DROP POLICY IF EXISTS "Allow public access to voice_conversations" ON voice_conversations;

-- Create new RLS policies for authenticated users
CREATE POLICY "Users can read own data" ON users 
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own data" ON users 
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can read own conversations" ON voice_conversations 
  FOR SELECT USING (auth.uid() = user_auth_id);

CREATE POLICY "Users can create own conversations" ON voice_conversations 
  FOR INSERT WITH CHECK (auth.uid() = user_auth_id);

CREATE POLICY "Users can update own conversations" ON voice_conversations 
  FOR UPDATE USING (auth.uid() = user_auth_id);

-- Step 5: Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, name, email, call_count, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    0,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for auto user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
