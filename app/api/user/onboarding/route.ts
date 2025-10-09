import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Onboarding API called');
    
    const { preferred_mode } = await request.json();
    console.log('Request data:', { preferred_mode });

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

    if (existingUser) {
      console.log('Updating existing user:', existingUser.id);
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
