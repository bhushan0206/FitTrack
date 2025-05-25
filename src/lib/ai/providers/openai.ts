import { AIProvider, AIMessage } from '@/types/ai';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  async chat(messages: AIMessage[], config?: Record<string, any>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const formattedMessages = this.formatMessages(messages);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config?.model_name || 'gpt-3.5-turbo',
          messages: formattedMessages,
          temperature: config?.temperature || 0.7,
          max_tokens: config?.max_tokens || 1000,
          top_p: config?.top_p || 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to communicate with OpenAI API.');
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    if (!this.apiKey) return [];
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      return [];
    }
  }

  private formatMessages(messages: AIMessage[]) {
    const systemMessage = {
      role: 'system',
      content: `You are FitBot, an AI fitness assistant helping users with their health and fitness journey. You have access to the user's fitness data and can provide personalized advice.

Key Guidelines:
- Be supportive, motivational, and encouraging
- Provide evidence-based fitness and nutrition advice
- Ask clarifying questions when needed
- Suggest realistic, achievable goals
- Always recommend consulting healthcare professionals for medical concerns
- Keep responses concise but informative
- Use the user's fitness data to provide personalized suggestions

User Context: You can see their workout logs, nutrition tracking, goals, and progress data.`
    };

    const formattedMessages = [systemMessage];
    
    messages.forEach(message => {
      formattedMessages.push({
        role: message.role,
        content: message.content,
      });
    });

    return formattedMessages;
  }
}
