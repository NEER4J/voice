'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Heart, 
  Target, 
  BookOpen, 
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface Mode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const modes: Mode[] = [
  {
    id: 'Assistant',
    title: 'AI Assistant',
    description: 'Get help with tasks, questions, and general assistance',
    icon: <Bot className="w-6 h-6" />,
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
  },
  {
    id: 'Friend',
    title: 'Friend',
    description: 'Have a casual, supportive conversation with someone who cares',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
  },
  {
    id: 'Life Coach',
    title: 'Life Coach',
    description: 'Get guidance and motivation to achieve your personal goals',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
  },
  {
    id: 'Tutor',
    title: 'Tutor',
    description: 'Learn new concepts and get help with educational topics',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
  },
  {
    id: 'Wellness Guide',
    title: 'Wellness Guide',
    description: 'Focus on mental health, mindfulness, and emotional well-being',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
  }
];

interface ModeSelectorProps {
  onSelect: (mode: string) => void;
  selectedMode?: string;
  loading?: boolean;
}

export function ModeSelector({ onSelect, selectedMode, loading = false }: ModeSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose your conversation partner</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the type of conversation you'd like to have. Each mode offers a different experience tailored to your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 flat-card ${
              selectedMode === mode.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'hover:border-primary/50'
            } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => !loading && onSelect(mode.id)}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 p-3 rounded-full bg-muted">
                {mode.icon}
              </div>
              <CardTitle className="text-xl">{mode.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-sm leading-relaxed">
                {mode.description}
              </CardDescription>
              {selectedMode === mode.id && (
                <div className="mt-3 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-current" />
                  <span className="ml-2 text-sm font-medium">Selected</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMode && (
        <div className="mt-8 text-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {modes.find(m => m.id === selectedMode)?.title} selected
          </Badge>
        </div>
      )}
    </div>
  );
}
