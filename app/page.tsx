import { MagicButton } from "@/components/ui/button";
import Silk from "@/components/Silk";
import ParticleCircle from "@/components/ParticleCircle";
import { Mic } from "lucide-react";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen relative" >
      {/* Silk Background */}
      <div className="fixed inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#5ca9ef"
          noiseIntensity={5}
          rotation={-1.2}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col justify-between items-center" style={{ background: 'radial-gradient(circle,rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 1) 0%, rgba(237, 221, 83, 0) 100%)' }}>
        {/* Header */}
        <nav className="w-full pt-4 sm:pt-6 lg:pt-8 px-4 max-w-xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between w-full border border-white/20">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-white font-semibold text-lg sm:text-xl m-0">Voice AI</span>
            </Link>
            <div className="flex items-center">
              <MagicButton 
                icon
                asChild
                size="sm"
                className="text-sm sm:text-base"
              >
                <Link href="/auth/login">Try it now</Link>
              </MagicButton>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-20 flex items-center justify-center flex-col" >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold leading-tight" style={{ marginBottom: '-40px' }}>
              <span className="bg-gradient-to-br from-gray-400 via-gray-200 to-white bg-clip-text text-transparent" >
                Let AI Handle Your Calls, So You Don&apos;t Have To
              </span>
            </h1>
            
            <div className="flex justify-center flex-col items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-xl w-full mx-auto" >
               {/* Particle Circle Effect */}
            <div className="flex justify-center relative w-full">
              {/* Subtle black gradient backdrop */}
              <div className="absolute inset-0 "></div>
              <ParticleCircle />
            </div>
            <div className="flex items-center justify-center">
            <MagicButton 
            icon
                asChild
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/auth/login">Try it now</Link>
              </MagicButton>
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
              <div className="text-sm text-white">
                All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
