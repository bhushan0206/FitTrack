export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'strength' | 'endurance' | 'social' | 'milestone';
  criteria: AchievementCriteria;
  reward_points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
}

export interface AchievementCriteria {
  type: 'streak' | 'total' | 'single_session' | 'social';
  target_value: number;
  metric: string; // 'workout_days', 'calories_burned', 'weight_lifted', etc.
}
