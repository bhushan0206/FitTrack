import { GroqProvider } from './providers/groq';
import { aiStorage } from './aiStorage';
import { AIMessage, AIConversation, AIContext } from '@/types/ai';

class AIService {
  private provider: GroqProvider;
  private currentModel: string = 'llama3-8b-8192';

  constructor() {
    this.provider = new GroqProvider();
  }

  async isAvailable(): Promise<boolean> {
    return await this.provider.isAvailable();
  }

  async chat(conversationId: string, userMessage: string, context?: AIContext): Promise<string> {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;

    try {
      // Get conversation history
      const messages = await aiStorage.getMessages(conversationId);
      
      // Add user message to storage first - remove timestamp field
      const userMsg: Omit<AIMessage, 'id' | 'created_at'> = {
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
        message_type: 'text',
        metadata: context ? { context } : {}
      };
      
      const savedUserMsg = await aiStorage.addMessage(userMsg);
      
      // Prepare messages for AI (all should be complete AIMessage objects now)
      const contextualMessages = [...messages, savedUserMsg];
      
      if (context && messages.length === 0) {
        // Add context to the first message only if this is the start of conversation
        const contextPrompt = this.buildContextPrompt(context);
        contextualMessages[contextualMessages.length - 1] = {
          ...contextualMessages[contextualMessages.length - 1],
          content: `${contextPrompt}\n\nUser question: ${userMessage}`
        };
      }

      // Get AI response
      const aiResponse = await this.provider.chat(contextualMessages, {
        model_name: this.currentModel,
        temperature: 0.7,
        max_tokens: 1000
      });

      // Save AI response - remove timestamp field
      const assistantMsg: Omit<AIMessage, 'id' | 'created_at'> = {
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        message_type: 'text',
        metadata: {}
      };
      
      await aiStorage.addMessage(assistantMsg);
      success = true;
      
      return aiResponse;
    } catch (error) {
      // Remove sensitive chat data from error logs
      console.error('AI chat error');
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      // Track usage
      const responseTime = Date.now() - startTime;
      try {
        // Get model config ID (simplified - using hardcoded for now)
        const configs = await aiStorage.getModelConfigs();
        const groqConfig = configs.find(c => c.provider === 'groq');
        
        if (groqConfig) {
          await aiStorage.trackUsage(
            groqConfig.id,
            'chat',
            userMessage.length + (success ? 500 : 0), // Estimate tokens
            responseTime,
            success,
            errorMessage
          );
        }
      } catch (trackingError) {
        console.warn('Failed to track AI usage:', trackingError);
      }
    }
  }

  async createConversation(title?: string): Promise<AIConversation> {
    return await aiStorage.createConversation(title);
  }

  async getConversations(): Promise<AIConversation[]> {
    return await aiStorage.getConversations();
  }

  private buildContextPrompt(context: AIContext): string {
    let prompt = "Here's the user's current fitness context:\n\n";
    
    if (context.userProfile) {
      prompt += `Profile: ${context.userProfile.name || 'User'}, `;
      if (context.userProfile.age) prompt += `Age: ${context.userProfile.age}, `;
      if (context.userProfile.weight) prompt += `Weight: ${context.userProfile.weight}kg, `;
      if (context.userProfile.height) prompt += `Height: ${context.userProfile.height}cm, `;
      if (context.userProfile.fitnessGoal) prompt += `Goal: ${context.userProfile.fitnessGoal}`;
      prompt += "\n\n";
    }

    if (context.categories && context.categories.length > 0) {
      prompt += "Fitness Categories:\n";
      context.categories.forEach(cat => {
        prompt += `- ${cat.name}: Target ${cat.dailyTarget} ${cat.unit} daily\n`;
      });
      prompt += "\n";
    }

    if (context.recentLogs && context.recentLogs.length > 0) {
      prompt += "Recent Activity (last 7 days):\n";
      const recent = context.recentLogs.slice(0, 10);
      recent.forEach(log => {
        const category = context.categories?.find(c => c.id === log.categoryId);
        prompt += `- ${category?.name || 'Activity'}: ${log.value} ${category?.unit || 'units'} on ${log.date}\n`;
      });
      prompt += "\n";
    }

    return prompt;
  }

  async generateFitnessInsights(context: AIContext): Promise<string> {
    const conversation = await this.createConversation('Fitness Insights');
    
    const insightPrompt = `Based on my fitness data, can you provide personalized insights and recommendations? 
    Please focus on:
    1. Progress analysis
    2. Areas for improvement
    3. Specific actionable suggestions
    4. Motivation and encouragement`;

    return await this.chat(conversation.id, insightPrompt, context);
  }

  async generateResponse(
    message: string,
    context?: AIContext,
    conversationId?: string
  ): Promise<AIMessage> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('AI Service: Generating response for:', message);
      }
      
      // Use the aiEngine instead of undefined reference
      const { aiEngine } = await import('./aiEngine');
      const response = await aiEngine.generateResponse(message, context || {});
      
      // Create the AI message - remove timestamp field
      const messageToStore: Omit<AIMessage, 'id' | 'created_at'> = {
        role: 'assistant',
        content: response,
        conversation_id: conversationId,
        message_type: 'text',
        metadata: context ? { context } : {}
      };

      const storedMessage = await aiStorage.addMessage(messageToStore);
      return storedMessage;
    } catch (error) {
      console.error('Error in AI service:', error);
      throw error;
    }
  }

  async sendMessage(
    content: string,
    context?: AIContext,
    conversationId?: string
  ): Promise<{ userMessage: AIMessage; aiResponse: AIMessage }> {
    try {
      // Store user message - timestamp is now optional
      const userMessage: Omit<AIMessage, 'id' | 'created_at'> = {
        role: 'user',
        content,
        conversation_id: conversationId,
        message_type: 'text',
        metadata: {}
      };

      const storedUserMessage = await aiStorage.addMessage(userMessage);
      
      // Generate AI response
      const aiResponse = await this.generateResponse(content, context, conversationId);
      
      return {
        userMessage: storedUserMessage,
        aiResponse
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
