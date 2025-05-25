import { AIProvider, AIMessage } from '@/types/ai';

export class GroqProvider implements AIProvider {
  name = 'groq';
  private apiKey: string | null = null;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || null;
  }

  async chat(messages: AIMessage[], config?: Record<string, any>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured. Get a free key at https://console.groq.com');
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
          model: config?.model_name || 'llama3-8b-8192', // Fast Llama 3 model
          messages: formattedMessages,
          temperature: config?.temperature || 0.7,
          max_tokens: config?.max_tokens || 1000,
          top_p: config?.top_p || 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('Groq chat error:', error);
      throw new Error('Failed to communicate with Groq API. Please check your API key.');
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
      console.error('Error fetching Groq models:', error);
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
- Keep responses concise but informative (under 200 words)
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
