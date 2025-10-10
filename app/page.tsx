import { MagicButton } from "@/components/ui/button";
import Silk from "@/components/Silk";
import ParticleCircle from "@/components/ParticleCircle";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Mic } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice AI - Three Specialized AI Assistants",
  description: "Get three specialized AI assistants for scheduling, sales, and service. Let AI handle your appointments, sales calls, and customer support so you can focus on what matters most.",
  keywords: "AI assistant, voice AI, scheduling assistant, sales assistant, service assistant, appointment booking, call management, productivity",
  openGraph: {
    title: "Voice AI - Three Specialized AI Assistants",
    description: "Get three specialized AI assistants for scheduling, sales, and service. Let AI handle your appointments, sales calls, and customer support so you can focus on what matters most.",
    type: "website",
  },
};

export default function Home() {

  return (
    <div className="min-h-screen relative" >
      {/* Silk Background */}
      <div className="fixed inset-0 z-0" style={{ background: 'radial-gradient(circle,rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 1) 0%, rgba(237, 221, 83, 0) 100%)' }}>
        <Silk
          speed={5}
          scale={1}
          color="#5ca9ef"
          noiseIntensity={5}
          rotation={-1.2}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col justify-between items-center" >
        {/* Header */}
        <nav className="w-full pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between w-full border border-white/20">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-white font-semibold text-base sm:text-lg lg:text-xl m-0">Voice AI</span>
            </Link>
             <div className="flex items-center gap-2 sm:gap-3">
               <Link 
                 href="/auth/login" 
                 className="text-white/80 hover:text-white text-xs sm:text-sm font-medium hover:underline transition-colors hidden sm:block"
               >
                 Sign In
               </Link>
               <MagicButton 
                 icon
                 asChild
                 size="sm"
                 className="text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6"
               >
                 <Link href="/auth/sign-up">
                   <span className="hidden sm:inline">Get Started</span>
                   <span className="sm:hidden">Start</span>
                 </Link>
               </MagicButton>
             </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 flex items-center justify-center flex-col" >
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold leading-tight" style={{ marginBottom: '-40px' }}>
              <span className="bg-gradient-to-br from-gray-200 via-blue-100 to-white bg-clip-text text-transparent" >
                AI Assistants for <br /> Scheduling, Sales & Service
              </span>
            </h1>
            
            <div className="flex justify-center flex-col items-center max-w-xl w-full mx-auto" >
               {/* Particle Circle Effect */}
            <div className="flex justify-center relative w-full">
              {/* Subtle black gradient backdrop */}
              <div className="absolute inset-0 "></div>
              <ParticleCircle enableVoiceReactivity={false} />
            </div>
             <div className="flex flex-col items-center justify-center gap-4 w-full px-4">
               <MagicButton 
                 icon
                 asChild
                 size="lg"
                 className="w-full sm:w-auto"
               >
                 <Link href="/auth/sign-up">Start Free Trial</Link>
               </MagicButton>
               
               <Link 
                 href="/auth/login" 
                 className="text-white/80 hover:text-white text-sm font-medium hover:underline transition-colors"
               >
                 Already have an account? Sign In
               </Link>
             </div>

            </div>

           
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 sm:py-6 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-row justify-between items-center">
              <div className="text-sm text-white">
                © 2025 Voice AI.
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-white">
                  All rights reserved.
                </div>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
