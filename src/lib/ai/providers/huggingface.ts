import { AIProvider, AIMessage } from '@/types/ai';

export class HuggingFaceProvider implements AIProvider {
  name = 'huggingface';
  private apiKey: string | null = null;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || null;
  }

  async chat(messages: AIMessage[], config?: Record<string, any>): Promise<string> {
    try {
      const prompt = this.formatMessages(messages);
      const modelName = config?.model_name || 'microsoft/DialoGPT-medium';
      
      const response = await fetch(`${this.baseUrl}/${modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: config?.temperature || 0.7,
            max_new_tokens: config?.max_tokens || 1000,
            do_sample: true,
            top_p: config?.top_p || 0.9,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limiting gracefully
        if (response.status === 429) {
          return "I'm currently experiencing high traffic. Please try again in a few moments, or consider upgrading to a paid AI service for faster responses.";
        }
        
        // Handle model loading
        if (response.status === 503) {
          return "The AI model is currently loading. This usually takes 1-2 minutes for the first request. Please try again shortly!";
        }
        
        throw new Error(`HuggingFace API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
      } else if (data.generated_text) {
        return data.generated_text.trim();
      } else {
        return 'I apologize, but I could not generate a response at this time. Please try again or check your internet connection.';
      }
    } catch (error) {
      console.error('HuggingFace chat error:', error);
      
      // Provide helpful fallback responses
      if (error instanceof Error && error.message.includes('503')) {
        return 'The AI model is warming up. Please try again in a moment. In the meantime, feel free to browse your fitness data or set new goals!';
      }
      
      return 'I encountered an issue connecting to the AI service. Please check your internet connection and try again.';
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a lightweight model
      const response = await fetch(`${this.baseUrl}/gpt2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { max_new_tokens: 5 }
        }),
      });
      
      // 503 means model is loading but API is available
      return response.ok || response.status === 503;
    } catch (error) {
      return false;
    }
  }

  private formatMessages(messages: AIMessage[]): string {
    let prompt = 'You are a helpful fitness assistant. Provide brief, encouraging fitness advice. ';
    
    messages.forEach(message => {
      if (message.role === 'user') {
        prompt += `Human: ${message.content} `;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content} `;
      }
    });
    
    prompt += 'Assistant:';
    
    return prompt;
  }
}
