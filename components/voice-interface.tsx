'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Clock,
  Users
} from 'lucide-react';

// Import Vapi SDK
import Vapi from '@vapi-ai/web';

interface VoiceInterfaceProps {
  assistantId?: string;
  conversationId?: string;
  mode: string;
  remainingCalls: number;
  onCallEnd: (duration: number, transcript?: string[]) => void;
  onError: (error: string) => void;
}

type CallStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended';

export function VoiceInterface({ 
  assistantId: propAssistantId, 
  conversationId: propConversationId, 
  mode, 
  remainingCalls, 
  onCallEnd, 
  onError 
}: VoiceInterfaceProps) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [assistantId, setAssistantId] = useState<string>(propAssistantId || '');
  const [conversationId, setConversationId] = useState<string>(propConversationId || '');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Vapi SDK
    if (typeof window !== 'undefined') {
      const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      console.log('Vapi key available:', !!vapiKey);
      
      if (!vapiKey) {
        onError('Vapi configuration missing. Please check your environment variables.');
        return;
      }

      vapiRef.current = new Vapi(vapiKey);
      
      // Set up event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started');
        setStatus('connected');
        // Add initial greeting to transcript
        setTranscript(prev => [...prev, `${mode}: Hello! I'm your ${mode.toLowerCase()}. How can I help you today?`]);
      });

      // Add more debugging events
      vapiRef.current.on('call-settings', (settings) => {
        console.log('Call settings:', settings);
      });

      vapiRef.current.on('call-update', (update) => {
        console.log('Call update:', update);
      });

      vapiRef.current.on('call-end', () => {
        console.log('Call ended');
        setStatus('ended');
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
        if (message.type === 'transcript' && message.transcript && message.transcript.content) {
          const role = message.transcript.role === 'assistant' ? mode : 'You';
          setTranscript(prev => [...prev, `${role}: ${message.transcript.content}`]);
        }
      });

      // Add user speech detection
      vapiRef.current.on('user-speech-start', () => {
        console.log('User started speaking');
        setStatus('listening');
      });

      vapiRef.current.on('user-speech-end', () => {
        console.log('User finished speaking');
        setStatus('speaking');
      });

      vapiRef.current.on('error', (error) => {
        console.error('Vapi error:', error);
        onError('Voice connection error. Please try again.');
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
  }, [onError, mode]);

  useEffect(() => {
    if (status === 'connected') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        // Auto-end call at 60 seconds
        if (elapsed >= 60) {
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

  const handleStartCall = async () => {
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

      let currentAssistantId = assistantId;
      let currentConversationId = conversationId;

      // Create assistant if not provided
      if (!currentAssistantId) {
        console.log('Creating assistant for mode:', mode);
        const assistantResponse = await fetch('/api/voice/create-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });

        if (!assistantResponse.ok) {
          const errorData = await assistantResponse.json();
          throw new Error(errorData.error || 'Failed to create assistant');
        }

        const assistantData = await assistantResponse.json();
        currentAssistantId = assistantData.assistantId;
        setAssistantId(currentAssistantId);
        console.log('Assistant created:', currentAssistantId);
      }

      // Create conversation if not provided
      if (!currentConversationId) {
        console.log('Creating conversation for assistant:', currentAssistantId);
        const conversationResponse = await fetch('/api/voice/start-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assistantId: currentAssistantId,
            mode
          })
        });

        if (!conversationResponse.ok) {
          const errorData = await conversationResponse.json();
          throw new Error(errorData.error || 'Failed to create conversation');
        }

        const conversationData = await conversationResponse.json();
        currentConversationId = conversationData.conversationId;
        setConversationId(currentConversationId);
        console.log('Conversation created:', currentConversationId);
      }

      // Start the call with the assistant ID
      await vapiRef.current.start(currentAssistantId);

    } catch (error) {
      console.error('Start call error:', error);
      onError('Failed to start call. Please try again.');
      setStatus('idle');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleEndCall = useCallback(async () => {
    try {
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
            transcript: transcript.length > 0 ? transcript : null
          })
        });

        if (!response.ok) {
          console.error('Failed to end call in database');
        }
      }

      onCallEnd(duration, transcript);
    } catch (error) {
      console.error('End call error:', error);
      onError('Failed to end call properly');
    }
  }, [conversationId, transcript, onCallEnd, onError]);

  const toggleMute = () => {
    if (vapiRef.current) {
      if (isMuted) {
        vapiRef.current.setMuted(false);
      } else {
        vapiRef.current.setMuted(true);
      }
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'speaking': return 'bg-blue-100 text-blue-800';
      case 'listening': return 'bg-purple-100 text-purple-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <Card className="w-full max-w-2xl mx-auto flat-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Voice Conversation</CardTitle>
        <CardDescription>
          Talking with your {mode.toLowerCase()} • {formatTime(elapsedTime)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status and Controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            <Badge className={`px-4 py-2 ${getStatusColor()}`}>
              {getStatusText()}
            </Badge>
            
            {status === 'connected' && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(elapsedTime)} / 1:00</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{remainingCalls} calls remaining</span>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Primary Action Button */}
          <div className="flex justify-center space-x-4">
            {status === 'idle' && (
              <Button
                onClick={handleStartCall}
                disabled={isInitializing}
                size="lg"
                className="flat-button-primary px-8 py-3"
              >
                {isInitializing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Start Call
                  </>
                )}
              </Button>
            )}

            {status === 'connected' && (
              <>
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  className={isMuted ? "flat-button-destructive px-6 py-3" : "flat-button px-6 py-3"}
                >
                  {isMuted ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="lg"
                  className="flat-button-destructive px-8 py-3"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </>
            )}

            {status === 'ended' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Call completed successfully!</p>
                <Button onClick={() => window.location.reload()} size="lg">
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>

          {/* Emergency Stop Button - Always visible when call is active */}
          {(status === 'connected' || status === 'speaking' || status === 'listening') && (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-500">Need to stop immediately?</p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Emergency Stop
                </Button>
                <span className="text-xs text-gray-400">or press ESC</span>
              </div>
            </div>
          )}

          {/* Status-specific stop buttons */}
          {(status === 'connecting' || status === 'speaking' || status === 'listening') && (
            <Button
              onClick={handleEndCall}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Stop Call
            </Button>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <h4 className="font-medium mb-2">Conversation</h4>
            <div className="space-y-2">
              {transcript.map((message, index) => (
                <p key={index} className="text-sm text-gray-700">
                  {message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {status === 'connected' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(elapsedTime / 60) * 100}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
