import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles, Loader2, Dumbbell, MessageCircle, Salad } from 'lucide-react';
import { aiService } from '@/lib/ai/aiService';
import { AIMessage, AIConversation } from '@/types/ai';
import { format } from 'date-fns';
import WorkoutRecommendations from './WorkoutRecommendations';
import NutritionRecommendations from './NutritionRecommendations';
import { cn } from '@/lib/utils';

interface AIChatProps {
  userProfile?: any;
  recentLogs?: any[];
  categories?: any[];
  className?: string;
}

const AIChat = ({ userProfile, recentLogs, categories, className }: AIChatProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showWorkoutRecommendations, setShowWorkoutRecommendations] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const available = await aiService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const newConversation = await aiService.createConversation('Fitness Chat');
        setConversation(newConversation);
        
        // Add welcome message
        const welcomeMessage: AIMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `Hi there! 👋 I'm your AI fitness assistant. I can help you with workout advice, nutrition tips, progress analysis, and motivation. What would you like to know about your fitness journey?`,
          timestamp: Date.now().toString()
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize AI chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare context
      const context = {
        userProfile,
        recentLogs: recentLogs?.slice(0, 20), // Last 20 logs
        categories,
        preferences: {}
      };

      // Get AI response
      const response = await aiService.chat(conversation.id, input.trim(), context);

      // Add AI response to UI
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Add error message
      const errorMsg: AIMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please check your internet connection and try again. If you need a Groq API key, you can get one free at https://console.groq.com',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Suggest a workout plan based on my goals",
    "Give me nutrition advice for my fitness goals",
    "How am I doing with my daily targets?",
    "What should I focus on to improve my fitness?",
    "Get personalized workout recommendations",
    "Show me a meal plan for my goals"
  ];

  const handleQuickQuestion = async (question: string) => {
    if (question === "Get personalized workout recommendations") {
      setShowWorkoutRecommendations(true);
      setShowNutrition(false);
      return;
    }
    if (question === "Show me a meal plan for my goals" || question.includes("nutrition")) {
      setShowNutrition(true);
      setShowWorkoutRecommendations(false);
      return;
    }
    setShowWorkoutRecommendations(false);
    setShowNutrition(false);
    setInput(question);
    setTimeout(() => handleSendMessage(new Event('submit') as unknown as React.FormEvent), 100);
  };

  const handleStartWorkout = (workout: any) => {
    // Handle starting a workout - could integrate with exercise tracker
    console.log('Starting workout:', workout);
    
    // Add message using setMessages instead of addMessage
    const workoutMessage: AIMessage = {
      id: `workout-${Date.now()}`,
      role: 'assistant',
      content: `Started workout: ${workout.title}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, workoutMessage]);
  };

  if (!isAvailable) {
    return (
      <Card className={cn("h-full flex flex-col max-h-[600px]", className)}>
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5" />
            AI Fitness Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <p className="text-gray-600 dark:text-gray-300 mb-2">AI Assistant Unavailable</p>
  <p className="text-sm text-gray-500 dark:text-gray-400">
    Get a free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.groq.com</a>
  </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col max-h-[600px]">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          AI Fitness Assistant
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ask questions about fitness, nutrition, and your workout plans
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Start a conversation!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ask me about workouts, nutrition, or fitness goals
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {message.timestamp && !isNaN(new Date(message.timestamp).getTime()) 
                    ? format(new Date(message.timestamp), 'HH:mm') 
                    : 'Now'}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 max-w-[85%]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fitness, nutrition, or workouts..."
              disabled={loading}
              className="flex-1 text-sm"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1">
            {quickQuestions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(action)}
                disabled={loading}
                className="text-xs px-2 py-1 h-auto"
              >
                {action}
              </Button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AIChat;
