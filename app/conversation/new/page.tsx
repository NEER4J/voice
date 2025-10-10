'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { VoiceInterface } from '@/components/voice-interface';
import { DashboardHeader } from '@/components/dashboard-header';
import ParticleCircle from '@/components/ParticleCircle';

function NewConversationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    call_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const mode = searchParams.get('mode') || 'Assistant';
  const tone = searchParams.get('tone') || 'friendly';
  const language = searchParams.get('language') || 'english';

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
          .select('name, call_count')
          .eq('auth_user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError('Failed to load user profile');
          return;
        }

        setUserProfile(profile);
        
        // No call limit checks needed
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleCallEnd = (duration: number, transcript?: string[]) => {
    console.log('Call ended:', { duration, transcript });
    router.push('/dashboard');
  };

  const handleError = (errorMessage: string) => {
    console.error('Voice interface error:', errorMessage);
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation...</p>
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

  // No call limit tracking needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader 
        userName={userProfile?.name}      />
      
          {/* Full screen layout with centered particle circle */}
          <div className="relative h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
            {/* Particle Circle - Centered and Bigger */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full h-full max-w-4xl max-h-4xl flex items-center justify-center">
                <ParticleCircle enableVoiceReactivity={true} />
              </div>
            </div>

            {/* Voice Interface - Overlay */}
            <div className="absolute inset-0">
              <VoiceInterface
                mode={mode}
                tone={tone}
                language={language}
                autoStart={true}
                onCallEnd={handleCallEnd}
                onError={handleError}
              />
            </div>
          </div>
    </div>
  );
}

export default function NewConversationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    }>
      <NewConversationContent />
    </Suspense>
  );
}
