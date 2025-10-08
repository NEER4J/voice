import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, duration, transcript, vapiCallId } = await request.json();

    if (!conversationId || duration === undefined) {
      return NextResponse.json(
        { error: 'conversationId and duration are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Update conversation record (with auth check)
    const { error: updateError } = await supabase
      .from('voice_conversations')
      .update({
        duration_seconds: Math.round(duration),
        transcript: transcript || null,
        vapi_call_id: vapiCallId || null,
        ended_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_auth_id', user.id);

    if (updateError) {
      console.error('Update conversation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('End call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
