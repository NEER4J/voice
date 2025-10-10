-- Create voice_conversations table
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL,
  vapi_call_id text NULL,
  duration_seconds integer NULL,
  transcript jsonb NULL,
  started_at timestamp with time zone NULL DEFAULT now(),
  ended_at timestamp with time zone NULL,
  assistant_id uuid NULL,
  user_auth_id uuid NULL,
  recording_url text NULL,
  CONSTRAINT voice_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT voice_conversations_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users (id),
  CONSTRAINT voice_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for voice_conversations
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_id ON public.voice_conversations USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_conversations_started_at ON public.voice_conversations USING btree (started_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_conversations_assistant_id ON public.voice_conversations USING btree (assistant_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_conversations_user_auth_id ON public.voice_conversations USING btree (user_auth_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_conversations_recording_url ON public.voice_conversations USING btree (recording_url) TABLESPACE pg_default;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NULL,
  call_count integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  auth_user_id uuid NULL,
  preferred_mode text NULL,
  onboarding_completed boolean NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users USING btree (auth_user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON public.users USING btree (onboarding_completed) TABLESPACE pg_default;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create voice_assistants table
CREATE TABLE IF NOT EXISTS public.voice_assistants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL,
  vapi_assistant_id text NOT NULL,
  tone text NULL DEFAULT 'friendly'::text,
  language text NULL DEFAULT 'english'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT voice_assistants_pkey PRIMARY KEY (id),
  CONSTRAINT voice_assistants_vapi_assistant_id_key UNIQUE (vapi_assistant_id),
  CONSTRAINT voice_assistants_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for voice_assistants
CREATE INDEX IF NOT EXISTS idx_voice_assistants_user_id ON public.voice_assistants USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_assistants_mode ON public.voice_assistants USING btree (mode) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_assistants_tone ON public.voice_assistants USING btree (tone) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_assistants_language ON public.voice_assistants USING btree (language) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_voice_assistants_vapi_assistant_id ON public.voice_assistants USING btree (vapi_assistant_id) TABLESPACE pg_default;

-- Create trigger for voice_assistants table
DROP TRIGGER IF EXISTS update_voice_assistants_updated_at ON voice_assistants;
CREATE TRIGGER update_voice_assistants_updated_at
    BEFORE UPDATE ON voice_assistants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for voice_conversations.assistant_id
ALTER TABLE public.voice_conversations 
ADD CONSTRAINT voice_conversations_assistant_id_fkey 
FOREIGN KEY (assistant_id) REFERENCES voice_assistants (id) ON DELETE SET NULL;
