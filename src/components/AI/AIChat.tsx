import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '@/lib/ai/aiService';
import { AIMessage, AIConversation } from '@/types/ai';
import { format } from 'date-fns';

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
          conversation_id: newConversation.id,
          role: 'assistant',
          content: `Hi there! 👋 I'm your AI fitness assistant. I can help you with workout advice, nutrition tips, progress analysis, and motivation. What would you like to know about your fitness journey?`,
          message_type: 'text',
          created_at: new Date().toISOString()
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Failed to initialize AI chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !conversation || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI immediately
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      conversation_id: conversation.id,
      role: 'user',
      content: userMessage,
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Prepare context
      const context = {
        userProfile,
        recentLogs: recentLogs?.slice(0, 20), // Last 20 logs
        categories,
        preferences: {}
      };

      // Get AI response
      const response = await aiService.chat(conversation.id, userMessage, context);

      // Add AI response to UI
      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: conversation.id,
        role: 'assistant',
        content: response,
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Add error message
      const errorMsg: AIMessage = {
        id: `error-${Date.now()}`,
        conversation_id: conversation.id,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please check your internet connection and try again. If you need a Groq API key, you can get one free at https://console.groq.com',
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    // Small delay to show the input, then send
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Fitness Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">AI Assistant Unavailable</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please add your Groq API key to environment variables.
            <br />
            Get a free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.groq.com</a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          AI Fitness Assistant
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-80 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {format(new Date(message.created_at), 'HH:mm')}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Quick questions:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion('Analyze my recent progress and give me insights')}
                className="justify-start text-left h-auto py-2"
              >
                📊 Analyze my progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion('Suggest a workout plan based on my goals')}
                className="justify-start text-left h-auto py-2"
              >
                🏋️ Suggest workout plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion('Give me nutrition advice for my fitness goals')}
                className="justify-start text-left h-auto py-2"
              >
                🥗 Nutrition advice
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about fitness..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
