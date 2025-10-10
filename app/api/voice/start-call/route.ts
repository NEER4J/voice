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

    // Get user profile
    let userProfile;
    const { data: existingUserProfile, error: userError } = await supabase
      .from('users')
      .select('id, call_count')
      .eq('auth_user_id', user.id)
      .single();

    console.log('User profile lookup:', { existingUserProfile, userError });

    if (userError || !existingUserProfile) {
      console.log('User profile not found:', userError);
      
      // Try to create user profile if it doesn't exist
      console.log('Attempting to create user profile for auth_user_id:', user.id);
      
      const { data: newUserProfile, error: createUserError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          call_count: 0
        })
        .select('id, call_count')
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

    console.log('User profile found:', userProfile);

    // Get the assistant record from our database
    const { data: assistant, error: assistantError } = await supabase
      .from('voice_assistants')
      .select('id')
      .eq('vapi_assistant_id', assistantId)
      .eq('user_id', userProfile.id)
      .single();

    console.log('Assistant lookup:', { assistant, assistantError });

    let finalAssistant = assistant;
    
    if (assistantError || !assistant) {
      console.log('Assistant not found in database, creating new record');
      // If assistant doesn't exist in our database, create it
      const { data: newAssistant, error: insertError } = await supabase
        .from('voice_assistants')
        .insert({
          user_id: userProfile.id,
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
      finalAssistant = newAssistant;
    }

    // Create conversation record
    const { data: conversation, error: conversationError } = await supabase
      .from('voice_conversations')
      .insert({
        user_id: userProfile.id,
        user_auth_id: user.id,
        assistant_id: finalAssistant.id,
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
