import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    // Get user profile
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Get user profile error:', fetchError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check call limit
    const remainingCalls = Math.max(0, 3 - userProfile.call_count);
    
    return NextResponse.json({
      canCall: remainingCalls > 0,
      remainingCalls,
      userId: userProfile.id,
      userProfile: {
        name: userProfile.name,
        email: userProfile.email,
        preferred_mode: userProfile.preferred_mode
      }
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
