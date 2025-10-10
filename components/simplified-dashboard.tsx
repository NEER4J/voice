'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Phone, 
  AlertTriangle,
  Languages,
  Volume2,
  History
} from 'lucide-react';

interface SimplifiedDashboardProps {
  userName?: string;
}

const tones = [
  { id: 'professional', label: 'Professional', description: 'Clear and formal' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and supportive' }
];

const languages = [
  { id: 'english', label: 'English', flag: '🇺🇸' },
  { id: 'arabic', label: 'العربية', flag: '🇸🇦' }
];

export function SimplifiedDashboard({ userName }: SimplifiedDashboardProps) {
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleStartConversation = async () => {
    setLoading(true);
    setError('');

    try {
      // Navigate to conversation page with selected tone and language
      const params = new URLSearchParams({
        tone: selectedTone,
        language: selectedLanguage
      });
      router.push(`/conversation/new?${params.toString()}`);
    } catch {
      setError('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Personalized Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            {userName ? `Welcome back, ${userName}!` : 'Welcome to Voice AI'}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start a personalized conversation with AI. Choose your preferred tone and language.
          </p>
        </div>

        {/* Main Card */}
        <Card className="flat-card border border-slate-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-800 mb-2">
              Start Your Conversation
            </CardTitle>
            <CardDescription className="text-slate-600">
              Choose your tone and language, then start talking
            </CardDescription>
          </CardHeader>
        
          <CardContent className="space-y-8">
            {/* Tone Selection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Choose Your Tone</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tones.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? "default" : "outline"}
                    className={`h-auto p-6 transition-all duration-200 rounded-xl ${
                      selectedTone === tone.id 
                        ? 'flat-button-primary bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                        : 'flat-button hover:bg-blue-50 hover:border-blue-200'
                    }`}
                    onClick={() => setSelectedTone(tone.id)}
                  >
                    <div className="text-center space-y-2">
                      <div className="font-semibold text-base">{tone.label}</div>
                      <div className="text-sm opacity-80">{tone.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Languages className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Select Language</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {languages.map((language) => (
                  <Button
                    key={language.id}
                    variant={selectedLanguage === language.id ? "default" : "outline"}
                    className={`h-auto p-6 transition-all duration-200 rounded-xl ${
                      selectedLanguage === language.id 
                        ? 'flat-button-primary bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                        : 'flat-button hover:bg-green-50 hover:border-green-200'
                    }`}
                    onClick={() => setSelectedLanguage(language.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{language.flag}</span>
                      <span className="font-semibold text-base">{language.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col items-center space-y-6 pt-4">
              <Button
                onClick={handleStartConversation}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto px-16 py-6 text-xl font-semibold flat-button-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-2xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Starting Conversation...
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3" />
                    Start Conversation
                  </>
                )}
              </Button>
              
              {/* History Link */}
              <Button
                onClick={() => router.push('/conversation-history')}
                variant="outline"
                size="lg"
                className="flat-button text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-8 py-3"
              >
                <History className="w-5 h-5 mr-2" />
                View Conversation History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
