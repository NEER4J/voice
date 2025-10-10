'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PhoneOff, 
  Clock
} from 'lucide-react';

// Import Vapi SDK
import Vapi from '@vapi-ai/web';

interface VoiceInterfaceProps {
  assistantId?: string;
  conversationId?: string;
  mode?: string;
  tone?: string;
  language?: string;
  autoStart?: boolean;
  onCallEnd: (duration: number, transcript?: string[]) => void;
  onError: (error: string) => void;
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended';

export function VoiceInterface({ 
  assistantId: propAssistantId, 
  conversationId: propConversationId, 
  mode = 'Assistant', 
  language = 'english',
  autoStart = false,
  onCallEnd, 
  onError 
}: VoiceInterfaceProps) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  // Removed transcript state since we're not showing live transcripts
  const [assistantId] = useState<string>(propAssistantId || '');
  const [conversationId, setConversationId] = useState<string>(propConversationId || '');
  const [isInitializing, setIsInitializing] = useState(false);
  const [vapiCallId, setVapiCallId] = useState<string>('');
  const [isEndingCall, setIsEndingCall] = useState(false);
  
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Vapi SDK
    if (typeof window !== 'undefined') {
      const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      console.log('Vapi key available:', !!vapiKey);
      console.log('Vapi key length:', vapiKey?.length);
      
      if (!vapiKey) {
        onError('Vapi configuration missing. Please check your environment variables.');
        return;
      }

      vapiRef.current = new Vapi(vapiKey);
      
      // Set up event listeners
      vapiRef.current.on('call-start', (callData?: { id?: string }) => {
        console.log('Call started with data:', callData);
        setStatus('connected');
        
        // Capture the call ID if available
        if (callData && callData.id) {
          setVapiCallId(callData.id);
          console.log('Vapi call ID captured from call-start:', callData.id);
        } else {
          console.log('No call ID received in call-start event. Call data:', callData);
          
          // Try to get call ID from Vapi instance
          if (vapiRef.current) {
            const instanceCallId = (vapiRef.current as { callId?: string; id?: string }).callId || (vapiRef.current as { callId?: string; id?: string }).id;
            if (instanceCallId) {
              setVapiCallId(instanceCallId);
              console.log('Vapi call ID captured from instance:', instanceCallId);
            }
          }
        }
        
        // No need to add to transcript since we're not showing live transcripts
        
        // Try to get call ID after a short delay if not captured yet
        setTimeout(() => {
          if (!vapiCallId && vapiRef.current) {
            const callId = (vapiRef.current as { callId?: string; id?: string }).callId || (vapiRef.current as { callId?: string; id?: string }).id;
            if (callId) {
              setVapiCallId(callId);
              console.log('Captured call ID from Vapi instance after delay:', callId);
            }
          }
        }, 1000);
      });

      // Add comprehensive event logging
      // Note: Some events may not be supported in current Vapi SDK version

      vapiRef.current.on('call-end', () => {
        console.log('Call ended');
        setStatus('ended');
        
        // Try to get call ID from Vapi instance if we don't have it yet
        if (!vapiCallId && vapiRef.current) {
          // Some Vapi instances might expose the call ID
          const callId = (vapiRef.current as { callId?: string; id?: string }).callId || (vapiRef.current as { callId?: string; id?: string }).id;
          if (callId) {
            setVapiCallId(callId);
            console.log('Captured call ID from Vapi instance on call-end:', callId);
          } else {
            console.log('Could not get call ID from Vapi instance. Available properties:', Object.keys(vapiRef.current as unknown as Record<string, unknown>));
          }
        }
      });

      vapiRef.current.on('speech-start', () => {
        console.log('AI is speaking');
        setStatus('speaking');
      });

      vapiRef.current.on('speech-end', () => {
        console.log('AI finished speaking');
        setStatus('listening');
      });

      vapiRef.current.on('message', (message) => {
        console.log('Message received:', message);
        console.log('Message type:', message.type);
        console.log('Message content:', message);
        
        // We'll handle transcripts after call ends, not in real-time
        // Just log for debugging
        if (message.type === 'transcript' && message.transcript) {
          console.log('Transcript message received (will be processed after call ends):', message.transcript);
        }
        
        if (message.type === 'conversation' && message.conversation) {
          console.log('Conversation message:', message.conversation);
        }
        
        if (message.type === 'function-call' && message.functionCall) {
          console.log('Function call message:', message.functionCall);
        }
      });

      // Note: Some transcript events may not be supported in current Vapi SDK version
      // We rely on the message event with type 'transcript' for transcript handling

      // Add user speech detection
      // Note: user-speech-start and user-speech-end events are not supported in current Vapi SDK

      vapiRef.current.on('error', (error) => {
        console.error('Vapi error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        onError(`Voice connection error: ${error?.message || 'Unknown error'}. Please try again.`);
        setStatus('idle');
      });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [onError, mode, vapiCallId]);

  const handleStartCall = useCallback(async () => {
    try {
      setStatus('connecting');
      setIsInitializing(true);

      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        onError('Microphone access is required for voice calls. Please allow microphone access and try again.');
        setStatus('idle');
        setIsInitializing(false);
        return;
      }

      if (!vapiRef.current) {
        throw new Error('Vapi not initialized');
      }

      const currentAssistantId = assistantId;
      let currentConversationId = conversationId;

      // Use provided assistant ID
      if (!currentAssistantId) {
        throw new Error('Assistant ID is required. Please complete onboarding first.');
      }

      console.log('Starting call with assistant ID:', currentAssistantId);
      console.log('Assistant ID type:', typeof currentAssistantId);
      console.log('Assistant ID length:', currentAssistantId.length);

      // Create conversation if not provided
      if (!currentConversationId) {
        console.log('Creating conversation for assistant:', currentAssistantId);
        const conversationResponse = await fetch('/api/voice/start-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assistantId: currentAssistantId,
            mode: 'Assistant', // Default mode since we're using existing assistant
            language: language
          })
        });

        if (!conversationResponse.ok) {
          const errorData = await conversationResponse.json();
          console.error('Conversation creation failed:', errorData);
          throw new Error(errorData.error || errorData.message || 'Failed to create conversation');
        }

        const conversationData = await conversationResponse.json();
        currentConversationId = conversationData.conversationId;
        setConversationId(currentConversationId);
        console.log('Conversation created:', currentConversationId);
      }

      // Start the call with the assistant ID
      console.log('Starting call with assistant ID:', currentAssistantId);
      console.log('Vapi instance:', vapiRef.current);
      
      if (!vapiRef.current) {
        throw new Error('Vapi not initialized');
      }

      try {
        console.log('Calling vapiRef.current.start with:', currentAssistantId);
        await vapiRef.current.start(currentAssistantId);
        console.log('Vapi start call successful');
      } catch (startError) {
        console.error('Vapi start call failed:', startError);
        console.error('Start error details:', JSON.stringify(startError, null, 2));
        const errorMessage = startError instanceof Error ? startError.message : 'Unknown error';
        throw new Error(`Failed to start call: ${errorMessage}`);
      }

    } catch (error) {
      console.error('Start call error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start call. Please try again.';
      onError(errorMessage);
      setStatus('idle');
    } finally {
      setIsInitializing(false);
    }
  }, [assistantId, conversationId, onError, language]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && status === 'idle' && !isInitializing) {
      handleStartCall();
    }
  }, [autoStart, status, isInitializing, handleStartCall]);

  // Auto-scroll to bottom when new transcript messages arrive
  // Removed transcript auto-scroll since we're not showing live transcripts


  const handleEndCall = useCallback(async () => {
    try {
      setIsEndingCall(true);
      
      if (vapiRef.current) {
        await vapiRef.current.stop();
      }

      setStatus('ended');

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Call API to end call if we have a conversation ID
      if (conversationId) {
        const response = await fetch('/api/voice/end-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            duration,
            transcript: null, // We'll get transcript from Vapi API
            vapiCallId: vapiCallId || null
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Call ended successfully, received data:', {
            success: data.success,
            transcriptSource: data.transcriptSource,
            vapiCallId: data.vapiCallId,
            recordingUrl: data.recordingUrl,
            transcriptLength: data.transcript?.length || 0,
            message: data.message
          });
          
          // If we have a transcript from the API, use it
          if (data.transcript && data.transcript.length > 0) {
            console.log('Received transcript from API with', data.transcript.length, 'messages');
            const formattedTranscript = data.transcript.map((item: { role: string; message: string }) => 
              `${item.role === 'assistant' ? mode : 'You'}: ${item.message}`
            );
            onCallEnd(duration, formattedTranscript);
            return;
          } else {
            console.log('No transcript received from API');
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to end call in database:', errorData);
        }
      }

      // Fallback if no API transcript
      onCallEnd(duration, []);
    } catch (error) {
      console.error('End call error:', error);
      onError('Failed to end call properly');
    } finally {
      setIsEndingCall(false);
    }
  }, [conversationId, vapiCallId, onCallEnd, onError, mode]);

  useEffect(() => {
    if (status === 'connected') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        // Auto-end call at 180 seconds (3 minutes)
        if (elapsed >= 180) {
          handleEndCall();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, handleEndCall]);

  // Add keyboard shortcut for stopping call
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (status === 'connected' || status === 'speaking' || status === 'listening')) {
        handleEndCall();
      }
    };

    if (status === 'connected' || status === 'speaking' || status === 'listening') {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [status, handleEndCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'speaking': return 'Speaking';
      case 'listening': return 'Listening';
      case 'ended': return 'Call Ended';
      default: return 'Ready to Call';
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Status Indicator - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 border border-slate-200/50 shadow-lg">
          <div className={`w-4 h-4 rounded-full ${
            status === 'connected' ? 'bg-green-500 animate-pulse' : 
            status === 'speaking' ? 'bg-blue-500 animate-pulse' :
            status === 'listening' ? 'bg-purple-500 animate-pulse' :
            'bg-gray-400'
          }`}></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">
              {getStatusText()}
            </span>
            {status === 'connected' && (
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <Clock className="w-3 h-3" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Stop Button - Bottom Center */}
      {(status === 'connected' || status === 'speaking' || status === 'listening') && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="lg"
            disabled={isEndingCall}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 shadow-lg"
          >
            {isEndingCall ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <PhoneOff className="w-6 h-6" />
            )}
          </Button>
        </div>
      )}

      {/* Loading/Processing States - Bottom Center */}
      {(status === 'connecting' || status === 'idle') && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-slate-700">
                {status === 'connecting' ? 'Preparing conversation...' : 'Starting up...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Processing State - Bottom Center */}
      {isEndingCall && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-sm font-medium text-slate-700">Processing transcript...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
