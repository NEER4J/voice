import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test assistant creation with minimal data
    const assistantData = {
      name: 'Test Assistant',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      },
      firstMessage: 'Hello! How can I help you today?',
      maxDurationSeconds: 60
    };

    console.log('Testing assistant creation with data:', JSON.stringify(assistantData, null, 2));

    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to create test assistant',
        status: response.status,
        response: responseText
      }, { status: 500 });
    }

    const assistant = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      assistant: assistant,
      message: 'Test assistant created successfully'
    });

  } catch (error) {
    console.error('Test assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
