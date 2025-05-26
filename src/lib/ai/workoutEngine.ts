import { WorkoutRecommendation, WorkoutPlan, Exercise } from '@/types/ai';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';

interface WorkoutContext {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
}

class WorkoutEngine {
  generateRecommendations(context: WorkoutContext): WorkoutRecommendation[] {
    console.log('WorkoutEngine: Starting recommendation generation');
    
    const recommendations: WorkoutRecommendation[] = [];
    
    try {
      // Generate a basic workout plan
      const basicWorkout = this.generateBasicWorkout(context);
      recommendations.push({
        id: `workout-plan-${Date.now()}`,
        type: 'workout_plan',
        title: 'Full Body Strength Training',
        description: 'A balanced workout targeting all major muscle groups',
        confidence_score: 0.85,
        workout_plan: basicWorkout,
        reasoning: 'This workout is designed based on your fitness goals and provides a balanced approach to strength training.',
        priority: 'high',
        created_at: new Date().toISOString()
      });

      // Add additional workout recommendations
      const cardioWorkout = this.generateCardioWorkout(context);
      recommendations.push({
        id: `cardio-workout-${Date.now()}`,
        type: 'workout_plan',
        title: 'Cardio Blast Session',
        description: 'High-intensity cardio workout for improved endurance',
        confidence_score: 0.80,
        workout_plan: cardioWorkout,
        reasoning: 'Cardio training helps improve cardiovascular health and aids in weight management.',
        priority: 'medium',
        created_at: new Date().toISOString()
      });

      console.log('WorkoutEngine: Generated', recommendations.length, 'recommendations');
      return recommendations;
    } catch (error) {
      console.error('WorkoutEngine: Error generating recommendations:', error);
      return [{
        id: 'fallback-workout',
        type: 'exercise',
        title: 'Basic Exercise',
        description: 'Simple bodyweight exercise to get started',
        confidence_score: 0.90,
        reasoning: 'A basic exercise to help you get started with your fitness journey.',
        priority: 'high',
        created_at: new Date().toISOString()
      }];
    }
  }

  private generateBasicWorkout(context: WorkoutContext): WorkoutPlan {
    const goal = context.userProfile?.fitnessGoal || 'general_health';
    
    const exercises: Exercise[] = [
      {
        id: 'push-ups',
        name: 'Push-ups',
        category: 'strength',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: 'bodyweight',
        instructions: ['Start in plank position', 'Lower body to ground', 'Push back up'],
        sets: 3,
        reps: 10,
        reps_unit: 'reps',
        duration: 300,
        calories: 30,
        difficulty: 'beginner'
      },
      {
        id: 'squats',
        name: 'Bodyweight Squats',
        category: 'strength',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: 'bodyweight',
        instructions: ['Stand with feet shoulder-width apart', 'Lower down as if sitting', 'Stand back up'],
        sets: 3,
        reps: 15,
        reps_unit: 'reps',
        duration: 360,
        calories: 40,
        difficulty: 'beginner'
      },
      {
        id: 'plank',
        name: 'Plank Hold',
        category: 'core',
        muscle_groups: ['core', 'shoulders'],
        equipment: 'bodyweight',
        instructions: ['Start in forearm plank', 'Hold position', 'Keep body straight'],
        sets: 3,
        reps: 30,
        reps_unit: 'seconds',
        duration: 180,
        calories: 20,
        difficulty: 'beginner'
      }
    ];

    return {
      id: `plan-${Date.now()}`,
      name: goal === 'weight_loss' ? 'Weight Loss Strength Training' : 
            goal === 'muscle_gain' ? 'Muscle Building Workout' : 
            'General Fitness Routine',
      description: `A comprehensive workout plan for ${goal.replace('_', ' ')}`,
      exercises,
      duration: exercises.reduce((sum, ex) => sum + ex.duration, 0),
      difficulty: 'beginner',
      equipment_needed: ['none'],
      estimated_calories: exercises.reduce((sum, ex) => sum + ex.calories, 0)
    };
  }

  private generateCardioWorkout(context: WorkoutContext): WorkoutPlan {
    const exercises: Exercise[] = [
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        category: 'cardio',
        muscle_groups: ['full_body'],
        equipment: 'bodyweight',
        instructions: ['Jump feet apart while raising arms', 'Jump back to starting position'],
        sets: 3,
        reps: 30,
        reps_unit: 'reps',
        duration: 180,
        calories: 35,
        difficulty: 'beginner'
      },
      {
        id: 'high-knees',
        name: 'High Knees',
        category: 'cardio',
        muscle_groups: ['legs', 'core'],
        equipment: 'bodyweight',
        instructions: ['Run in place', 'Bring knees up high', 'Maintain fast pace'],
        sets: 3,
        reps: 30,
        reps_unit: 'seconds',
        duration: 180,
        calories: 40,
        difficulty: 'beginner'
      }
    ];

    return {
      id: `cardio-plan-${Date.now()}`,
      name: 'Quick Cardio Blast',
      description: 'High-intensity bodyweight cardio workout',
      exercises,
      duration: exercises.reduce((sum, ex) => sum + ex.duration, 0),
      difficulty: 'intermediate',
      equipment_needed: ['none'],
      estimated_calories: exercises.reduce((sum, ex) => sum + ex.calories, 0)
    };
  }
}

export const workoutEngine = new WorkoutEngine();
