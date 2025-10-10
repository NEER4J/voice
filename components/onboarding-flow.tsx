'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from './onboarding-context';
import { MagicButton } from '@/components/ui/button';
import { 
  Bot, 
  Heart, 
  Target, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';


interface Purpose {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const purposes: Purpose[] = [
  {
    id: 'work',
    title: 'Work & Productivity',
    description: 'Help with tasks, meetings, scheduling, and professional goals',
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 'learning',
    title: 'Learning & Education',
    description: 'Study help, skill development, and educational support',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'wellness',
    title: 'Health & Wellness',
    description: 'Mental health support, mindfulness, and personal well-being',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'social',
    title: 'Social & Entertainment',
    description: 'Casual conversation, entertainment, and social interaction',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: 'general',
    title: 'General Assistance',
    description: 'Daily tasks, questions, and general help with anything',
    icon: <Bot className="w-6 h-6" />
  }
];

const tones = [
  { id: 'professional', label: 'Professional', description: 'Clear and formal' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and supportive' }
];

export function OnboardingFlow() {
  const { currentStep } = useOnboarding();
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
  };

  const handleComplete = async () => {
    if (!selectedPurpose) {
      setError('Please select what you want an assistant for');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting onboarding data:', {
        preferred_mode: selectedPurpose,
        tone: selectedTone
      });

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_mode: selectedPurpose,
          tone: selectedTone
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Onboarding result:', result);

      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'purpose':
        return (
          <div className="w-full">
            {/* Purpose Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">What do you want an assistant for?</h2>
              <div className="flex flex-col gap-4">
                {purposes.map((purpose) => (
                  <div
                    key={purpose.id}
                    className={`group cursor-pointer transition-all duration-200 rounded-xl p-4 border-1 ${
                      selectedPurpose === purpose.id 
                        ? 'bg-blue-600 text-white' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 lg:bg-background lg:border lg:border-input lg:hover:bg-blue-600 lg:hover:text-white lg:text-foreground'
                    }`}
                    onClick={() => handlePurposeSelect(purpose.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedPurpose === purpose.id 
                          ? 'border-white bg-white' 
                          : 'border-gray-400 group-hover:border-blue-500'
                      }`}>
                        {selectedPurpose === purpose.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {purpose.icon}
                        <div>
                          <h3 className={`text-lg font-normal ${
                            selectedPurpose === purpose.id ? 'text-white' : 'text-gray-900 lg:text-foreground group-hover:text-white'
                          }`}>{purpose.title}</h3>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            {selectedPurpose && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-semibold">Choose your assistant&apos;s tone</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tones.map((tone) => (
                    <div
                      key={tone.id}
                      className={`cursor-pointer transition-all duration-200 rounded-xl p-4 border ${
                        selectedTone === tone.id 
                          ? 'bg-blue-600 text-white border-blue-500' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedTone(tone.id)}
                    >
                      <div className="text-center">
                        <h3 className={`text-lg font-semibold ${
                          selectedTone === tone.id ? 'text-white' : 'text-gray-900'
                        }`}>{tone.label}</h3>
                    
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-center mb-6">
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md mx-auto lg:bg-destructive/10 lg:border-destructive/20">
                  <p className="text-sm text-red-200 lg:text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <MagicButton
                onClick={handleComplete}
                disabled={loading || !selectedPurpose}
                size="lg"
                className="px-8 py-3"
              >
                {loading ? 'Creating your assistant...' : 'Complete Setup'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </MagicButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}
