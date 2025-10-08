'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Phone, 
  AlertTriangle,
  Bot,
  Heart,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react';

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
    description: 'Get help with tasks and questions',
    icon: <Bot className="w-5 h-5" />
  },
  {
    id: 'Friend',
    title: 'Friend',
    description: 'Casual, supportive conversation',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'Life Coach',
    title: 'Life Coach',
    description: 'Guidance and motivation',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'Tutor',
    title: 'Tutor',
    description: 'Learn and get help with topics',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'Wellness Guide',
    title: 'Wellness Guide',
    description: 'Mental health and mindfulness',
    icon: <Sparkles className="w-5 h-5" />
  }
];

interface NewConversationCardProps {
  preferredMode?: string;
  remainingCalls?: number;
}

export function NewConversationCard({ preferredMode, remainingCalls }: NewConversationCardProps) {
  const [selectedMode, setSelectedMode] = useState<string>(preferredMode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (preferredMode) {
      setSelectedMode(preferredMode);
    }
  }, [preferredMode]);

  const handleStartConversation = async () => {
    if (!selectedMode) {
      setError('Please select a conversation mode');
      return;
    }

    if (remainingCalls === 0) {
      setError('You have reached your call limit. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Navigate to conversation page with selected mode
      router.push(`/conversation/new?mode=${encodeURIComponent(selectedMode)}`);
    } catch {
      setError('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canStartCall = remainingCalls !== undefined && remainingCalls > 0;

  return (
    <Card className="flat-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-6 h-6" />
          <span>Start New Conversation</span>
        </CardTitle>
        <CardDescription>
          Choose your conversation partner and start talking
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Mode</h4>
          <div className="grid grid-cols-1 gap-3">
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? "default" : "outline"}
                className={`justify-start h-auto p-4 ${
                  selectedMode === mode.id 
                    ? 'flat-button-primary' 
                    : 'flat-button'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className="flex items-center space-x-3">
                  {mode.icon}
                  <div className="text-left">
                    <div className="font-medium">{mode.title}</div>
                    <div className="text-xs opacity-70">{mode.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Call Limit Warning */}
        {!canStartCall && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Call Limit Reached</p>
                <p className="text-xs text-destructive/80">
                  You have used all 3 calls. Please try again later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {remainingCalls !== undefined ? `${remainingCalls} calls remaining` : 'Loading...'}
            </span>
          </div>
          
          <Button
            onClick={handleStartConversation}
            disabled={loading || !selectedMode || !canStartCall}
            size="lg"
            className="flat-button-primary"
          >
            {loading ? 'Starting...' : 'Start Conversation'}
            <Mic className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
