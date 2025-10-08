'use client';

import { useState } from 'react';
import { EmailPhoneForm } from './email-phone-form';
import { ModeSelector } from './mode-selector';
import { VoiceInterface } from './voice-interface';
import { VapiDebug } from './vapi-debug';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Mic } from 'lucide-react';

type FlowStep = 'welcome' | 'user-info' | 'mode-selection' | 'voice-call' | 'completed';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  userId?: string;
}

interface VoiceFlowProps {
  onComplete?: () => void;
}

export function VoiceFlow({ onComplete }: VoiceFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [remainingCalls, setRemainingCalls] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUserInfoSubmit = async (data: UserData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/voice/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process user information');
      }

      if (!result.canCall) {
        setError(`You've reached your call limit of 3 calls. Please try again later.`);
        return;
      }

      setUserData({ ...data, userId: result.userId });
      setRemainingCalls(result.remainingCalls);
      setCurrentStep('mode-selection');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = async (mode: string) => {
    setSelectedMode(mode);
    setLoading(true);
    setError('');

    // Debug logging
    console.log('Mode selected:', mode);
    console.log('User data:', userData);
    console.log('User ID:', userData?.userId);

    if (!userData?.userId) {
      setError('User ID not found. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Create assistant
      const assistantResponse = await fetch('/api/voice/create-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          userId: userData.userId
        })
      });

      const assistantResult = await assistantResponse.json();

      if (!assistantResponse.ok) {
        throw new Error(assistantResult.error || 'Failed to create assistant');
      }

      // Start call
      const callResponse = await fetch('/api/voice/start-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData?.userId,
          assistantId: assistantResult.assistantId,
          mode
        })
      });

      const callResult = await callResponse.json();

      if (!callResponse.ok) {
        throw new Error(callResult.error || 'Failed to start call');
      }

      setAssistantId(assistantResult.assistantId);
      setConversationId(callResult.conversationId);
      setCurrentStep('voice-call');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEnd = () => {
    setCurrentStep('completed');
    if (onComplete) {
      onComplete();
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const resetFlow = () => {
    setCurrentStep('welcome');
    setUserData(null);
    setSelectedMode('');
    setAssistantId('');
    setConversationId('');
    setRemainingCalls(3);
    setError('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Card className="w-full max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <Mic className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-3xl mb-4">Start Your Voice Conversation</CardTitle>
              <CardDescription className="text-lg">
                Experience the future of AI conversation. Choose your perfect conversation partner and start talking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Badge variant="outline">60 seconds per call</Badge>
                  <Badge variant="outline">3 calls per email</Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentStep('user-info')}
                size="lg"
                className="w-full"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        );

      case 'user-info':
        return (
          <EmailPhoneForm
            onSubmit={handleUserInfoSubmit}
            loading={loading}
            error={error}
          />
        );

      case 'mode-selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('user-info')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <p className="text-sm text-gray-600">
                Welcome, {userData?.name}! Choose your conversation partner.
              </p>
            </div>
            
            <ModeSelector
              onSelect={handleModeSelect}
              selectedMode={selectedMode}
              loading={loading}
            />
            
            {error && (
              <div className="text-center">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md max-w-md mx-auto">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'voice-call':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('mode-selection')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <VapiDebug />
            
            <VoiceInterface
              assistantId={assistantId}
              conversationId={conversationId}
              mode={selectedMode}
              remainingCalls={remainingCalls}
              onCallEnd={handleCallEnd}
              onError={handleError}
            />
          </div>
        );

      case 'completed':
        return (
          <Card className="w-full max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Mic className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl mb-4">Conversation Complete!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for trying our voice AI. You have {remainingCalls - 1} calls remaining.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={resetFlow}
                  size="lg"
                  className="w-full"
                >
                  Start Another Conversation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="container mx-auto">
        {renderStep()}
      </div>
    </div>
  );
}
