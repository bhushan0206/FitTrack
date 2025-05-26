import { supabase } from './supabase';
import { Exercise, ExerciseLog, WorkoutSession } from '@/types/exercise';

export const exerciseStorage = {
  // Exercise CRUD operations
  async getExercises(): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) {
        // Remove sensitive exercise data
        console.error('Error fetching exercises');
      }

      return data?.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        description: exercise.description,
        instructions: exercise.instructions || [],
        muscleGroups: exercise.muscle_groups || [],
        equipment: exercise.equipment || [],
        duration: exercise.duration,
        caloriesPerMinute: exercise.calories_per_minute,
        difficulty: exercise.difficulty,
        imageUrl: exercise.image_url,
      })) || [];
    } catch (error) {
      console.error('Error in getExercises:', error);
      return [];
    }
  },

  async createCustomExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          instructions: exercise.instructions,
          muscle_groups: exercise.muscleGroups,
          equipment: exercise.equipment,
          duration: exercise.duration,
          calories_per_minute: exercise.caloriesPerMinute,
          difficulty: exercise.difficulty,
          image_url: exercise.imageUrl,
          is_custom: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description,
        instructions: data.instructions || [],
        muscleGroups: data.muscle_groups || [],
        equipment: data.equipment || [],
        duration: data.duration,
        caloriesPerMinute: data.calories_per_minute,
        difficulty: data.difficulty,
        imageUrl: data.image_url,
      };
    } catch (error) {
      console.error('Error in createCustomExercise:', error);
      return null;
    }
  },

  // Exercise Log CRUD operations
  async getExerciseLogs(): Promise<ExerciseLog[]> {
    console.log('ExerciseStorage.getExerciseLogs called');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error in getExerciseLogs:', authError);
        return []; // Return empty array instead of throwing
      }
      
      if (!user) {
        console.log('No user found in getExerciseLogs, returning empty array');
        return [];
      }

      console.log('Getting exercise logs for user:', user.id);
      
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error in getExerciseLogs:', error);
        return []; // Return empty array instead of throwing
      }

      console.log('Exercise logs retrieved:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getExerciseLogs:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async createExerciseLog(exerciseLog: Omit<ExerciseLog, 'id'>): Promise<ExerciseLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let exerciseId = exerciseLog.exerciseId;
      
      // If exerciseId is not a valid UUID, try to find the exercise by name
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(exerciseId)) {
        console.log('Looking up exercise by name:', exerciseId);
        
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('id')
          .ilike('name', exerciseId) // Use case-insensitive like instead of exact match
          .single();

        if (exerciseError || !exerciseData) {
          console.error('Exercise lookup error:', exerciseError);
          console.log('Available exercises for debugging...');
          
          // Debug: list available exercises
          const { data: allExercises } = await supabase
            .from('exercises')
            .select('id, name')
            .limit(10);
          
          console.log('Available exercises:', allExercises);
          
          throw new Error(`Exercise "${exerciseId}" not found`);
        }
        
        exerciseId = exerciseData.id;
        console.log('Found exercise ID:', exerciseId);
      }

      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          date: exerciseLog.date,
          duration: exerciseLog.duration,
          sets: exerciseLog.sets,
          reps: exerciseLog.reps,
          weight: exerciseLog.weight,
          distance: exerciseLog.distance,
          calories: exerciseLog.calories,
          notes: exerciseLog.notes,
          intensity: exerciseLog.intensity,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise log:', error);
        throw error;
      }

      return {
        id: data.id,
        exerciseId: data.exercise_id,
        date: data.date,
        duration: data.duration,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        distance: data.distance,
        calories: data.calories,
        notes: data.notes,
        intensity: data.intensity,
      };
    } catch (error) {
      console.error('Error in createExerciseLog:', error);
      return null;
    }
  },

  async updateExerciseLog(id: string, exerciseLog: Partial<ExerciseLog>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .update({
          exercise_id: exerciseLog.exerciseId,
          date: exerciseLog.date,
          duration: exerciseLog.duration,
          sets: exerciseLog.sets,
          reps: exerciseLog.reps,
          weight: exerciseLog.weight,
          distance: exerciseLog.distance,
          calories: exerciseLog.calories,
          notes: exerciseLog.notes,
          intensity: exerciseLog.intensity,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating exercise log:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateExerciseLog:', error);
      return false;
    }
  },

  async deleteExerciseLog(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting exercise log:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteExerciseLog:', error);
      return false;
    }
  },

  // Workout Session CRUD operations
  async getWorkoutSessions(date?: string): Promise<WorkoutSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
            exercise_log_id,
            order_index,
            exercise_logs (*)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workout sessions:', error);
        throw error;
      }

      return data?.map(session => ({
        id: session.id,
        name: session.name,
        date: session.date,
        exercises: session.workout_exercises?.map((we: any) => ({
          id: we.exercise_logs.id,
          exerciseId: we.exercise_logs.exercise_id,
          date: we.exercise_logs.date,
          duration: we.exercise_logs.duration,
          sets: we.exercise_logs.sets,
          reps: we.exercise_logs.reps,
          weight: we.exercise_logs.weight,
          distance: we.exercise_logs.distance,
          calories: we.exercise_logs.calories,
          notes: we.exercise_logs.notes,
          intensity: we.exercise_logs.intensity,
        })) || [],
        totalDuration: session.total_duration,
        totalCalories: session.total_calories,
        notes: session.notes,
      })) || [];
    } catch (error) {
      console.error('Error in getWorkoutSessions:', error);
      return [];
    }
  },
};
