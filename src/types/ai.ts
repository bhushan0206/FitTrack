export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string; // Make optional since database uses created_at
  created_at?: string; // Add this optional property for database compatibility
  conversation_id?: string; // Add this property
  message_type?: 'text' | 'system' | 'error'; // Add this property
  metadata?: {
    confidence?: number;
    source?: string;
    references?: string[];
    context?: any; // Add context to metadata
  };
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at?: string; // Made optional for database compatibility
  updated_at: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  messages?: AIMessage[];
  last_message_at?: string; // Optional property for database compatibility
  last_message?: AIMessage | string; // Can be either AIMessage or string
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
  type: 'workout_plan' | 'exercise' | 'routine';
  title: string;
  description: string;
  confidence_score: number;
  workout_plan?: WorkoutPlan;
  exercise?: Exercise;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  // Add missing properties used in workoutRecommendations.ts
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals?: string[];
  duration?: number;
  equipment_needed?: string[];
  workout_type?: string;
}

export interface NutritionRecommendation {
  id: string;
  type: 'meal_plan' | 'nutrition_tip' | 'recipe';
  title: string;
  description: string;
  confidence_score: number;
  meal_plan?: any; // You'll need to define MealPlan type in nutrition types
  tip?: string;
  recipe?: any; // You'll need to define Recipe type in nutrition types
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
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

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment_needed: string[];
  estimated_calories: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'core';
  muscle_groups: string[];
  equipment: string;
  instructions: string[];
  sets: number;
  reps: number;
  reps_unit: 'reps' | 'seconds' | 'minutes';
  duration: number; // in seconds
  calories: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
