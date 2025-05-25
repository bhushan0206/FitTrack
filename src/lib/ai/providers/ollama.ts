import { AIProvider, AIMessage } from '@/types/ai';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl = 'http://localhost:11434';
  
  async chat(messages: AIMessage[], config?: Record<string, any>): Promise<string> {
    try {
      const prompt = this.formatMessages(messages);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config?.model_name || 'llama3.2',
          prompt,
          stream: false,
          options: {
            temperature: config?.temperature || 0.7,
            num_predict: config?.max_tokens || 1000,
            top_p: config?.top_p || 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error('Failed to communicate with Ollama. Please ensure Ollama is running locally.');
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  private formatMessages(messages: AIMessage[]): string {
    const systemPrompt = `You are FitBot, an AI fitness assistant helping users with their health and fitness journey. You have access to the user's fitness data and can provide personalized advice.

Key Guidelines:
- Be supportive, motivational, and encouraging
- Provide evidence-based fitness and nutrition advice
- Ask clarifying questions when needed
- Suggest realistic, achievable goals
- Always recommend consulting healthcare professionals for medical concerns
- Keep responses concise but informative
- Use the user's fitness data to provide personalized suggestions

User Context: You can see their workout logs, nutrition tracking, goals, and progress data.`;

    let prompt = systemPrompt + '\n\n';
    
    messages.forEach(message => {
      if (message.role === 'user') {
        prompt += `Human: ${message.content}\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n`;
      }
    });
    
    prompt += 'Assistant: ';
    
    return prompt;
  }
}
