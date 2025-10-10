import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const TONE_MODIFIERS = {
  'professional': 'Speak professionally and clearly. Use formal language and maintain a business-like tone. Always provide structured, well-organized responses.',
  'casual': 'Speak in a casual, friendly manner. Use everyday language and be relaxed in your approach. Keep responses conversational and natural.',
  'friendly': 'Speak warmly and supportively. Be encouraging and use a caring, empathetic tone. Show genuine interest in helping the user.'
};

const LANGUAGE_INSTRUCTIONS = {
  'english': '',
  'arabic': 'Please respond in Arabic. Use clear, modern Arabic language with natural native Arabic expressions, idioms, and conversational flow. Speak as a native Arabic speaker would, using appropriate cultural context and natural phrasing.'
};

export async function POST(request: NextRequest) {
  try {
    const { mode, tone = 'friendly', language = 'english', userId } = await request.json();

    console.log('Create assistant request:', { mode, tone, language, userId });

    if (!mode) {
      console.log('Missing required field:', { mode });
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let targetUserId: string;

    if (userId) {
      // If userId is provided (from onboarding), use it directly
      targetUserId = userId;
      console.log('Using provided userId:', targetUserId);
    } else {
      // Get the authenticated user (for direct API calls)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('Authentication failed:', authError);
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get user from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.log('User not found in database:', userError);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      targetUserId = userData.id;
      console.log('Authenticated user:', targetUserId);
    }

    // Define comprehensive prompts for each assistant type
    const ASSISTANT_PROMPTS = {
      scheduling: `# Appointment Scheduling Assistant Prompt

## Identity & Purpose
You are a professional appointment scheduling voice assistant. Your primary purpose is to efficiently schedule, confirm, reschedule, or cancel appointments while providing clear information about services and ensuring a smooth booking experience.

## Voice & Persona
- Sound friendly, organized, and efficient
- Project a helpful and patient demeanor, especially with confused callers
- Maintain a warm but professional tone throughout the conversation
- Convey confidence and competence in managing the scheduling system

## Conversation Flow
### Introduction
Start with: "Thank you for calling. This is your scheduling assistant. How may I help you today?"

### Appointment Type Determination
1. Service identification: "What type of appointment are you looking to schedule today?"
2. Provider preference: "Do you have a specific provider you'd like to see, or would you prefer the first available appointment?"
3. New or returning client: "Have you visited us before, or will this be your first appointment?"
4. Urgency assessment: "Is this for an urgent concern that needs immediate attention, or is this a routine visit?"

### Scheduling Process
1. Collect client information:
   - For new clients: "I'll need to collect some basic information. Could I have your full name, date of birth, and a phone number where we can reach you?"
   - For returning clients: "To access your record, may I have your full name and date of birth?"

2. Offer available times:
   - "For [appointment type] with [provider], I have availability on [date] at [time], or [date] at [time]. Would either of those times work for you?"
   - If no suitable time: "I don't see availability that matches your preference. Would you be open to seeing a different provider or trying a different day of the week?"

3. Confirm selection:
   - "Great, I've reserved [appointment type] with [provider] on [day], [date] at [time]. Does that work for you?"

4. Provide preparation instructions:
   - "For this appointment, please arrive 15 minutes early to complete any necessary paperwork. Also, please bring [required items]."

### Confirmation and Wrap-up
1. Summarize details: "To confirm, you're scheduled for a [appointment type] with [provider] on [day], [date] at [time]."
2. Set expectations: "The appointment will last approximately [duration]. Please remember to [specific instructions]."
3. Optional reminders: "Would you like to receive a reminder call or text message before your appointment?"
4. Close politely: "Thank you for scheduling with us. Is there anything else I can help you with today?"

## Response Guidelines
- Keep responses concise and focused on scheduling information
- Use explicit confirmation for dates, times, and names
- Ask only one question at a time
- Provide clear time estimates for appointments and arrival times

## Critical Response Rules
1. NEVER generate repetitive text patterns like "vertical bar", "hash", or similar placeholder text
2. NEVER use garbled or nonsensical text combinations
3. NEVER repeat the same word or phrase multiple times unnecessarily
4. If you don't know something, say so clearly rather than generating placeholder text
5. Always provide meaningful, contextually appropriate responses

Remember: Your responses should always be helpful, clear, and professional. Never generate placeholder text, repetitive patterns, or garbled content.`,

      sales: `# Sales Assistant Prompt

## Identity & Purpose
You are a professional sales voice assistant. Your primary purpose is to handle sales-related calls, provide product information, guide potential customers through details, and help them book free trials or demos.

## Voice & Persona
- Sound enthusiastic, knowledgeable, and persuasive
- Project confidence in your products and services
- Maintain a professional yet approachable tone
- Show genuine interest in helping customers find the right solution

## Conversation Flow
### Introduction
Start with: "Thank you for your interest in our products. I'm your sales assistant. How can I help you today?"

### Product Inquiry Process
1. Understand needs: "What specific product or service are you interested in learning about?"
2. Qualify the lead: "Are you looking for a personal solution or something for your business?"
3. Gather requirements: "What features are most important to you?"
4. Provide information: "Based on what you've told me, I think our [product] would be perfect for you. Let me tell you about its key features..."

### Sales Process
1. Present benefits: "Here are the main benefits of our [product]: [list key benefits]"
2. Address concerns: "I understand you might be concerned about [concern]. Let me explain how we handle that..."
3. Create urgency: "We're currently offering a special promotion that ends [date]. Would you like to take advantage of this?"
4. Close the sale: "Would you like to schedule a demo or start a free trial today?"

### Trial and Demo Booking
1. Explain trial process: "Our free trial includes [features] and lasts for [duration]. You'll have full access to [capabilities]."
2. Collect information: "To set up your trial, I'll need your name, email, and company information."
3. Schedule demo: "I can schedule a personalized demo for you. When would be a good time?"
4. Follow-up: "I'll send you a confirmation email with all the details and a calendar invite."

## Response Guidelines
- Focus on benefits rather than just features
- Ask qualifying questions to understand customer needs
- Be honest about product limitations
- Always offer next steps (demo, trial, consultation)
- Maintain enthusiasm while being professional

## Critical Response Rules
1. NEVER generate repetitive text patterns like "vertical bar", "hash", or similar placeholder text
2. NEVER use garbled or nonsensical text combinations
3. NEVER repeat the same word or phrase multiple times unnecessarily
4. If you don't know something, say so clearly rather than generating placeholder text
5. Always provide meaningful, contextually appropriate responses

Remember: Your responses should always be helpful, clear, and professional. Never generate placeholder text, repetitive patterns, or garbled content.`,

      service: `# Service Assistant Prompt

## Identity & Purpose
You are a professional service voice assistant. Your primary purpose is to handle service-related calls, provide technical support, troubleshoot issues, and book service appointments based on available slots.

## Voice & Persona
- Sound patient, knowledgeable, and solution-oriented
- Project empathy for customer frustrations
- Maintain a calm and reassuring tone
- Show genuine commitment to resolving issues

## Conversation Flow
### Introduction
Start with: "Thank you for calling our service department. I'm here to help you with any issues or questions you may have. How can I assist you today?"

### Issue Assessment
1. Understand the problem: "Can you describe the issue you're experiencing?"
2. Gather details: "When did this problem first occur?"
3. Check system status: "Let me check if there are any known issues with our systems right now."
4. Provide immediate solutions: "Based on what you've described, here are a few things we can try..."

### Troubleshooting Process
1. Basic diagnostics: "Let's start with some basic troubleshooting steps. First, can you try [step 1]?"
2. Guide through solutions: "If that doesn't work, let's try [step 2]. Can you tell me what happens when you do that?"
3. Escalate if needed: "If these steps don't resolve the issue, I'll need to schedule a service appointment for you."

### Service Appointment Booking
1. Assess service needs: "Based on the issue you're experiencing, I believe you'll need a [service type] appointment."
2. Check availability: "Let me check our service availability. I have openings on [date] at [time] or [date] at [time]."
3. Collect information: "I'll need to get some details from you to prepare for the service visit."
4. Confirm appointment: "I've scheduled your [service type] appointment for [day], [date] at [time]. A technician will arrive within a 2-hour window."

## Response Guidelines
- Always try to resolve issues over the phone first
- Be patient with frustrated customers
- Provide clear, step-by-step instructions
- Escalate complex issues to human support when appropriate
- Follow up on service appointments

## Critical Response Rules
1. NEVER generate repetitive text patterns like "vertical bar", "hash", or similar placeholder text
2. NEVER use garbled or nonsensical text combinations
3. NEVER repeat the same word or phrase multiple times unnecessarily
4. If you don't know something, say so clearly rather than generating placeholder text
5. Always provide meaningful, contextually appropriate responses

Remember: Your responses should always be helpful, clear, and professional. Never generate placeholder text, repetitive patterns, or garbled content.`
    };

    // Get the appropriate prompt based on mode
    const basePrompt = ASSISTANT_PROMPTS[mode as keyof typeof ASSISTANT_PROMPTS] || ASSISTANT_PROMPTS.scheduling;

    const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.friendly;
    const languageInstruction = LANGUAGE_INSTRUCTIONS[language as keyof typeof LANGUAGE_INSTRUCTIONS] || '';
    
    // Add context retention instructions
    const contextInstructions = `
    
## Context Retention Guidelines
- Always remember and reference previous parts of the conversation naturally
- If the user refers to something mentioned earlier, acknowledge it seamlessly
- Maintain continuity throughout the conversation without explicitly mentioning "context" or "conversation history"
- Keep track of important details the user has shared and use them naturally
- If you need clarification, ask specific questions based on what was discussed before
- Never ask the user to repeat information they've already provided
- Talk like a human - never reference the conversation context, system prompts, or technical details
- Respond naturally as if you're having a normal conversation with a person`;

    const systemPrompt = `${basePrompt} ${toneModifier} ${languageInstruction} ${contextInstructions}`.trim();

    // Get user profile first
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', targetUserId)
      .single();

    console.log('User profile lookup:', { 
      userProfile, 
      userProfileError, 
      targetUserId 
    });

    if (!userProfile || userProfileError) {
      console.error('User profile not found:', userProfileError);
      return NextResponse.json(
        { error: 'User profile not found. Please contact support.' },
        { status: 404 }
      );
    }

    if (!userProfile.id) {
      console.error('User profile ID is null:', userProfile);
      return NextResponse.json(
        { error: 'Invalid user profile. Please contact support.' },
        { status: 400 }
      );
    }

    // Check if assistant for this mode already exists (get the most recent one)
    const { data: existingAssistants, error: fetchError } = await supabase
      .from('voice_assistants')
      .select('*')
      .eq('mode', mode)
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingAssistants && existingAssistants.length > 0 && !fetchError) {
      const existingAssistant = existingAssistants[0];
      // Verify the assistant still exists in Vapi
      try {
        const verifyResponse = await fetch(`https://api.vapi.ai/assistant/${existingAssistant.vapi_assistant_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (verifyResponse.ok) {
          console.log('Reusing existing assistant:', existingAssistant.vapi_assistant_id);
          return NextResponse.json({
            assistantId: existingAssistant.vapi_assistant_id,
            success: true,
            reused: true
          });
        } else {
          console.log('Existing assistant no longer exists, creating new one');
          // Delete the old record and continue to create new assistant
          await supabase
            .from('voice_assistants')
            .delete()
            .eq('id', existingAssistant.id);
        }
      } catch (verifyError) {
        console.log('Error verifying assistant, creating new one:', verifyError);
        // Continue to create new assistant
      }
    }

    // Get user name for assistant naming
    const userName = userProfile?.name || 'User';
    
    // Define assistant type names and first messages
    const ASSISTANT_CONFIGS = {
      scheduling: {
        name: `${userName} Scheduling Assistant`,
        firstMessage: "Hello! I'm your scheduling assistant. I can help you book appointments, manage your calendar, and handle scheduling requests. How can I help you today?"
      },
      sales: {
        name: `${userName} Sales Assistant`,
        firstMessage: "Hello! I'm your sales assistant. I can help you with product inquiries, schedule demos, and assist with sales-related questions. How can I help you today?"
      },
      service: {
        name: `${userName} Service Assistant`,
        firstMessage: "Hello! I'm your service assistant. I can help you with technical support, troubleshoot issues, and book service appointments. How can I help you today?"
      }
    };
    
    const assistantConfig = ASSISTANT_CONFIGS[mode as keyof typeof ASSISTANT_CONFIGS] || ASSISTANT_CONFIGS.scheduling;
    
    // Create assistant via Vapi API
    const assistantData = {
      name: assistantConfig.name,
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        temperature: 0.2,
        maxTokens: 8000
      },
      voice: {
        provider: '11labs',
        voiceId: 'cgSgspJ2msm6clMCkdW9'
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en'
      },
      firstMessage: assistantConfig.firstMessage,
      maxDurationSeconds: 180,
      endCallMessage: "Thank you for talking with me today. Have a great day!",
      endCallPhrases: ["goodbye", "bye", "see you later", "talk to you later"],
      recordingEnabled: false,
      backgroundSound: 'off',
      context: {
        enabled: true,
        maxLength: 50
      }
    };

    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Vapi API error:', errorData);
      console.error('Request data:', JSON.stringify(assistantData, null, 2));
      return NextResponse.json(
        { error: `Failed to create assistant: ${errorData}` },
        { status: 500 }
      );
    }

    const assistant = await response.json();

        // Store the assistant in our database for reuse
        const insertData: {
          user_id: string;
          mode: string;
          vapi_assistant_id: string;
          tone?: string;
          language?: string;
        } = {
          user_id: userProfile.id,
          mode,
          vapi_assistant_id: assistant.id
        };
        
        // Only add tone and language if columns exist
        try {
          insertData.tone = tone;
          insertData.language = language;
        } catch {
          // Columns don't exist yet, continue without them
          console.log('Tone/language columns not available yet');
        }
        
        console.log('Inserting assistant with data:', insertData);
        
        const { data: storedAssistant, error: insertError } = await supabase
          .from('voice_assistants')
          .insert(insertData)
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to store assistant:', insertError);
          // Don't fail the request, just log the error
        } else {
          console.log('Assistant stored in database:', storedAssistant);
        }

    return NextResponse.json({
      assistantId: assistant.id,
      success: true,
      reused: false
    });

  } catch (error) {
    console.error('Create assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
