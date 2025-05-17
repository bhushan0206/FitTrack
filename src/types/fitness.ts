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

export interface UserProfile {
  id: string;
  name: string;
  categories: TrackingCategory[];
  logs: DailyLog[];
}
