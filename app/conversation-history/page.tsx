'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  Play,
  Calendar,
  User,
  Bot
} from 'lucide-react';

interface Conversation {
  id: string;
  mode: string;
  duration_seconds: number;
  transcript: string[];
  started_at: string;
  ended_at: string;
  vapi_call_id: string | null;
}

const modeIcons: Record<string, React.ReactNode> = {
  'Assistant': <Bot className="w-4 h-4" />,
  'Friend': <User className="w-4 h-4" />,
  'Life Coach': <User className="w-4 h-4" />,
  'Tutor': <User className="w-4 h-4" />,
  'Wellness Guide': <User className="w-4 h-4" />
};

export default function ConversationHistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

        // Get conversations
        const { data: convs, error: conversationsError } = await supabase
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
          .eq('user_auth_id', user.id)
          .order('started_at', { ascending: false });

        if (conversationsError) {
          console.error('Conversations fetch error:', conversationsError);
          setError('Failed to load conversation history');
          return;
        }

        setConversations(convs || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load conversation history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleViewConversation = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

  const handleStartNew = () => {
    router.push('/conversation/new');
  };

  const remainingCalls = userProfile ? 3 - userProfile.call_count : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader 
        userName={userProfile?.name}
        remainingCalls={remainingCalls}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Conversation History
              </h1>
              <p className="text-slate-600 mt-1">
                Your past voice conversations
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleStartNew}
            className="flat-button-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Start New Conversation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="flat-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
              <div className="text-sm text-slate-600">Total Conversations</div>
            </CardContent>
          </Card>
          <Card className="flat-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(conversations.reduce((sum, conv) => sum + conv.duration_seconds, 0))}
              </div>
              <div className="text-sm text-slate-600">Total Time</div>
            </CardContent>
          </Card>
          <Card className="flat-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {conversations.length > 0 
                  ? Math.round(conversations.reduce((sum, conv) => sum + conv.duration_seconds, 0) / conversations.length / 60)
                  : 0
                }m
              </div>
              <div className="text-sm text-slate-600">Avg Duration</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <Card className="flat-card">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No conversations yet</h3>
                <p className="text-slate-600 mb-6">
                  Start your first conversation to see it here.
                </p>
                <Button
                  onClick={handleStartNew}
                  className="flat-button-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Your First Conversation
                </Button>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Card key={conversation.id} className="flat-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {modeIcons[conversation.mode] || <Bot className="w-4 h-4" />}
                        <span className="font-medium text-slate-800">{conversation.mode}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(conversation.duration_seconds)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(conversation.started_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.transcript?.length || 0} messages
                      </Badge>
                      
                      <Button
                        onClick={() => handleViewConversation(conversation.id)}
                        variant="outline"
                        size="sm"
                        className="flat-button"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                  
                  {/* Preview of transcript */}
                  {conversation.transcript && conversation.transcript.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {conversation.transcript[0]?.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
