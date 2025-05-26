export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  workouts_per_week: number;
  target_goals: string[];
  exercises: WorkoutPlanExercise[];
  created_by: 'system' | 'user' | 'ai';
  is_template: boolean;
}

export interface WorkoutPlanExercise {
  exercise_id: string;
  day: number;
  sets: number;
  reps: string; // "8-12" or "30 seconds"
  rest_seconds: number;
  notes?: string;
}
