import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const TONE_MODIFIERS = {
  'professional': 'Speak professionally and clearly. Use formal language and maintain a business-like tone.',
  'casual': 'Speak in a casual, friendly manner. Use everyday language and be relaxed in your approach.',
  'friendly': 'Speak warmly and supportively. Be encouraging and use a caring, empathetic tone.'
};

const LANGUAGE_INSTRUCTIONS = {
  'english': '',
  'arabic': 'Please respond in Arabic. Use clear, modern Arabic language.'
};

export async function POST(request: NextRequest) {
  try {
    const { mode, tone = 'friendly', language = 'english' } = await request.json();

    console.log('Create assistant request:', { mode, tone, language });

    if (!mode) {
      console.log('Missing required field:', { mode });
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Build the system prompt with tone and language
    const basePrompt = `You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be professional, friendly, and concise. Focus on being useful and informative.`;
    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.friendly;
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language as keyof typeof LANGUAGE_INSTRUCTIONS] || '';
    
    const systemPrompt = `${basePrompt} ${toneModifier} ${languageInstruction}`.trim();

    // Get user profile first
    let userProfile;
    const { data: existingUserProfile, error: userProfileError } = await supabase
      .from('users')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single();

    console.log('User profile lookup:', { 
      existingUserProfile, 
      userProfileError, 
      authUserId: user.id 
    });

    if (!existingUserProfile || userProfileError) {
      console.error('User profile not found:', userProfileError);
      
      // Try to create user profile if it doesn't exist
      console.log('Attempting to create user profile for auth_user_id:', user.id);
      
      const { data: newUserProfile, error: createUserError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          call_count: 0
        })
        .select('id, name')
        .single();
      
      if (createUserError || !newUserProfile) {
        console.error('Failed to create user profile:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create user profile. Please contact support.' },
          { status: 500 }
        );
      }
      
      console.log('Created new user profile:', newUserProfile);
      userProfile = newUserProfile;
    } else {
      userProfile = existingUserProfile;
    }

    if (!userProfile.id) {
      console.error('User profile ID is null:', userProfile);
      return NextResponse.json(
        { error: 'Invalid user profile. Please contact support.' },
        { status: 400 }
      );
    }

    // Check if assistant for this mode already exists (fallback for when tone/language columns don't exist yet)
    const { data: existingAssistant, error: fetchError } = await supabase
      .from('voice_assistants')
      .select('*')
      .eq('mode', mode)
      .eq('user_id', userProfile.id)
      .single();

    if (existingAssistant && !fetchError) {
      // Verify the assistant still exists in Vapi
      try {
        const verifyResponse = await fetch(`https://api.vapi.ai/assistant/${existingAssistant.vapi_assistant_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (verifyResponse.ok) {
          console.log('Reusing existing assistant:', existingAssistant.vapi_assistant_id);
          return NextResponse.json({
            assistantId: existingAssistant.vapi_assistant_id,
            success: true,
            reused: true
          });
        } else {
          console.log('Existing assistant no longer exists, creating new one');
          // Delete the old record and continue to create new assistant
          await supabase
            .from('voice_assistants')
            .delete()
            .eq('id', existingAssistant.id);
        }
      } catch (verifyError) {
        console.log('Error verifying assistant, creating new one:', verifyError);
        // Continue to create new assistant
      }
    }

    // Get user name for assistant naming
    const userName = userProfile?.name || 'User';
    const assistantNumber = Math.floor(Math.random() * 2) + 1; // Random 1 or 2
    
    // Create assistant via Vapi API
    const assistantData = {
      name: `${userName} Assistant ${assistantNumber}`,
      model: {
        provider: 'groq',
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: 'cgSgspJ2msm6clMCkdW9'
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en'
      },
      firstMessage: `Hello! I'm your ${mode.toLowerCase()}. How can I help you today?`,
      maxDurationSeconds: 60,
      endCallMessage: "Thank you for talking with me today. Have a great day!",
      endCallPhrases: ["goodbye", "bye", "see you later", "talk to you later"],
      recordingEnabled: false,
      backgroundSound: 'off'
    };

    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Vapi API error:', errorData);
      console.error('Request data:', JSON.stringify(assistantData, null, 2));
      return NextResponse.json(
        { error: `Failed to create assistant: ${errorData}` },
        { status: 500 }
      );
    }

    const assistant = await response.json();

        // Store the assistant in our database for reuse
        const insertData: any = {
          user_id: userProfile.id,
          mode,
          vapi_assistant_id: assistant.id
        };
        
        // Only add tone and language if columns exist
        try {
          insertData.tone = tone;
          insertData.language = language;
        } catch (error) {
          // Columns don't exist yet, continue without them
          console.log('Tone/language columns not available yet');
        }
        
        console.log('Inserting assistant with data:', insertData);
        
        const { data: storedAssistant, error: insertError } = await supabase
          .from('voice_assistants')
          .insert(insertData)
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to store assistant:', insertError);
          // Don't fail the request, just log the error
        } else {
          console.log('Assistant stored in database:', storedAssistant);
        }

    return NextResponse.json({
      assistantId: assistant.id,
      success: true,
      reused: false
    });

  } catch (error) {
    console.error('Create assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
