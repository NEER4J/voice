import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const MODE_PROMPTS = {
  'Assistant': `You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be professional, friendly, and concise. Focus on being useful and informative.`,
  
  'Friend': `You are a supportive friend having a casual conversation. Be warm, empathetic, and encouraging. Use a conversational tone and show genuine interest in what the user is sharing. Be positive and supportive.`,
  
  'Life Coach': `You are an experienced life coach helping someone work through challenges and achieve their goals. Ask thoughtful questions, provide guidance, and help them gain clarity. Be motivational and solution-focused.`,
  
  'Tutor': `You are a knowledgeable tutor ready to help with learning and education. Explain concepts clearly, provide examples, and adapt your teaching style to the user's level. Be patient and encouraging.`,
  
  'Wellness Guide': `You are a wellness guide focused on mental health, mindfulness, and personal well-being. Provide gentle guidance, suggest coping strategies, and create a safe space for emotional support. Be compassionate and non-judgmental.`
};

export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json();

    console.log('Create assistant request:', { mode });

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

    if (!MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS]) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      );
    }

    // Check if assistant for this mode already exists
    const { data: existingAssistant, error: fetchError } = await supabase
      .from('voice_assistants')
      .select('*')
      .eq('mode', mode)
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

    // Create assistant via Vapi API
    const assistantData = {
      name: `${mode} Assistant`,
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS]
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default voice - fallback to 'pNInz6obpgDQGcFmaJgB' if this fails
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
        const { data: storedAssistant, error: insertError } = await supabase
          .from('voice_assistants')
          .insert({
            mode,
            vapi_assistant_id: assistant.id
          })
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
