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

    // Try to fetch transcript from Vapi if we have a vapiCallId
    let vapiTranscript = null;
    let recordingUrl = null;
    
    if (vapiCallId) {
      try {
        console.log('Fetching call data from Vapi for call ID:', vapiCallId);
        
        // Add a small delay to ensure Vapi has processed the call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const vapiResponse = await fetch(`https://api.vapi.ai/call/${vapiCallId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (vapiResponse.ok) {
          const vapiData = await vapiResponse.json();
          console.log('Vapi call data received:', {
            callId: vapiData.id,
            status: vapiData.status,
            hasTranscript: !!vapiData.transcript,
            hasRecording: !!vapiData.recordingUrl,
            transcriptLength: vapiData.transcript?.length || 0,
            fullResponse: vapiData // Log full response for debugging
          });
          
          // Extract transcript from Vapi response
          if (vapiData.transcript && Array.isArray(vapiData.transcript)) {
            vapiTranscript = vapiData.transcript;
            console.log('Found transcript from Vapi with', vapiTranscript.length, 'messages');
            console.log('Transcript content:', vapiTranscript);
          } else {
            console.log('No transcript found in Vapi response. Available fields:', Object.keys(vapiData));
            
            // Try alternative field names that Vapi might use
            if (vapiData.messages && Array.isArray(vapiData.messages)) {
              vapiTranscript = vapiData.messages;
              console.log('Found messages field with', vapiTranscript.length, 'messages');
            } else if (vapiData.conversation && Array.isArray(vapiData.conversation)) {
              vapiTranscript = vapiData.conversation;
              console.log('Found conversation field with', vapiTranscript.length, 'messages');
            }
          }
          
          // Extract recording URL if available
          if (vapiData.recordingUrl) {
            recordingUrl = vapiData.recordingUrl;
            console.log('Found recording URL:', recordingUrl);
          } else if (vapiData.recording_url) {
            recordingUrl = vapiData.recording_url;
            console.log('Found recording_url field:', recordingUrl);
          }
        } else {
          const errorText = await vapiResponse.text();
          console.error('Could not fetch transcript from Vapi:', {
            status: vapiResponse.status,
            statusText: vapiResponse.statusText,
            error: errorText
          });
        }
      } catch (vapiError) {
        console.error('Error fetching transcript from Vapi:', vapiError);
      }
    } else {
      console.log('No Vapi call ID provided, skipping transcript fetch');
    }

    // Use Vapi transcript if available, otherwise use the provided transcript
    const finalTranscript = vapiTranscript || transcript;

    // Update conversation record (with auth check)
    const { error: updateError } = await supabase
      .from('voice_conversations')
      .update({
        duration_seconds: Math.round(duration),
        transcript: finalTranscript || null,
        vapi_call_id: vapiCallId || null,
        recording_url: recordingUrl || null,
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
      success: true,
      transcript: finalTranscript,
      vapiCallId: vapiCallId,
      recordingUrl: recordingUrl,
      transcriptSource: vapiTranscript ? 'vapi' : 'fallback',
      message: 'Conversation ended and data stored successfully'
    });

  } catch (error) {
    console.error('End call error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
