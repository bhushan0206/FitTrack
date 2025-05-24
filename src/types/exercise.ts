export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description?: string;
  instructions?: string[];
  muscleGroups?: string[];
  equipment?: string[];
  duration?: number; // in minutes
  caloriesPerMinute?: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  date: string;
  duration: number; // in minutes
  sets?: number;
  reps?: number;
  weight?: number; // in kg or lbs
  distance?: number; // in km or miles
  calories?: number;
  notes?: string;
  intensity?: 'Low' | 'Moderate' | 'High';
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  exercises: ExerciseLog[];
  totalDuration: number;
  totalCalories: number;
  notes?: string;
}

export type ExerciseCategory = 'cardio' | 'strength' | 'yoga' | 'hiit';

export interface ExerciseCategoryInfo {
  id: ExerciseCategory;
  name: string;
  color: string;
  icon: string;
  description: string;
  benefits: string[];
}
