'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagicButton } from '@/components/ui/button';
import { 
  Mic,
  Calendar,
  ShoppingBag,
  Wrench
} from 'lucide-react';

interface SimplifiedDashboardProps {
  userName?: string;
}

const assistantTypes = [
  { 
    id: 'scheduling', 
    label: 'Scheduling Assistant', 
    icon: <Calendar className="w-6 h-6" />
  },
  { 
    id: 'sales', 
    label: 'Sales Assistant', 
    icon: <ShoppingBag className="w-6 h-6" />
  },
  { 
    id: 'service', 
    label: 'Service Assistant', 
    icon: <Wrench className="w-6 h-6" />
  }
];

const languages = [
  { id: 'english', label: 'English', letters: 'EN' },
  { id: 'arabic', label: 'Arabic', letters: 'عا' }
];

export function SimplifiedDashboard({ userName }: SimplifiedDashboardProps) {
  const [selectedAssistantType, setSelectedAssistantType] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleStartConversation = async () => {
    if (!selectedAssistantType) {
      setError('Please select an assistant type first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Navigate to conversation page with selected assistant type and language
      const params = new URLSearchParams({
        assistantType: selectedAssistantType,
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
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-8">
      <div className="max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {userName ? `Hey, ${userName.split(' ')[0]}!` : 'Hey there!'}
          </h1>
          <p className="text-lg text-slate-600">
            Choose which AI assistant you&apos;d like to talk to today.
          </p>
        </div>

        {/* Assistant Type Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            {assistantTypes.map((assistant) => (
              <div
                key={assistant.id}
                className={`relative cursor-pointer transition-all text-gray-900 duration-200 rounded-xl border-2 p-4 ${
                  selectedAssistantType === assistant.id 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200'
                }`}
                onClick={() => setSelectedAssistantType(assistant.id)}
              >
                {/* Radio button in top right corner */}
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAssistantType === assistant.id 
                      ? 'border-white bg-white' 
                      : 'border-gray-400'
                  }`}>
                    {selectedAssistantType === assistant.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </div>

                {/* Card content */}
                <div className="flex items-center space-x-3">
                  <div className={`${
                    selectedAssistantType === assistant.id ? 'text-white' : 'text-blue-600'
                  }`}>
                    {assistant.icon}
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${
                      selectedAssistantType === assistant.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {assistant.label}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        {selectedAssistantType && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Language</h2>
            <div className="grid grid-cols-2 gap-4">
              {languages.map((language) => (
                <div
                  key={language.id}
                  className={`relative cursor-pointer transition-all text-gray-900 duration-200 rounded-xl border-2 p-6 ${
                    selectedLanguage === language.id 
                      ? 'bg-blue-600 text-white border-blue-500' 
                      : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200'
                  }`}
                  onClick={() => setSelectedLanguage(language.id)}
                >
                  {/* Radio button in top right corner */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedLanguage === language.id 
                        ? 'border-white bg-white' 
                        : 'border-gray-400'
                    }`}>
                      {selectedLanguage === language.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                  </div>

                  {/* Card content - left aligned */}
                  <div className="flex flex-col items-start space-y-4">
                    {/* Two letters at the top */}
                    <div className="text-5xl font-bold">
                      {language.letters}
                    </div>
                    
                    {/* Language name at the bottom */}
                    <div className="font-semibold text-base">
                      {language.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Start Conversation Button */}
        <MagicButton
          onClick={handleStartConversation}
          disabled={loading || !selectedAssistantType}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Starting Conversation...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-3" />
              Start Conversation
            </>
          )}
        </MagicButton>
      </div>
    </div>
  );
}
