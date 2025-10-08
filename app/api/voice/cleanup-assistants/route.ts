import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all assistants from database
    const { data: assistants, error: fetchError } = await supabase
      .from('voice_assistants')
      .select('*');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch assistants' },
        { status: 500 }
      );
    }

    if (!assistants || assistants.length === 0) {
      return NextResponse.json({
        message: 'No assistants found',
        cleaned: 0
      });
    }

    let cleanedCount = 0;
    const results = [];

    // Check each assistant
    for (const assistant of assistants) {
      try {
        const verifyResponse = await fetch(`https://api.vapi.ai/assistant/${assistant.vapi_assistant_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!verifyResponse.ok) {
          // Assistant doesn't exist in Vapi, delete from database
          const { error: deleteError } = await supabase
            .from('voice_assistants')
            .delete()
            .eq('id', assistant.id);

          if (!deleteError) {
            cleanedCount++;
            results.push({
              id: assistant.id,
              vapiId: assistant.vapi_assistant_id,
              mode: assistant.mode,
              status: 'deleted'
            });
          }
        } else {
          results.push({
            id: assistant.id,
            vapiId: assistant.vapi_assistant_id,
            mode: assistant.mode,
            status: 'valid'
          });
        }
      } catch (error) {
        console.error(`Error checking assistant ${assistant.vapi_assistant_id}:`, error);
        results.push({
          id: assistant.id,
          vapiId: assistant.vapi_assistant_id,
          mode: assistant.mode,
          status: 'error'
        });
      }
    }

    return NextResponse.json({
      message: `Cleanup completed. Removed ${cleanedCount} invalid assistants.`,
      cleaned: cleanedCount,
      results: results
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
