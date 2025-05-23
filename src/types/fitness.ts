export interface TrackingCategory {
  id: string;
  name: string;
  unit: string;
  dailyTarget: number;
  color?: string;
}

export interface DailyLog {
  id: string;
  categoryId: string;
  date: string; // ISO date string
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
  categories: TrackingCategory[];
  logs: DailyLog[];
  achievements?: Achievement[];
  // Add new profile fields
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  weight?: number; // in kg
  height?: number; // in cm
  fitnessGoal?: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | 'maintain_health' | 'other';
  createdAt?: string;
  updatedAt?: string;
}
