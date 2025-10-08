'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/dashboard-header';
import { NewConversationCard } from '@/components/new-conversation-card';
import { ConversationHistory } from '@/components/conversation-history';

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('name, preferred_mode, call_count')
          .eq('auth_user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError('Failed to load user profile');
          return;
        }

        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="flat-button-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const remainingCalls = userProfile ? 3 - userProfile.call_count : 0;

  return (
    <div className=" bg-background">
      <DashboardHeader 
        userName={userProfile?.name}
        remainingCalls={remainingCalls}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Start New Conversation */}
          <div className="space-y-6">
            <NewConversationCard 
              preferredMode={userProfile?.preferred_mode}
              remainingCalls={remainingCalls}
            />
          </div>

          {/* Conversation History */}
          <div className="space-y-6">
            <ConversationHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
