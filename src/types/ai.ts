export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type: 'text' | 'suggestion' | 'workout_plan' | 'nutrition_advice';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  messages?: AIMessage[];
  last_message?: AIMessage;
}

export interface AISuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'workout' | 'nutrition' | 'goal' | 'habit' | 'recovery';
  title: string;
  description?: string;
  priority: number; // 1-10
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';
  data?: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'groq' | 'openai' | 'anthropic' | 'huggingface' | 'custom';
  model_name: string;
  endpoint_url?: string;
  api_key_required: boolean;
  is_active: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIProvider {
  name: string;
  chat: (messages: AIMessage[], config?: Record<string, any>) => Promise<string>;
  isAvailable: () => Promise<boolean>;
  getModels?: () => Promise<string[]>;
}

export interface AIContext {
  userProfile?: any;
  recentLogs?: any[];
  categories?: any[];
  goals?: any[];
  preferences?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  suggestions?: AISuggestion[];
  metadata?: Record<string, any>;
}
