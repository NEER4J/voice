# Authentication & Dashboard Setup Guide

## Overview

This guide covers the complete authentication and dashboard refactor implementation. The app now uses proper Supabase authentication with user onboarding, conversation history, and a flat black & white theme.

## Database Setup

### 1. Run the Authentication Migration

Execute the `database-auth-migration.sql` script in your Supabase SQL editor:

```sql
-- This script adds:
-- - auth_user_id column to users table
-- - preferred_mode and onboarding_completed columns
-- - user_auth_id column to voice_conversations table
-- - Proper RLS policies for authentication
-- - Auto-creation of user profiles on signup
```

### 2. Verify Database Schema

After running the migration, your tables should have:

**users table:**
- `id` (UUID, primary key)
- `auth_user_id` (UUID, references auth.users)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT, nullable)
- `preferred_mode` (TEXT, nullable)
- `onboarding_completed` (BOOLEAN, default false)
- `call_count` (INTEGER, default 0)
- `created_at`, `updated_at` (TIMESTAMPS)

**voice_conversations table:**
- `user_auth_id` (UUID, references auth.users)
- All existing columns remain

## Environment Variables

Ensure you have these environment variables in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vapi
VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
```

## New Features

### 1. Authentication Flow

- **Public Landing Page**: Marketing page for unauthenticated users
- **Login/Signup**: Existing auth pages with updated styling
- **Onboarding**: New user flow to set up profile and preferences
- **Dashboard**: Main user interface with conversation history

### 2. User Onboarding

New users go through a 3-step onboarding process:

1. **Welcome**: Introduction to the app
2. **Profile Setup**: Name and phone number
3. **Mode Selection**: Choose preferred conversation partner

### 3. Dashboard Features

- **Start New Conversation**: Select mode and start talking
- **Conversation History**: View past conversations with filtering
- **User Profile**: Display remaining calls and user info
- **Quick Actions**: Resume conversations or start new ones

### 4. Conversation Management

- **New Conversation**: `/conversation/new?mode=Assistant`
- **View Transcript**: `/conversation/[id]` - Full conversation details
- **Resume**: Start new conversation with same mode

## API Routes

### User Management
- `GET/PUT /api/user/profile` - Get/update user profile
- `POST /api/user/onboarding` - Complete onboarding

### Conversation Management
- `GET /api/conversations/list` - Get conversation history
- `GET /api/conversations/[id]` - Get specific conversation

### Voice Integration
- `POST /api/voice/check-user` - Check user and call limits (authenticated)
- `POST /api/voice/create-assistant` - Create/reuse Vapi assistant
- `POST /api/voice/start-call` - Start voice conversation
- `POST /api/voice/end-call` - End conversation

## Theme System

### Flat Black & White Design

The app now uses a minimalist flat design with:

- **No shadows** - Clean, flat cards with borders only
- **Black & white color scheme** - Pure monochrome with gray accents
- **Consistent borders** - 1px borders throughout
- **Theme support** - Light and dark modes
- **Smooth transitions** - 200ms theme transitions

### CSS Classes

Use these utility classes for consistent styling:

- `flat-card` - Flat card with border, no shadow
- `flat-button` - Flat button with border
- `flat-button-primary` - Primary flat button
- `flat-button-destructive` - Destructive flat button
- `flat-input` - Flat input with border

## Component Structure

### New Components

1. **OnboardingFlow** - Multi-step user onboarding
2. **DashboardHeader** - User info and navigation
3. **NewConversationCard** - Start new conversations
4. **ConversationCard** - Display conversation info
5. **ConversationHistory** - List and filter conversations

### Updated Components

All existing components updated with flat theme:
- VoiceInterface
- ModeSelector
- EmailPhoneForm
- All shadcn components

## User Flow

### For New Users

1. Visit landing page
2. Click "Get Started" → Sign up
3. Complete onboarding (profile + mode selection)
4. Redirected to dashboard
5. Start first conversation

### For Returning Users

1. Visit app → Redirected to dashboard
2. View conversation history
3. Start new conversation or resume previous
4. Manage profile and settings

## Security Features

### Row Level Security (RLS)

- Users can only access their own data
- Conversations are user-scoped
- Proper authentication checks on all API routes

### Call Limits

- 3 calls per day per user
- 60 seconds per call
- Automatic call count tracking

## File Structure

```
app/
├── (public)/
│   └── page.tsx                    # Landing page
├── (protected)/
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── onboarding/page.tsx        # User onboarding
│   └── conversation/
│       ├── new/page.tsx           # Start new conversation
│       └── [id]/page.tsx          # View conversation
├── api/
│   ├── user/
│   │   ├── profile/route.ts       # User profile API
│   │   └── onboarding/route.ts   # Onboarding API
│   ├── conversations/
│   │   ├── list/route.ts          # Conversation list
│   │   └── [id]/route.ts         # Specific conversation
│   └── voice/                     # Voice API routes (updated)
└── auth/                          # Existing auth pages

components/
├── onboarding-flow.tsx            # Onboarding component
├── dashboard-header.tsx           # Dashboard header
├── new-conversation-card.tsx     # Start conversation
├── conversation-card.tsx          # Conversation display
├── conversation-history.tsx       # History management
└── (existing components updated)
```

## Testing the Implementation

### 1. Database Setup
```bash
# Run the migration in Supabase SQL editor
# Verify tables and RLS policies are created
```

### 2. Authentication Flow
```bash
# Test signup flow
# Complete onboarding
# Verify dashboard access
```

### 3. Voice Integration
```bash
# Test voice conversation
# Verify call limits
# Check conversation history
```

### 4. Theme System
```bash
# Test light/dark mode switching
# Verify flat design consistency
# Check responsive layout
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase configuration
   - Verify RLS policies
   - Check middleware setup

2. **Database Errors**
   - Run migration script
   - Check foreign key constraints
   - Verify user creation trigger

3. **Voice Integration**
   - Check Vapi API keys
   - Verify microphone permissions
   - Test assistant creation

4. **Theme Issues**
   - Check CSS variables
   - Verify component classes
   - Test theme switching

## Next Steps

1. **Deploy to Production**
   - Set up production Supabase
   - Configure environment variables
   - Test all features

2. **User Testing**
   - Test onboarding flow
   - Verify conversation history
   - Check call limits

3. **Performance Optimization**
   - Optimize database queries
   - Implement caching
   - Monitor API performance

## Support

For issues or questions:
1. Check the console for errors
2. Verify database setup
3. Test API endpoints
4. Check authentication flow

The implementation is now complete with proper authentication, user onboarding, conversation history, and a beautiful flat black & white theme!
