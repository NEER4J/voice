# Debug API Errors

## Current Issue: "Mode and userId are required"

This error is coming from the `/api/voice/create-assistant` route. The issue has been fixed by updating the API to use authentication instead of requiring a userId parameter.

## What Was Fixed

### 1. Updated `/api/voice/create-assistant`
- **Before**: Required `mode` and `userId` parameters
- **After**: Only requires `mode` parameter, gets user from authentication

### 2. Added Authentication Checks
- Both APIs now check for authenticated user
- Added detailed logging to debug authentication issues

### 3. Updated Middleware
- Added logging to see if middleware is blocking API calls
- API routes should bypass middleware

## Debug Steps

### 1. Check Console Logs
Look for these messages in your browser console and terminal:

**Browser Console:**
- "Testing API connectivity..." ✅
- "API test successful: {message: 'API is working', ...}" ✅
- "Creating assistant for mode: [mode]" ✅
- "Assistant created: [assistantId]" ✅

**Terminal/Server Logs:**
- "Skipping middleware for API route: /api/voice/create-assistant" ✅
- "Create assistant request: {mode: '[mode]'}" ✅
- "Authenticated user: [userId]" ✅
- "Assistant created: [assistantId]" ✅

### 2. Test API Directly
You can test the API directly in browser console:

```javascript
// Test create-assistant API
fetch('/api/voice/create-assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'Assistant' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### 3. Check Authentication
Make sure you're logged in:
- Go to `/dashboard` - should work if authenticated
- Check if user profile exists in database
- Verify `auth_user_id` is set correctly

## Common Issues & Solutions

### Issue 1: "Authentication required"
- **Cause**: User not logged in or session expired
- **Solution**: Log in again or check Supabase configuration

### Issue 2: "User profile not found"
- **Cause**: User exists in auth but not in users table
- **Solution**: Complete onboarding or check database migration

### Issue 3: "Call limit reached"
- **Cause**: User has used all 3 calls
- **Solution**: Wait for next day or reset call count in database

### Issue 4: "Assistant or Squad or Workflow must be provided"
- **Cause**: Vapi call started without valid assistantId
- **Solution**: Should be fixed with the new automatic assistant creation

## Expected Flow

1. **User clicks "Start Call"** → Shows "Setting up..."
2. **Create assistant API called** → Should return assistantId
3. **Create conversation API called** → Should return conversationId
4. **Vapi call starts** → With valid assistantId
5. **Call proceeds** → Normal voice conversation

## Next Steps

1. **Try the onboarding flow again**
2. **Check console logs for detailed error messages**
3. **Verify authentication is working**
4. **Test API endpoints directly if needed**

The error should be resolved with the updated API routes!
