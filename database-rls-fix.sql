-- Fix RLS policies for voice_assistants table
-- Allow authenticated users to insert and manage assistant records

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public access to voice_assistants" ON voice_assistants;
DROP POLICY IF EXISTS "Authenticated users can insert voice_assistants" ON voice_assistants;
DROP POLICY IF EXISTS "Authenticated users can update voice_assistants" ON voice_assistants;

-- Create new policies that allow authenticated users to manage assistants
-- Since assistants are shared resources, authenticated users should be able to create them
CREATE POLICY "Authenticated users can view assistants" ON voice_assistants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert assistants" ON voice_assistants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update assistants" ON voice_assistants
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Also ensure the table has RLS enabled
ALTER TABLE voice_assistants ENABLE ROW LEVEL SECURITY;
