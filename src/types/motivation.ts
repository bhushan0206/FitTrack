export interface MotivationMessage {
  id: string;
  type: 'encouragement' | 'reminder' | 'achievement' | 'tip' | 'challenge';
  message: string;
  context: string;
  priority: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'motivating' | 'supportive';
  created_at: string;
  expires_at?: string;
}

export interface Goal {
  id: string;
  category_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface GoalRecommendation {
  id: string;
  goal_type: 'increase' | 'maintain' | 'decrease' | 'new_habit';
  title: string;
  description: string;
  reasoning: string;
  suggested_target: number;
  timeframe_days: number;
  confidence_score: number;
  category_id: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface ProgressInsight {
  id: string;
  category_id: string;
  insight_type: 'trend' | 'achievement' | 'concern' | 'opportunity';
  title: string;
  description: string;
  data_points: number[];
  trend_direction: 'up' | 'down' | 'stable' | 'volatile';
  significance: 'low' | 'medium' | 'high';
  actionable_tips: string[];
  created_at: string;
}

export interface MotivationProfile {
  personality_type: 'achiever' | 'competitor' | 'explorer' | 'socializer';
  motivation_factors: string[];
  preferred_reminder_time: string;
  reminder_frequency: 'daily' | 'weekly' | 'milestone';
  tone_preference: 'encouraging' | 'challenging' | 'analytical';
}
