import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const mode = searchParams.get('mode');

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('voice_conversations')
      .select(`
        id,
        mode,
        duration_seconds,
        transcript,
        started_at,
        ended_at,
        user_auth_id
      `)
      .eq('user_auth_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add mode filter if specified
    if (mode) {
      query = query.eq('mode', mode);
    }

    const { data: conversations, error: conversationsError } = await query;

    if (conversationsError) {
      console.error('Get conversations error:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to get conversations' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('voice_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_auth_id', user.id);

    if (mode) {
      countQuery = countQuery.eq('mode', mode);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Get count error:', countError);
      return NextResponse.json(
        { error: 'Failed to get conversation count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversations: conversations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
