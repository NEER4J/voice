import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Bot, 
  Heart, 
  Target, 
  BookOpen, 
  Sparkles,
  Clock,
  Shield,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Real-time Voice",
      description: "Natural conversations with sub-600ms response times"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Multiple Personalities",
      description: "Assistant, Friend, Coach, Tutor, and Wellness Guide"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your conversations are encrypted and private"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Conversation History",
      description: "Review and continue your past conversations"
    }
  ];

  const modes = [
    { id: 'Assistant', title: 'AI Assistant', icon: <Bot className="w-5 h-5" />, description: 'Get help with tasks and questions' },
    { id: 'Friend', title: 'Friend', icon: <Heart className="w-5 h-5" />, description: 'Casual, supportive conversation' },
    { id: 'Life Coach', title: 'Life Coach', icon: <Target className="w-5 h-5" />, description: 'Guidance and motivation' },
    { id: 'Tutor', title: 'Tutor', icon: <BookOpen className="w-5 h-5" />, description: 'Learn and get help with topics' },
    { id: 'Wellness Guide', title: 'Wellness Guide', icon: <Sparkles className="w-5 h-5" />, description: 'Mental health and mindfulness' }
  ];

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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Voice AI
            <span className="block text-muted-foreground">Revolution</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of conversation with AI. Choose your perfect conversation partner and start talking naturally.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="flat-button-primary text-lg px-8 py-4">
              <Mic className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="flat-button text-lg px-8 py-4">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>60 seconds per call</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>3 calls per day</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure & private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Voice AI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience natural conversations with AI that understands context, emotion, and nuance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="flat-card text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modes Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Conversation Partner</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each AI personality is designed for different types of conversations and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((mode) => (
              <Card key={mode.id} className="flat-card">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    {mode.icon}
                    <CardTitle className="text-lg">{mode.title}</CardTitle>
                  </div>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Talking?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already having meaningful conversations with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flat-button-primary text-lg px-8 py-4">
              <Mic className="w-5 h-5 mr-2" />
              Start Your First Conversation
            </Button>
            <Button size="lg" variant="outline" className="flat-button text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2024 Voice AI. All rights reserved.
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
