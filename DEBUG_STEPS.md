# Debug Steps for Onboarding Issue

## Step 1: Test API Connectivity

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try the onboarding flow again
4. Look for these console messages:
   - "Testing API connectivity..."
   - "API test successful:" or "API test failed:"
   - "Onboarding API called"
   - "Auth check:" with user details
   - Any error messages

## Step 2: Check Network Tab

1. In Developer Tools, go to the Network tab
2. Try the onboarding flow again
3. Look for the `/api/user/onboarding` request
4. Check:
   - Status code (should be 200, 401, or 500)
   - Response body (should be JSON, not HTML)
   - Request headers

## Step 3: Check Server Logs

1. Look at your terminal where you're running `npm run dev`
2. Look for console.log messages from the API
3. Check for any error messages

## Step 4: Test Authentication

The issue might be that the user isn't properly authenticated. Check:

1. Are you logged in? (Check if you can access `/dashboard`)
2. Is the user session valid?
3. Are the Supabase environment variables correct?

## Step 5: Manual API Test

You can test the API directly:

1. Open browser console
2. Run this code:
```javascript
fetch('/api/test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

This should return: `{message: "API is working", timestamp: "..."}`

## Step 6: Check Database

1. Go to your Supabase Dashboard
2. Check the `users` table
3. See if there are any users with `auth_user_id` set
4. Check if the user exists in `auth.users` table

## Common Issues & Solutions

### Issue 1: "Unexpected token '<'"
- **Cause**: API returning HTML instead of JSON
- **Solution**: Check if the API route exists and is working

### Issue 2: "Authentication required"
- **Cause**: User not logged in or session expired
- **Solution**: Log in again or check Supabase configuration

### Issue 3: "Database error"
- **Cause**: Database schema issue or RLS policy blocking
- **Solution**: Check database migration and RLS policies

### Issue 4: "Failed to create profile"
- **Cause**: Database constraint violation
- **Solution**: Check if user already exists or email is unique

## Quick Fixes

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache and cookies**

3. **Check environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...
   ```

4. **Test with a fresh user account**

## What to Look For

In the console, you should see:
1. "Testing API connectivity..." ✅
2. "API test successful: {message: 'API is working', ...}" ✅
3. "Onboarding API called" ✅
4. "Auth check: {user: {id: '...', email: '...'}, authError: null}" ✅
5. "Find user result: {existingUser: null, findError: {code: 'PGRST116'}}" ✅
6. "Creating new user" ✅
7. "User created successfully: {id: '...', ...}" ✅
8. "Onboarding completed successfully" ✅

If any of these steps fail, that's where the issue is!
