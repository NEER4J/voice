"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OnboardingContextType {
  firstName: string;
  setFirstName: (name: string) => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [firstName, setFirstName] = useState('');
  const [currentStep, setCurrentStep] = useState('purpose');

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.first_name) {
        setFirstName(user.user_metadata.first_name);
      }
    };

    fetchUserData();
  }, []);

  return (
    <OnboardingContext.Provider value={{
      firstName,
      setFirstName,
      currentStep,
      setCurrentStep
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
