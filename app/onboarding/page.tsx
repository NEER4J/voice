import { OnboardingFlow } from '@/components/onboarding-flow';
import { OnboardingProvider } from '@/components/onboarding-context';
import { OnboardingLayoutWrapper } from '@/components/onboarding-layout-wrapper';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Your AI Assistant - Voice AI",
  description: "Complete your Voice AI setup by choosing your assistant's purpose. Customize your AI assistant for work, learning, wellness, or general assistance.",
  robots: "noindex, nofollow",
};

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingLayoutWrapper>
        <OnboardingFlow />
      </OnboardingLayoutWrapper>
    </OnboardingProvider>
  );
}
