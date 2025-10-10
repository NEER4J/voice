"use client";

import { useOnboarding } from './onboarding-context';
import Silk from "@/components/Silk";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface OnboardingLayoutWrapperProps {
  children: React.ReactNode;
}

export function OnboardingLayoutWrapper({ children }: OnboardingLayoutWrapperProps) {
  const { firstName } = useOnboarding();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen flex relative">
      {/* Mobile - Full Screen Animated Background */}
      <div className="lg:hidden absolute inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#5ca9ef"
          noiseIntensity={5}
          rotation={-1.2}
        />
      </div>
      {/* Left Side - Animated Background (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 z-0">
          <Silk
            speed={5}
            scale={1}
            color="#5ca9ef"
            noiseIntensity={5}
            rotation={-1.2}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center w-full p-8">
          <div className="text-left text-white max-w-lg">
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {firstName ? `Hi ${firstName}!` : 'Welcome!'}
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 leading-relaxed">
              Let&apos;s set up your personalized AI assistants to help you with scheduling, sales, and service.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Onboarding Content */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        {/* Mobile Welcome Text */}
        <div className="lg:hidden text-left text-white p-6 pb-4">
          <h1 className="text-4xl font-bold mb-2">
            {firstName ? `Hi ${firstName}!` : 'Welcome!'}
          </h1>
          <p className="text-lg opacity-90">
            Let&apos;s set up your personalized AI assistants.
          </p>
        </div>

        {/* Onboarding Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto relative">
            {/* Signout Button */}
            <button
              onClick={handleSignOut}
              className="absolute top-4 right-4 z-20 text-white/80 hover:text-white text-sm font-medium hover:underline hidden"
            >
              Sign out
            </button>
            
            {/* Mobile - White Background */}
            <div className="lg:hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              {children}
            </div>
            {/* Desktop - Normal Background */}
            <div className="hidden lg:block">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
