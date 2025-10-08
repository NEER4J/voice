# Quick Setup Guide

## The Issue
The "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" error means the API is returning HTML instead of JSON, which usually indicates a database schema issue.

## Solution

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-migration-simple.sql`
4. Click "Run" to execute the migration

### Step 2: Verify the Migration

After running the migration, check that these columns exist in your `users` table:
- `auth_user_id` (UUID)
- `preferred_mode` (TEXT)
- `onboarding_completed` (BOOLEAN)

### Step 3: Test the Onboarding

1. Try the onboarding flow again
2. Check the browser console for detailed error messages
3. Check the server logs in your terminal

## Alternative: Manual Database Setup

If the migration doesn't work, you can manually add the columns:

```sql
-- Add the required columns
ALTER TABLE users ADD COLUMN auth_user_id UUID;
ALTER TABLE users ADD COLUMN preferred_mode TEXT;
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;

-- Add to voice_conversations table
ALTER TABLE voice_conversations ADD COLUMN user_auth_id UUID;
```

## Debugging

The updated onboarding API now includes detailed logging. Check your terminal/console for:

1. "Onboarding API called" - API is being reached
2. "Request data: ..." - Data is being received
3. "Auth check: ..." - Authentication status
4. "Updating user profile for: ..." - User ID being used
5. Any error messages with specific details

## Common Issues

1. **Database columns don't exist** - Run the migration
2. **Authentication fails** - Check Supabase configuration
3. **RLS policies blocking access** - The migration includes proper policies
4. **User not found** - The API now handles both update and insert cases

## Next Steps

After running the migration:
1. Try the onboarding flow again
2. If it works, you should be redirected to the dashboard
3. If not, check the console logs for specific error messages

The error should be resolved once the database schema is properly set up!
