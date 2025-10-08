'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { VoiceInterface } from '@/components/voice-interface';
import { DashboardHeader } from '@/components/dashboard-header';

export default function NewConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const mode = searchParams.get('mode') || 'Assistant';

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
        
        const remainingCalls = profile ? 3 - profile.call_count : 0;
        if (remainingCalls <= 0) {
          router.push('/dashboard?error=call_limit_reached');
          return;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleCallEnd = (duration: number, transcript: any) => {
    console.log('Call ended:', { duration, transcript });
    router.push('/dashboard');
  };

  const handleError = (errorMessage: string) => {
    console.error('Voice interface error:', errorMessage);
    setError(errorMessage);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        userName={userProfile?.name}
        remainingCalls={remainingCalls}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Conversation</h1>
          <p className="text-muted-foreground">
            Talking with your {mode.toLowerCase()}
          </p>
        </div>

        <VoiceInterface
          mode={mode}
          remainingCalls={remainingCalls}
          onCallEnd={handleCallEnd}
          onError={handleError}
        />
      </div>
    </div>
  );
}
