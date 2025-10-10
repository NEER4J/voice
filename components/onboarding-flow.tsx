'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from './onboarding-context';
import { MagicButton } from '@/components/ui/button';
import { 
  ArrowRight
} from 'lucide-react';


// Removed purpose selection - users will get all 3 assistant types

const tones = [
  { id: 'professional', label: 'Professional', description: 'Clear and formal' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and supportive' }
];

export function OnboardingFlow() {
  const { currentStep } = useOnboarding();
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Submitting onboarding data:', {
        tone: selectedTone
      });

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
            {/* Tone Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Choose your assistants&apos; tone</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tones.map((tone) => (
                  <div
                    key={tone.id}
                    className={`cursor-pointer transition-all duration-200 rounded-xl p-4 border ${
                      selectedTone === tone.id 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => setSelectedTone(tone.id)}
                  >
                    <div className="text-left">
                      <h3 className={`text-lg font-semibold ${
                        selectedTone === tone.id ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>{tone.label}</h3>
                      <p className={`text-sm mt-1 ${
                        selectedTone === tone.id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
                      }`}>{tone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-center mb-6">
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md mx-auto dark:bg-red-900/20 dark:border-red-500/50">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <MagicButton
                onClick={handleComplete}
                disabled={loading}
                size="lg"
                className="px-8 py-3"
              >
                {loading ? 'Creating your AI assistants...' : 'Complete Setup'}
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
