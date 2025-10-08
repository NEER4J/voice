'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MessageSquare, 
  Play, 
  Eye,
  Bot,
  Heart,
  Target,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface Conversation {
  id: string;
  mode: string;
  duration_seconds: number;
  transcript: string[];
  started_at: string;
  ended_at: string;
}

interface ConversationCardProps {
  conversation: Conversation;
}

const modeIcons: Record<string, React.ReactNode> = {
  'Assistant': <Bot className="w-4 h-4" />,
  'Friend': <Heart className="w-4 h-4" />,
  'Life Coach': <Target className="w-4 h-4" />,
  'Tutor': <BookOpen className="w-4 h-4" />,
  'Wellness Guide': <Sparkles className="w-4 h-4" />
};

export function ConversationCard({ conversation }: ConversationCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTranscriptPreview = () => {
    if (!conversation.transcript || !Array.isArray(conversation.transcript)) {
      return 'No transcript available';
    }
    
    const firstMessage = conversation.transcript.find((msg: string) => 
      typeof msg === 'string' && msg.includes(':')
    );
    
    if (firstMessage) {
      return firstMessage.length > 100 
        ? firstMessage.substring(0, 100) + '...'
        : firstMessage;
    }
    
    return 'Conversation completed';
  };

  const handleResume = () => {
    router.push(`/conversation/new?mode=${encodeURIComponent(conversation.mode)}`);
  };

  const handleViewTranscript = () => {
    router.push(`/conversation/${conversation.id}`);
  };

  return (
    <Card 
      className={`flat-card transition-all duration-200 hover:border-primary/50 ${
        isHovered ? 'border-primary/30' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {modeIcons[conversation.mode] || <Bot className="w-4 h-4" />}
            <CardTitle className="text-lg">{conversation.mode}</CardTitle>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDate(conversation.started_at)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Duration and Status */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {formatDuration(conversation.duration_seconds)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Completed
          </Badge>
        </div>

        {/* Transcript Preview */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {getTranscriptPreview()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResume}
            className="flat-button flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start New with {conversation.mode}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewTranscript}
            className="flat-button"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
