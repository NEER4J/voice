# Vapi Voice AI Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

# Vapi API Keys (get these from https://vapi.ai)
VAPI_API_KEY=your_vapi_private_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
```

## 2. Database Setup

Run the SQL script in `database-setup.sql` in your Supabase SQL editor to create the required tables:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Click "Run" to execute the script

This will create:
- `users` table for storing user profiles and call limits
- `voice_assistants` table for storing and reusing Vapi assistant IDs
- `voice_conversations` table for conversation history
- Proper indexes and RLS policies

## 3. Vapi Configuration

1. Sign up at [vapi.ai](https://vapi.ai)
2. Get your API keys from the dashboard
3. Add them to your `.env.local` file
4. The app will automatically create assistants based on the selected mode

## 4. Features Implemented

✅ **Multi-step user flow:**
- Welcome screen with compelling hero section
- Email/phone collection with validation
- Mode selection (Assistant, Friend, Life Coach, Tutor, Wellness Guide)
- Voice interface with real-time controls

✅ **Call management:**
- 60-second call limit with auto-end
- 3 calls per email limit
- Real-time timer and progress bar
- Call history tracking
- Assistant reuse for efficiency

✅ **Database integration:**
- User profile storage
- Conversation history
- Call limit enforcement
- Automatic data persistence

✅ **Modern UI:**
- Mobile-first responsive design
- Clean, modern interface with Tailwind CSS
- Smooth transitions between steps
- Real-time status indicators

## 5. Usage

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Get Started" to begin the voice conversation flow
4. Follow the steps to complete your first voice AI conversation

## 6. API Endpoints

- `POST /api/voice/check-user` - Validate user and check call limits
- `POST /api/voice/create-assistant` - Create Vapi assistant based on mode
- `POST /api/voice/start-call` - Start a new voice conversation
- `POST /api/voice/end-call` - End conversation and save data

## 7. Next Steps

To complete the integration:
1. Set up your Vapi account and get API keys
2. Run the database setup script
3. Add environment variables
4. Test the voice conversation flow

The app is ready to use once you complete the setup steps above!
