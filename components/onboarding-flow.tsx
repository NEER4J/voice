'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Heart, 
  Target, 
  BookOpen, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

type OnboardingStep = 'welcome' | 'profile' | 'mode-selection' | 'complete';

interface Mode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const modes: Mode[] = [
  {
    id: 'Assistant',
    title: 'AI Assistant',
    description: 'Get help with tasks, questions, and general assistance',
    icon: <Bot className="w-6 h-6" />
  },
  {
    id: 'Friend',
    title: 'Friend',
    description: 'Have a casual, supportive conversation with someone who cares',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'Life Coach',
    title: 'Life Coach',
    description: 'Get guidance and motivation to achieve your personal goals',
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 'Tutor',
    title: 'Tutor',
    description: 'Learn new concepts and get help with educational topics',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'Wellness Guide',
    title: 'Wellness Guide',
    description: 'Focus on mental health, mindfulness, and emotional well-being',
    icon: <Sparkles className="w-6 h-6" />
  }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  const handleProfileSubmit = () => {
    if (!profileData.name.trim()) {
      setError('Name is required');
      return;
    }
    setCurrentStep('mode-selection');
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleComplete = async () => {
    if (!selectedMode) {
      setError('Please select a preferred mode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting onboarding data:', {
        name: profileData.name.trim(),
        phone: profileData.phone.trim() || null,
        preferred_mode: selectedMode
      });

      // First test if API is reachable
      console.log('Testing API connectivity...');
      const testResponse = await fetch('/api/test');
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        console.log('API test successful:', testResult);
      } else {
        console.error('API test failed:', testResponse.status);
      }

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone: profileData.phone.trim() || null,
          preferred_mode: selectedMode
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

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
      case 'welcome':
        return (
          <Card className="w-full max-w-2xl mx-auto flat-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Welcome to Voice AI</CardTitle>
              <CardDescription className="text-lg">
                Let's set up your profile and preferences to get you started with your voice conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => setCurrentStep('profile')}
                size="lg"
                className="flat-button-primary"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        );

      case 'profile':
        return (
          <Card className="w-full max-w-md mx-auto flat-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>
                Tell us a bit about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="flat-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="flat-input"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('welcome')}
                  className="flat-button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleProfileSubmit}
                  className="flat-button-primary"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'mode-selection':
        return (
          <div className="w-full max-w-4xl mx-auto">
            <Card className="mb-8 flat-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your Preferred Mode</CardTitle>
                <CardDescription>
                  Select your default conversation partner. You can always change this later or select a different mode for each conversation.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {modes.map((mode) => (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 flat-card ${
                    selectedMode === mode.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleModeSelect(mode.id)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-3 p-3 rounded-full bg-muted">
                      {mode.icon}
                    </div>
                    <CardTitle className="text-xl">{mode.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-sm leading-relaxed">
                      {mode.description}
                    </CardDescription>
                    {selectedMode === mode.id && (
                      <div className="mt-3 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="ml-2 text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedMode && (
              <div className="text-center mb-6">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {modes.find(m => m.id === selectedMode)?.title} selected
                </Badge>
              </div>
            )}

            {error && (
              <div className="text-center mb-6">
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md max-w-md mx-auto">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('profile')}
                className="flat-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading || !selectedMode}
                className="flat-button-primary"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderStep()}
    </div>
  );
}
