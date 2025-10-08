# UserId Reference Error Fix

## Issue Resolved
The error "ReferenceError: userId is not defined" was occurring in the `/api/voice/start-call` route when trying to update the user's call count.

## Root Cause
The code was trying to use a variable `userId` that doesn't exist. It should be using `userProfile.id` instead.

## Error Details
```
ReferenceError: userId is not defined
at POST (app\api\voice\start-call\route.ts:124:17)
```

## Solution Implemented

### 1. Fixed Variable Reference
**Before**: Using undefined `userId` variable
```typescript
.eq('id', userId);  // ❌ userId is not defined
```

**After**: Using correct `userProfile.id` variable
```typescript
.eq('id', userProfile.id);  // ✅ Correct reference
```

### 2. Enhanced Debugging
Added detailed logging to track the call count update process:
```typescript
console.log('Updating call count:', { 
  userId: userProfile.id, 
  currentCount: userProfile.call_count,
  newCount: userProfile.call_count + 1
});
```

### 3. Better Error Handling
Enhanced error logging for call count update failures:
```typescript
if (updateError) {
  console.error('Failed to update call count:', updateError);
  return NextResponse.json(
    { error: 'Failed to update call count' },
    { status: 500 }
  );
}
```

## How It Works Now

1. **User starts conversation** → VoiceInterface calls start-call API
2. **API gets user profile** → From authenticated session
3. **Creates conversation record** → Links to user and assistant
4. **Updates call count** → Uses correct userProfile.id reference
5. **Returns success** → With conversation details

## Expected Flow

The voice conversation should now work properly:
1. **Click "Start Call"** → Shows "Setting up..."
2. **Creates assistant** → Stores in database successfully
3. **Creates conversation** → Links to user and assistant
4. **Updates call count** → Increments user's call count
5. **Starts Vapi call** → With valid assistantId
6. **Proceeds normally** → Full voice conversation

## Debug Information

The API now includes detailed logging. Check your console and terminal for:
- "Updating call count: {userId: ..., currentCount: ..., newCount: ...}"
- "Call count updated successfully"
- "Conversation created successfully: {id: ...}"

## Files Updated

- `app/api/voice/start-call/route.ts` - Fixed userId reference and added debugging

## Testing

Try the voice conversation flow again:
1. **Start a new conversation** → Should work without ReferenceError
2. **Check console logs** → Should see call count update logs
3. **Complete the call** → Should increment call count properly

The "ReferenceError: userId is not defined" error should be resolved! 🎉
