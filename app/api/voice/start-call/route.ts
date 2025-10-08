import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { assistantId, mode } = await request.json();

    if (!assistantId || !mode) {
      return NextResponse.json(
        { error: 'assistantId and mode are required' },
        { status: 400 }
      );
    }

    console.log('Start call request:', { assistantId, mode });

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { user: !!user, authError: authError?.message });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get user profile and check call limit
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, call_count')
      .eq('auth_user_id', user.id)
      .single();

    console.log('User profile lookup:', { userProfile, userError });

    if (userError || !userProfile) {
      console.log('User profile not found:', userError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('User profile found:', userProfile);

    if (userProfile.call_count >= 3) {
      return NextResponse.json(
        { error: 'Call limit reached' },
        { status: 403 }
      );
    }

    // Get the assistant record from our database
    let { data: assistant, error: assistantError } = await supabase
      .from('voice_assistants')
      .select('id')
      .eq('vapi_assistant_id', assistantId)
      .single();

    console.log('Assistant lookup:', { assistant, assistantError });

    if (assistantError || !assistant) {
      console.log('Assistant not found in database, creating new record');
      // If assistant doesn't exist in our database, create it
      const { data: newAssistant, error: insertError } = await supabase
        .from('voice_assistants')
        .insert({
          mode,
          vapi_assistant_id: assistantId
        })
        .select('id')
        .single();

      if (insertError || !newAssistant) {
        console.error('Failed to create assistant record:', insertError);
        return NextResponse.json(
          { error: 'Failed to create assistant record' },
          { status: 500 }
        );
      }

      console.log('Assistant record created:', newAssistant);
      // Use the newly created assistant
      assistant = newAssistant;
    }

    // Create conversation record
    const { data: conversation, error: conversationError } = await supabase
      .from('voice_conversations')
      .insert({
        user_id: userProfile.id,
        user_auth_id: user.id,
        assistant_id: assistant.id,
        mode,
        vapi_call_id: null, // Will be updated when call starts
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log('Conversation creation:', { conversation, conversationError });

    if (conversationError) {
      console.error('Failed to create conversation:', conversationError);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    console.log('Conversation created successfully:', conversation);

    // Increment call count
    console.log('Updating call count:', { 
      userId: userProfile.id, 
      currentCount: userProfile.call_count,
      newCount: userProfile.call_count + 1
    });

    const { error: updateError } = await supabase
      .from('users')
      .update({ call_count: userProfile.call_count + 1 })
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Failed to update call count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update call count' },
        { status: 500 }
      );
    }

    console.log('Call count updated successfully');

    return NextResponse.json({
      conversationId: conversation.id,
      startTime: conversation.started_at,
      success: true
    });

  } catch (error) {
    console.error('Start call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
