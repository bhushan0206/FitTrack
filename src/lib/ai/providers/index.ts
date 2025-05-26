import { AIProvider, AIMessage } from '@/types/ai';
import { GroqProvider } from './groq';

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();
  
  static registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
  }
  
  static getProvider(name: string): AIProvider | null {
    return this.providers.get(name) || null;
  }
  
  static async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];
    
    for (const [name, provider] of this.providers) {
      try {
        if (await provider.isAvailable()) {
          available.push(name);
        }
      } catch (error) {
        console.warn(`Provider ${name} availability check failed:`, error);
      }
    }
    
    return available;
  }
  
  static async initialize() {
    // Register cloud-compatible providers - focus on Groq for now
    this.registerProvider('groq', new GroqProvider());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Provider Factory initialized with cloud providers:', Array.from(this.providers.keys()));
    }
  }
}

// Initialize providers
AIProviderFactory.initialize();

export * from './groq';
