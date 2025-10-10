-- Check if user profiles exist and create them if needed
-- Run this in Supabase SQL Editor

-- Check existing users
SELECT 
    u.id,
    u.name,
    u.auth_user_id,
    u.call_count,
    u.created_at
FROM users u
ORDER BY u.created_at DESC
LIMIT 10;

-- Check if there are any users without profiles
SELECT 
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;
