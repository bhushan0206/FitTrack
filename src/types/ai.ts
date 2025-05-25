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

export interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  calories_estimate: number;
  equipment_needed: string[];
  exercises: RecommendedExercise[];
  fitness_goals: string[]; // e.g., ['weight_loss', 'muscle_gain', 'endurance']
  body_parts: string[]; // e.g., ['chest', 'legs', 'core']
  workout_type: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
  confidence_score: number; // 0-1, how confident the AI is about this recommendation
  reasoning: string; // Why this workout was recommended
}

export interface RecommendedExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // for time-based exercises
  rest_time?: number; // seconds
  instructions: string;
  modifications?: string; // for different difficulty levels
}

export interface WorkoutPreferences {
  preferred_duration?: number; // minutes
  available_equipment?: string[];
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  workout_frequency?: number; // per week
  preferred_time?: 'morning' | 'afternoon' | 'evening';
  injuries_limitations?: string[];
  preferred_workout_types?: string[];
}

export interface UserFitnessProfile {
  user_id: string;
  age?: number;
  weight?: number;
  height?: number;
  fitness_goal: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  preferences: WorkoutPreferences;
  activity_history: ActivitySummary[];
  created_at: string;
  updated_at: string;
}

export interface ActivitySummary {
  date: string;
  workout_type: string;
  duration: number;
  exercises_completed: string[];
  difficulty_rating?: number; // 1-5, user feedback
  enjoyment_rating?: number; // 1-5, user feedback
}
