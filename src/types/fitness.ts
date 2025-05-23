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
}
