'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MessageSquare, 
  Play, 
  ArrowLeft,
  Bot,
  Heart,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react';

const modeIcons: Record<string, React.ReactNode> = {
  'Assistant': <Bot className="w-5 h-5" />,
  'Friend': <Heart className="w-5 h-5" />,
  'Life Coach': <Target className="w-5 h-5" />,
  'Tutor': <BookOpen className="w-5 h-5" />,
  'Wellness Guide': <Sparkles className="w-5 h-5" />
};

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const [conversation, setConversation] = useState<{
    id: string;
    mode: string;
    duration_seconds: number;
    transcript: string[];
    started_at: string;
    ended_at: string;
    vapi_call_id: string | null;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    call_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        // Get conversation details
        const { data: conv, error: conversationError } = await supabase
          .from('voice_conversations')
          .select(`
            id,
            mode,
            duration_seconds,
            transcript,
            started_at,
            ended_at,
            vapi_call_id
          `)
          .eq('id', params.id)
          .eq('user_auth_id', user.id)
          .single();

        if (conversationError || !conv) {
          router.push('/dashboard?error=conversation_not_found');
          return;
        }

        setConversation(conv);

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('name, call_count')
          .eq('auth_user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Conversation not found'}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flat-button-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const remainingCalls = userProfile ? 3 - userProfile.call_count : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTranscript = () => {
    if (!conversation.transcript || !Array.isArray(conversation.transcript)) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No transcript available for this conversation.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conversation.transcript.map((message: string, index: number) => (
          <div key={index} className="p-3 bg-muted/30 rounded-md">
            <p className="text-sm">{message}</p>
          </div>
        ))}
      </div>
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleStartNew = () => {
    router.push(`/conversation/new?mode=${encodeURIComponent(conversation.mode)}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userName={userProfile?.name}
        remainingCalls={remainingCalls}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flat-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                {modeIcons[conversation.mode] || <Bot className="w-6 h-6" />}
                <span>{conversation.mode} Conversation</span>
              </h1>
              <p className="text-muted-foreground">
                {formatDate(conversation.started_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(conversation.duration_seconds)}
            </Badge>
            <Button
              onClick={handleStartNew}
              className="flat-button-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Start New with {conversation.mode}
            </Button>
          </div>
        </div>

        {/* Conversation Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transcript */}
          <div className="lg:col-span-2">
            <Card className="flat-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversation Transcript</span>
                </CardTitle>
                <CardDescription>
                  Full conversation history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTranscript()}
              </CardContent>
            </Card>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <Card className="flat-card">
              <CardHeader>
                <CardTitle>Conversation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mode</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {modeIcons[conversation.mode] || <Bot className="w-4 h-4" />}
                    <span>{conversation.mode}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="mt-1">{formatDuration(conversation.duration_seconds)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Started</label>
                  <p className="mt-1">{formatDate(conversation.started_at)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ended</label>
                  <p className="mt-1">{formatDate(conversation.ended_at)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flat-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleStartNew}
                  className="w-full flat-button-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start New with {conversation.mode}
                </Button>
                
                <Button
                  onClick={handleBackToDashboard}
                  variant="outline"
                  className="w-full flat-button"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
