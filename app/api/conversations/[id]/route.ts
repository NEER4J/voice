import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
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

    // Get conversation details
    const { data: conversation, error: conversationError } = await supabase
      .from('voice_conversations')
      .select(`
        id,
        mode,
        duration_seconds,
        transcript,
        started_at,
        ended_at,
        vapi_call_id,
        user_auth_id
      `)
      .eq('id', id)
      .eq('user_auth_id', user.id)
      .single();

    if (conversationError) {
      if (conversationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      console.error('Get conversation error:', conversationError);
      return NextResponse.json(
        { error: 'Failed to get conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
