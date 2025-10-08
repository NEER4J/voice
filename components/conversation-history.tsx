'use client';

import { useState, useEffect } from 'react';
import { ConversationCard } from './conversation-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Filter, 
  RefreshCw,
  Calendar,
  Clock
} from 'lucide-react';

interface Conversation {
  id: string;
  mode: string;
  duration_seconds: number;
  transcript: any;
  started_at: string;
  ended_at: string;
}

interface ConversationHistoryProps {
  className?: string;
}

export function ConversationHistory({ className }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const modes = ['all', 'Assistant', 'Friend', 'Life Coach', 'Tutor', 'Wellness Guide'];

  const fetchConversations = async (pageNum: number = 1, mode: string = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      
      if (mode !== 'all') {
        params.append('mode', mode);
      }

      const response = await fetch(`/api/conversations/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch conversations');
      }

      if (pageNum === 1) {
        setConversations(data.conversations);
      } else {
        setConversations(prev => [...prev, ...data.conversations]);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(1, filter);
  }, [filter]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchConversations(nextPage, filter);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchConversations(1, filter);
  };

  const getTotalStats = () => {
    const totalConversations = conversations.length;
    const totalDuration = conversations.reduce((sum, conv) => sum + conv.duration_seconds, 0);
    const modeCounts = conversations.reduce((acc, conv) => {
      acc[conv.mode] = (acc[conv.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalConversations, totalDuration, modeCounts };
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = getTotalStats();

  if (error) {
    return (
      <Card className={`flat-card ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} className="flat-button">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flat-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Conversation History</span>
            </CardTitle>
            <CardDescription>
              Your past voice conversations
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flat-button"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <div className="text-sm text-muted-foreground">Conversations</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold">{formatTotalDuration(stats.totalDuration)}</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-md">
            <div className="text-2xl font-bold">
              {stats.totalConversations > 0 
                ? Math.round(stats.totalDuration / stats.totalConversations / 60)
                : 0
              }m
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </div>
        </div>

        {/* Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by mode</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => (
              <Button
                key={mode}
                variant={filter === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(mode)}
                className={filter === mode ? 'flat-button-primary' : 'flat-button'}
              >
                {mode === 'all' ? 'All' : mode}
                {mode !== 'all' && stats.modeCounts[mode] && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {stats.modeCounts[mode]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {loading && conversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">
                Start your first conversation to see it here.
              </p>
            </div>
          ) : (
            <>
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                />
              ))}
              
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    className="flat-button"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
