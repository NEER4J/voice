"use client";

import Silk from "@/components/Silk";

interface SignupLayoutWrapperProps {
  children: React.ReactNode;
}

export function SignupLayoutWrapper({ children }: SignupLayoutWrapperProps) {
  return (
    <main className="min-h-screen flex">
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
              Join 
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Voice AI
              </span>
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 leading-relaxed">
              Create your account and get started with your personal AI assistant
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Content */}
      <div className="w-full lg:w-1/2 flex flex-col">
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

        {/* Mobile Welcome Text */}
        <div className="lg:hidden relative z-10 text-left text-white p-6 pb-4 pt-10">
          <h1 className="text-4xl font-bold mb-2">
            Join 
            <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Voice AI
            </span>
          </h1>
          <p className="text-lg opacity-90">
            Create your account and get started with your personal AI assistant
          </p>
        </div>

        {/* Signup Content */}
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md mx-auto">
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
