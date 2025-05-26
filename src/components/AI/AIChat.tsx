import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles, Loader2, Dumbbell, MessageCircle, Salad } from 'lucide-react';
import { aiService } from '@/lib/ai/aiService';
import { AIMessage as ImportedAIMessage, AIConversation } from '@/types/ai';
import { format } from 'date-fns';
import WorkoutRecommendations from './WorkoutRecommendations';
import NutritionRecommendations from './NutritionRecommendations';
import { cn } from '@/lib/utils';
import { useFitnessData } from '@/hooks/useFitnessData';

interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  userProfile?: any;
  recentLogs?: any[];
  categories?: any[];
  className?: string;
}

const AIChat = ({ className }: AIChatProps) => {
  // Get fitness data at component level
  const { profile, categories, logs } = useFitnessData();
  
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
        const welcomeMessage = {
          id: 'welcome',
          content: `Hi there! 👋 I'm your AI fitness assistant. I can help you with workout advice, nutrition tips, progress analysis, and motivation. What would you like to know about your fitness journey?`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize AI chat:', error);
    }
  };

  const generateAIResponse = (userInput: string): string => {
    // Simple response logic based on user input
    const input = userInput.toLowerCase();
    
    if (input.includes('workout') || input.includes('exercise')) {
      return "Great question about workouts! Based on your fitness goals and current activity level, I'd recommend focusing on a balanced routine. What specific type of workout are you interested in?";
    }
    
    if (input.includes('nutrition') || input.includes('diet') || input.includes('food')) {
      return "Nutrition is key to reaching your fitness goals! A balanced diet with proper macronutrients will support your training. What are your current nutrition goals?";
    }
    
    if (input.includes('progress') || input.includes('target')) {
      return "Tracking progress is essential for success! Based on your current logs, you're making good progress. Keep up the consistency and you'll see great results!";
    }
    
    return "Thanks for your question! I'm here to help with your fitness journey. Feel free to ask me about workouts, nutrition, progress tracking, or any other fitness-related topics.";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare context
      const context = {
        userProfile: profile,
        recentLogs: logs?.slice(0, 20), // Last 20 logs
        categories,
        preferences: {}
      };

      // Get AI response
      const response = await aiService.chat(conversation.id, input.trim(), context);

      // Add AI response to UI
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Add error message
      const errorMsg: AIMessage = {
        id: `error-${Date.now()}`,
        content: 'I apologize, but I encountered an error. Please check your internet connection and try again. If you need a Groq API key, you can get one free at https://console.groq.com',
        isUser: false,
        timestamp: new Date()
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
    // Handle special UI components first
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
    
    // Reset special UI components for chat-based responses
    setShowWorkoutRecommendations(false);
    setShowNutrition(false);
    
    // Handle different question types with contextual data
    let enhancedQuestion = question;
    
    switch (question) {
      case "Suggest a workout plan based on my goals":
        enhancedQuestion = generateWorkoutPlanQuery();
        break;
        
      case "Give me nutrition advice for my fitness goals":
        enhancedQuestion = generateNutritionQuery();
        break;
        
      case "How am I doing with my daily targets?":
        enhancedQuestion = generateProgressQuery();
        break;
        
      case "What should I focus on to improve my fitness?":
        enhancedQuestion = generateImprovementQuery();
        break;
        
      default:
        enhancedQuestion = question;
    }
    
    // Set the enhanced question and send it
    setInput(enhancedQuestion);
    setTimeout(() => handleSendMessage(new Event('submit') as unknown as React.FormEvent), 100);
  };

  // Generate contextual workout plan query
  const generateWorkoutPlanQuery = (): string => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const recentLogs = logs.filter(log => 
      new Date(log.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    let contextualInfo = "Suggest a workout plan based on my goals";
    
    if (profile) {
      contextualInfo += `\nMy profile: Age ${profile.age || 'not specified'}, ${profile.gender || 'gender not specified'}`;
      if (profile.fitnessGoal) {
        contextualInfo += `, Goal: ${profile.fitnessGoal.replace('_', ' ')}`;
      }
      if (profile.weight && profile.height) {
        const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
        contextualInfo += `, BMI: ${bmi}`;
      }
    }
    
    if (categories.length > 0) {
      contextualInfo += `\nMy fitness categories: ${categories.map(cat => 
        `${cat.name} (target: ${cat.dailyTarget} ${cat.unit}/day)`
      ).join(', ')}`;
    }
    
    if (recentLogs.length > 0) {
      contextualInfo += `\nRecent activity (last 7 days): ${recentLogs.length} logged activities`;
      const avgDaily = recentLogs.length / 7;
      contextualInfo += `, averaging ${avgDaily.toFixed(1)} activities per day`;
    }
    
    return contextualInfo;
  };

  // Generate contextual nutrition query
  const generateNutritionQuery = (): string => {
    let contextualInfo = "Give me nutrition advice for my fitness goals";
    
    if (profile) {
      if (profile.fitnessGoal) {
        contextualInfo += `\nMy fitness goal: ${profile.fitnessGoal.replace('_', ' ')}`;
      }
      if (profile.weight && profile.height) {
        const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
        contextualInfo += `\nCurrent BMI: ${bmi}`;
        contextualInfo += `, Weight: ${profile.weight}kg, Height: ${profile.height}cm`;
      }
      if (profile.age) {
        contextualInfo += `, Age: ${profile.age}`;
      }
    }
    
    // Check for nutrition-related categories
    const nutritionCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('water') || 
      cat.name.toLowerCase().includes('protein') ||
      cat.name.toLowerCase().includes('calorie') ||
      cat.name.toLowerCase().includes('meal')
    );
    
    if (nutritionCategories.length > 0) {
      contextualInfo += `\nNutrition tracking: ${nutritionCategories.map(cat => 
        `${cat.name} (target: ${cat.dailyTarget} ${cat.unit}/day)`
      ).join(', ')}`;
    }
    
    return contextualInfo;
  };

  // Generate contextual progress query
  const generateProgressQuery = (): string => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLogs = logs.filter(log => log.date === today);
    const weekLogs = logs.filter(log => 
      new Date(log.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    let contextualInfo = "How am I doing with my daily targets?";
    
    if (categories.length === 0) {
      contextualInfo += "\nI haven't set up any tracking categories yet.";
      return contextualInfo;
    }
    
    contextualInfo += `\nToday's Progress (${format(new Date(), 'MMM d, yyyy')}):`;
    
    let completedToday = 0;
    categories.forEach(category => {
      const categoryTodayLogs = todayLogs.filter(log => log.categoryId === category.id);
      const todayValue = categoryTodayLogs.reduce((sum, log) => sum + log.value, 0);
      const progress = category.dailyTarget > 0 ? (todayValue / category.dailyTarget * 100) : 0;
      
      contextualInfo += `\n- ${category.name}: ${todayValue}/${category.dailyTarget} ${category.unit} (${Math.round(progress)}%)`;
      
      if (progress >= 100) completedToday++;
    });
    
    contextualInfo += `\n\nSummary: ${completedToday}/${categories.length} daily targets completed`;
    
    if (weekLogs.length > 0) {
      contextualInfo += `\nWeekly activity: ${weekLogs.length} total logs in the past 7 days`;
    }
    
    return contextualInfo;
  };

  // Generate contextual improvement query
  const generateImprovementQuery = (): string => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekLogs = logs.filter(log => 
      new Date(log.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const monthLogs = logs.filter(log => 
      new Date(log.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    let contextualInfo = "What should I focus on to improve my fitness?";
    
    if (profile?.fitnessGoal) {
      contextualInfo += `\nMy fitness goal: ${profile.fitnessGoal.replace('_', ' ')}`;
    }
    
    if (categories.length === 0) {
      contextualInfo += "\nI haven't set up any fitness tracking categories yet.";
      return contextualInfo;
    }
    
    // Analyze performance by category
    contextualInfo += "\nMy tracking performance:";
    
    const categoryPerformance: Array<{name: string, weeklyCompletion: number, consistency: number}> = [];
    
    categories.forEach(category => {
      const categoryWeekLogs = weekLogs.filter(log => log.categoryId === category.id);
      const weeklyTotal = categoryWeekLogs.reduce((sum, log) => sum + log.value, 0);
      const weeklyTarget = category.dailyTarget * 7;
      const weeklyCompletion = weeklyTarget > 0 ? (weeklyTotal / weeklyTarget * 100) : 0;
      
      // Calculate consistency (how many days this week had any activity)
      const activeDays = new Set(categoryWeekLogs.map(log => log.date)).size;
      const consistency = (activeDays / 7) * 100;
      
      categoryPerformance.push({
        name: category.name,
        weeklyCompletion: Math.round(weeklyCompletion),
        consistency: Math.round(consistency)
      });
      
      contextualInfo += `\n- ${category.name}: ${weeklyCompletion.toFixed(0)}% of weekly target, ${consistency.toFixed(0)}% consistency`;
    });
    
    // Identify areas for improvement
    const lowPerformance = categoryPerformance.filter(cat => cat.weeklyCompletion < 50);
    const lowConsistency = categoryPerformance.filter(cat => cat.consistency < 50);
    
    if (lowPerformance.length > 0) {
      contextualInfo += `\nAreas needing attention: ${lowPerformance.map(cat => cat.name).join(', ')}`;
    }
    
    if (lowConsistency.length > 0) {
      contextualInfo += `\nConsistency could be improved in: ${lowConsistency.map(cat => cat.name).join(', ')}`;
    }
    
    // Add recent activity context
    if (monthLogs.length > 0) {
      const recentAvg = monthLogs.length / 30;
      contextualInfo += `\nRecent activity: averaging ${recentAvg.toFixed(1)} logged activities per day over the past month`;
    }
    
    return contextualInfo;
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          AI Fitness Coach
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Ask me anything about fitness, nutrition, or your progress!</p>
      </div>

      {/* Quick Questions */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(question)}
              className="text-left justify-start h-auto py-2 px-3 text-xs"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Welcome! Ask me anything about fitness or choose a quick question above.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {format(new Date(message.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
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

      {/* Special Content Sections */}
      {showWorkoutRecommendations && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <WorkoutRecommendations profile={profile} categories={categories} logs={logs} />
        </div>
      )}

      {showNutrition && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <NutritionRecommendations userProfile={profile} categories={categories} recentLogs={logs} />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your fitness question..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
