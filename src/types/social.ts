export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  friend_profile?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'workout_share' | 'progress_share';
  shared_data?: WorkoutShare | ProgressShare;
  read: boolean;
  created_at: string;
  sender_profile?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface WorkoutShare {
  exercise_logs: Array<{
    exercise_name: string;
    duration: number;
    calories?: number;
    sets?: number;
    reps?: number;
    weight?: number;
    intensity?: string;
  }>;
  total_duration: number;
  total_calories: number;
  workout_date: string;
  notes?: string;
}

export interface ProgressShare {
  categories: Array<{
    name: string;
    current_value: number;
    target_value: number;
    unit: string;
    percentage: number;
    color: string;
  }>;
  date: string;
  overall_completion: number;
  total_categories: number;
  completed_categories: number;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}
