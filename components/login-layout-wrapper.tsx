"use client";

import Silk from "@/components/Silk";

interface LoginLayoutWrapperProps {
  children: React.ReactNode;
}

export function LoginLayoutWrapper({ children }: LoginLayoutWrapperProps) {
  return (
    <main className="md:min-h-screen flex">
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
              Welcome Back
             
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 leading-relaxed">
              Sign in to continue with your personal AI assistant
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Content */}
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
            Welcome Back
          </h1>
          <p className="text-lg opacity-90">
            Sign in to continue with your personal AI assistant
          </p>
        </div>

        {/* Login Content */}
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
