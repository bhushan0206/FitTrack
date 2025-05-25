import { AIProvider, AIMessage } from '@/types/ai';

export class ReplicateProvider implements AIProvider {
  name = 'replicate';
  private apiKey: string | null = null;
  private baseUrl = 'https://api.replicate.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_REPLICATE_API_KEY || null;
  }

  async chat(messages: AIMessage[], config?: Record<string, any>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Replicate API key not configured. Get one at https://replicate.com');
    }

    try {
      const prompt = this.formatMessages(messages);
      const modelVersion = config?.model_name || 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3';
      
      // Create prediction
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`,
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            prompt,
            max_length: config?.max_tokens || 1000,
            temperature: config?.temperature || 0.7,
            top_p: config?.top_p || 0.9,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Replicate API error: ${response.status} ${errorData}`);
      }

      const prediction = await response.json();
      
      // Poll for result
      let result = prediction;
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(`${this.baseUrl}/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });
        
        result = await pollResponse.json();
      }

      if (result.status === 'succeeded') {
        return Array.isArray(result.output) ? result.output.join('') : result.output;
      } else {
        throw new Error(`Prediction failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Replicate chat error:', error);
      throw new Error('Failed to communicate with Replicate API.');
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private formatMessages(messages: AIMessage[]): string {
    const systemPrompt = `You are FitBot, an AI fitness assistant helping users with their health and fitness journey. Be supportive, motivational, and provide evidence-based advice. Keep responses under 200 words.`;

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
