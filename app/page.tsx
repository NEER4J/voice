import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Mic
} from "lucide-react";
import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-foreground">
              Voice AI
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

          {/* Hero Section */}
          <section className="py-20 px-4 min-h-[calc(100vh-162px)] flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Voice AI
                <span className="block text-muted-foreground">Assistant</span>
              </h1>
         

              <div className="flex justify-center mb-12">
                <Button 
                  size="lg" 
                  className="flat-button-primary rounded-full text-xl px-12 py-8 text-lg font-semibold"
                  asChild
                >
                  <Link href="/auth/login">
                    <Mic className="w-6 h-6 mr-3" />
                    Get yourself an Assistant
                  </Link>
                </Button>
              </div>

            
            </div>
          </section>

      {/* Footer */}
      <footer className=" py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex lex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2025 Voice AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
