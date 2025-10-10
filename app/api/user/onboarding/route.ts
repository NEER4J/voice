import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Onboarding API called');
    
    const { preferred_mode, tone } = await request.json();
    console.log('Request data:', { preferred_mode, tone });

    if (!preferred_mode) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Preferred mode is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      authError: authError?.message 
    });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json(
        { error: `Authentication required: ${authError?.message || 'No user found'}` },
        { status: 401 }
      );
    }

    console.log('Updating user profile for:', user.id);

    // First, try to find existing user by auth_user_id
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, auth_user_id')
      .eq('auth_user_id', user.id)
      .single();

    console.log('Find user result:', { existingUser, findError });

    if (findError && findError.code !== 'PGRST116') {
      console.error('Find user error:', findError);
      return NextResponse.json(
        { error: `Database error: ${findError.message}` },
        { status: 500 }
      );
    }

    let userId: string;

    if (existingUser) {
      console.log('Updating existing user:', existingUser.id);
      userId = existingUser.id;
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          preferred_mode,
          onboarding_completed: true
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Update user error:', updateError);
        return NextResponse.json(
          { error: `Failed to update profile: ${updateError.message}` },
          { status: 500 }
        );
      }
      console.log('User updated successfully');
    } else {
      console.log('Creating new user');
      // Create new user if not found
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          preferred_mode,
          call_count: 0,
          onboarding_completed: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert user error:', insertError);
        return NextResponse.json(
          { error: `Failed to create profile: ${insertError.message}` },
          { status: 500 }
        );
      }
      console.log('User created successfully:', newUser);
      userId = newUser.id;
    }

    // Create voice assistant for the user directly
    console.log('Creating voice assistant for user:', userId);
    try {
      // Import the assistant creation logic directly
      const TONE_MODIFIERS = {
        'professional': 'Speak professionally and clearly. Use formal language and maintain a business-like tone.',
        'casual': 'Speak in a casual, friendly manner. Use everyday language and be relaxed in your approach.',
        'friendly': 'Speak warmly and supportively. Be encouraging and use a caring, empathetic tone.'
      };

      const LANGUAGE_INSTRUCTIONS = {
        'english': '',
        'arabic': 'Please respond in Arabic. Use clear, modern Arabic language.'
      };

      const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.friendly;
      const languageInstruction = LANGUAGE_INSTRUCTIONS['english'] || '';
      
      const basePrompt = `You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be professional, friendly, and concise. Focus on being useful and informative.`;
      const systemPrompt = `${basePrompt} ${toneModifier} ${languageInstruction}`.trim();

      // Create assistant in Vapi
      const assistantData = {
        name: `${preferred_mode} Assistant`,
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
        firstMessage: `Hello! I'm your ${preferred_mode.toLowerCase()} assistant. How can I help you today?`,
        maxDurationSeconds: 60,
        endCallMessage: "Thank you for talking with me today. Have a great day!",
        endCallPhrases: ["goodbye", "bye", "see you later", "talk to you later"],
        recordingEnabled: false,
        backgroundSound: 'off'
      };

      const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assistantData)
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.text();
        console.error('Vapi assistant creation failed:', errorData);
        console.error('Request data:', JSON.stringify(assistantData, null, 2));
        return NextResponse.json(
          { error: `Failed to create assistant: ${errorData}` },
          { status: 500 }
        );
      }

      const vapiData = await vapiResponse.json();
      console.log('Vapi assistant created:', vapiData);

      // Save assistant to database
      const { data: assistant, error: assistantError } = await supabase
        .from('voice_assistants')
        .insert({
          user_id: userId,
          mode: preferred_mode,
          vapi_assistant_id: vapiData.id,
          tone: tone || 'friendly',
          language: 'english'
        })
        .select()
        .single();

      if (assistantError) {
        console.error('Failed to save assistant to database:', assistantError);
        return NextResponse.json(
          { error: `Failed to save assistant: ${assistantError.message}` },
          { status: 500 }
        );
      }

      console.log('Assistant created and saved successfully:', assistant);
    } catch (assistantError) {
      console.error('Assistant creation error:', assistantError);
      return NextResponse.json(
        { error: `Failed to create assistant: ${assistantError instanceof Error ? assistantError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log('Onboarding completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
