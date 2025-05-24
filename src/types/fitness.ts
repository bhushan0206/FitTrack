export interface TrackingCategory {
  id: string;
  name: string;
  unit: string;
  dailyTarget: number;
  color: string;
  exerciseType?: string;
}

export interface DailyLog {
  id: string;
  categoryId: string;
  date: string; // YYYY-MM-DD format
  value: number;
  notes?: string;
}

export type BadgeType = 
  | "streak_3" 
  | "streak_7" 
  | "streak_30" 
  | "category_master" 
  | "perfect_week" 
  | "overachiever"
  | "consistency_champion";

export interface Achievement {
  id: string;
  userId: string;
  badgeType: BadgeType;
  categoryId?: string;
  earnedAt: string;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitnessGoal?: string;
  theme?: "light" | "dark" | "system";
  accentColor?: string;
  categories: TrackingCategory[];
  logs: DailyLog[];
  createdAt?: string;
  updatedAt?: string;
}

// Database types for Supabase
export interface DatabaseProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitness_goal?: string; // Note: snake_case for database
  created_at?: string;
  updated_at?: string;
}
