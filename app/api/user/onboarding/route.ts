import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Onboarding API called');
    
    const { tone } = await request.json();
    console.log('Request data:', { tone });

    if (!tone) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Tone is required' },
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
      .select('id, auth_user_id, name')
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

    let userId: string;

    if (existingUser) {
      console.log('Updating existing user:', existingUser.id);
      userId = existingUser.id;
      
      // Check if name needs to be updated
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const needsNameUpdate = !existingUser.name || existingUser.name === '' || existingUser.name === user.email;
      
      // Update existing user
      const updateData: {
        onboarding_completed: boolean;
        name?: string;
      } = {
        onboarding_completed: true
      };
      
      // Add name update if needed
      if (needsNameUpdate) {
        updateData.name = userName;
        console.log('Updating user name to:', userName);
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
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
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
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
      userId = newUser.id;
    }

    // Create all 3 assistant types for the user
    console.log('Creating voice assistants for user:', userId);
    const assistantTypes = ['scheduling', 'sales', 'service'];
    const createdAssistants = [];

    try {
      // Create all assistants in parallel using direct API calls
      const assistantPromises = assistantTypes.map(async (assistantType) => {
        console.log(`Creating ${assistantType} assistant...`);
        
        // Import the assistant creation logic directly instead of making HTTP calls
      const TONE_MODIFIERS = {
          'professional': 'Speak professionally and clearly. Use formal language and maintain a business-like tone. Always provide structured, well-organized responses.',
          'casual': 'Speak in a casual, friendly manner. Use everyday language and be relaxed in your approach. Keep responses conversational and natural.',
          'friendly': 'Speak warmly and supportively. Be encouraging and use a caring, empathetic tone. Show genuine interest in helping the user.'
      };

      const LANGUAGE_INSTRUCTIONS = {
        'english': '',
          'arabic': 'Please respond in Arabic. Use clear, modern Arabic language with natural native Arabic expressions, idioms, and conversational flow. Speak as a native Arabic speaker would, using appropriate cultural context and natural phrasing.'
        };

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
        const basePrompt = ASSISTANT_PROMPTS[assistantType as keyof typeof ASSISTANT_PROMPTS] || ASSISTANT_PROMPTS.scheduling;
      const toneModifier = TONE_MODIFIERS[tone as keyof typeof TONE_MODIFIERS] || TONE_MODIFIERS.friendly;
      const languageInstruction = LANGUAGE_INSTRUCTIONS['english'] || '';
      
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

        // Define assistant type names and first messages
        const ASSISTANT_CONFIGS = {
          scheduling: {
            name: `Scheduling Assistant`,
            firstMessage: "Hello! I'm your scheduling assistant. I can help you book appointments, manage your calendar, and handle scheduling requests. How can I help you today?"
          },
          sales: {
            name: `Sales Assistant`,
            firstMessage: "Hello! I'm your sales assistant. I can help you with product inquiries, schedule demos, and assist with sales-related questions. How can I help you today?"
          },
          service: {
            name: `Service Assistant`,
            firstMessage: "Hello! I'm your service assistant. I can help you with technical support, troubleshoot issues, and book service appointments. How can I help you today?"
          }
        };
        
        const assistantConfig = ASSISTANT_CONFIGS[assistantType as keyof typeof ASSISTANT_CONFIGS] || ASSISTANT_CONFIGS.scheduling;

      // Create assistant in Vapi
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

      const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assistantData)
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.text();
          console.error(`Vapi assistant creation failed for ${assistantType}:`, errorData);
          throw new Error(`Failed to create ${assistantType} assistant: ${errorData}`);
      }

      const vapiData = await vapiResponse.json();
        console.log(`${assistantType} assistant created:`, vapiData);

      // Save assistant to database
      const { data: assistant, error: assistantError } = await supabase
        .from('voice_assistants')
        .insert({
          user_id: userId,
            mode: assistantType,
          vapi_assistant_id: vapiData.id,
          tone: tone || 'friendly',
          language: 'english'
        })
        .select()
        .single();

      if (assistantError) {
          console.error(`Failed to save ${assistantType} assistant to database:`, assistantError);
          throw new Error(`Failed to save ${assistantType} assistant: ${assistantError.message}`);
        }

        console.log(`${assistantType} assistant created and saved successfully:`, assistant);
        
        return {
          type: assistantType,
          assistantId: vapiData.id,
          success: true
        };
      });

      const results = await Promise.all(assistantPromises);
      createdAssistants.push(...results);
      
      console.log('All assistants created successfully:', createdAssistants);
    } catch (assistantError) {
      console.error('Assistant creation error:', assistantError);
      return NextResponse.json(
        { error: `Failed to create assistants: ${assistantError instanceof Error ? assistantError.message : 'Unknown error'}` },
        { status: 500 }
      );
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
