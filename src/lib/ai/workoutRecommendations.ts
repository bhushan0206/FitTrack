import { AIContext, WorkoutRecommendation, UserFitnessProfile, WorkoutPreferences } from '@/types/ai';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';
import { ExerciseLog } from '@/types/exercise';

export class WorkoutRecommendationEngine {
  // Predefined workout templates categorized by goals and difficulty
  private workoutTemplates: WorkoutRecommendation[] = [
    {
      id: 'hiit_fat_loss_beginner',
      title: 'HIIT Fat Burner - Beginner',
      description: 'High-intensity interval training designed for beginners to maximize fat burn',
      difficulty: 'beginner',
      duration: 20,
      calories_estimate: 180,
      equipment_needed: [],
      fitness_goals: ['weight_loss', 'endurance'],
      body_parts: ['full_body'],
      workout_type: 'hiit',
      confidence_score: 0.9,
      reasoning: 'Perfect for beginners looking to lose weight with minimal equipment',
      exercises: [
        {
          name: 'Jumping Jacks',
          duration: 30,
          rest_time: 15,
          instructions: 'Jump while spreading legs and raising arms overhead',
          modifications: 'Step side to side instead of jumping if needed'
        },
        {
          name: 'Push-ups',
          reps: 8,
          rest_time: 15,
          instructions: 'Lower body to ground and push back up',
          modifications: 'Knee push-ups or wall push-ups for easier variation'
        },
        {
          name: 'Mountain Climbers',
          duration: 30,
          rest_time: 15,
          instructions: 'Alternate bringing knees to chest in plank position',
          modifications: 'Slow down the pace or step instead of jumping'
        },
        {
          name: 'Squats',
          reps: 12,
          rest_time: 30,
          instructions: 'Lower body as if sitting in a chair, then stand back up',
          modifications: 'Use a chair for support if needed'
        }
      ]
    },
    {
      id: 'strength_muscle_gain_intermediate',
      title: 'Upper Body Strength Builder',
      description: 'Intermediate strength training focused on building upper body muscle',
      difficulty: 'intermediate',
      duration: 45,
      calories_estimate: 220,
      equipment_needed: ['dumbbells', 'resistance_bands'],
      fitness_goals: ['muscle_gain', 'strength'],
      body_parts: ['chest', 'arms', 'shoulders'],
      workout_type: 'strength',
      confidence_score: 0.85,
      reasoning: 'Based on your strength goals and intermediate fitness level',
      exercises: [
        {
          name: 'Dumbbell Chest Press',
          sets: 3,
          reps: 10,
          rest_time: 60,
          instructions: 'Lie on back, press dumbbells up from chest level',
          modifications: 'Use lighter weights or resistance bands'
        },
        {
          name: 'Bent-over Rows',
          sets: 3,
          reps: 12,
          rest_time: 60,
          instructions: 'Bend forward, pull weights to chest level',
          modifications: 'Use resistance bands or lighter weights'
        },
        {
          name: 'Shoulder Press',
          sets: 3,
          reps: 10,
          rest_time: 60,
          instructions: 'Press weights overhead from shoulder level',
          modifications: 'Seated variation or lighter weights'
        },
        {
          name: 'Bicep Curls',
          sets: 2,
          reps: 15,
          rest_time: 45,
          instructions: 'Curl weights from extended arms to shoulders',
          modifications: 'Use resistance bands for variable resistance'
        }
      ]
    },
    {
      id: 'cardio_endurance_advanced',
      title: 'Advanced Cardio Circuit',
      description: 'High-intensity cardio workout for advanced fitness enthusiasts',
      difficulty: 'advanced',
      duration: 35,
      calories_estimate: 350,
      equipment_needed: [],
      fitness_goals: ['endurance', 'weight_loss'],
      body_parts: ['full_body'],
      workout_type: 'cardio',
      confidence_score: 0.8,
      reasoning: 'Your advanced fitness level and endurance goals make this ideal',
      exercises: [
        {
          name: 'Burpees',
          sets: 4,
          reps: 15,
          rest_time: 30,
          instructions: 'Full body movement: squat, jump back, push-up, jump forward, jump up',
          modifications: 'Remove push-up or jump for easier variation'
        },
        {
          name: 'High Knees',
          duration: 45,
          rest_time: 15,
          instructions: 'Run in place bringing knees up to waist level',
          modifications: 'March in place with high knees'
        },
        {
          name: 'Jump Squats',
          sets: 3,
          reps: 20,
          rest_time: 45,
          instructions: 'Squat down and explode up into a jump',
          modifications: 'Regular squats without the jump'
        },
        {
          name: 'Plank Jacks',
          duration: 30,
          rest_time: 30,
          instructions: 'In plank position, jump feet apart and together',
          modifications: 'Step feet apart instead of jumping'
        }
      ]
    },
    {
      id: 'flexibility_recovery_all',
      title: 'Full Body Flexibility & Recovery',
      description: 'Gentle stretching and mobility work for recovery and flexibility',
      difficulty: 'beginner',
      duration: 25,
      calories_estimate: 60,
      equipment_needed: ['yoga_mat'],
      fitness_goals: ['flexibility', 'recovery'],
      body_parts: ['full_body'],
      workout_type: 'flexibility',
      confidence_score: 0.95,
      reasoning: 'Perfect for recovery days or improving overall flexibility',
      exercises: [
        {
          name: 'Cat-Cow Stretch',
          duration: 60,
          rest_time: 10,
          instructions: 'On hands and knees, alternate arching and rounding your back',
          modifications: 'Can be done seated in a chair'
        },
        {
          name: 'Child\'s Pose',
          duration: 45,
          rest_time: 15,
          instructions: 'Kneel and sit back on heels, reach arms forward on ground',
          modifications: 'Place pillow under knees for comfort'
        },
        {
          name: 'Hip Flexor Stretch',
          duration: 30,
          rest_time: 10,
          instructions: 'Lunge position, push hips forward to stretch hip flexors',
          modifications: 'Use wall or chair for balance support'
        },
        {
          name: 'Seated Spinal Twist',
          duration: 30,
          rest_time: 15,
          instructions: 'Seated, rotate torso to one side, hold, then other side',
          modifications: 'Can be done in any chair'
        }
      ]
    }
  ];

  generateRecommendations(context: AIContext): WorkoutRecommendation[] {
    const userProfile = context.userProfile;
    const recentLogs = context.recentLogs || [];
    const categories = context.categories || [];

    // Analyze user's fitness profile
    const fitnessLevel = this.determineFitnessLevel(userProfile, recentLogs);
    const primaryGoals = this.extractFitnessGoals(userProfile);
    const activityPatterns = this.analyzeActivityPatterns(recentLogs, categories);
    const availableTime = this.estimateAvailableTime(recentLogs);

    // Score and filter workout templates
    const scoredWorkouts = this.workoutTemplates
      .map(workout => ({
        ...workout,
        confidence_score: this.calculateWorkoutScore(workout, {
          fitnessLevel,
          primaryGoals,
          activityPatterns,
          availableTime,
          userProfile
        })
      }))
      .filter(workout => workout.confidence_score > 0.3)
      .sort((a, b) => b.confidence_score - a.confidence_score);

    // Return top 3 recommendations with personalized reasoning
    return scoredWorkouts.slice(0, 3).map(workout => ({
      ...workout,
      reasoning: this.generatePersonalizedReasoning(workout, {
        fitnessLevel,
        primaryGoals,
        activityPatterns,
        userProfile
      })
    }));
  }

  private determineFitnessLevel(userProfile?: UserProfile, recentLogs?: DailyLog[]): 'beginner' | 'intermediate' | 'advanced' {
    // If user explicitly set fitness goal that indicates level
    if (userProfile?.fitnessGoal) {
      const goal = userProfile.fitnessGoal.toLowerCase();
      if (goal.includes('beginner') || goal.includes('start')) return 'beginner';
      if (goal.includes('advanced') || goal.includes('expert')) return 'advanced';
    }

    // Analyze activity consistency and volume
    if (!recentLogs || recentLogs.length === 0) return 'beginner';

    const last30Days = recentLogs.filter(log => {
      const logDate = new Date(log.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    });

    const workoutDays = last30Days.length;
    const avgDailyActivity = last30Days.reduce((sum, log) => sum + log.value, 0) / Math.max(workoutDays, 1);

    if (workoutDays < 8 || avgDailyActivity < 20) return 'beginner';
    if (workoutDays >= 20 && avgDailyActivity >= 45) return 'advanced';
    return 'intermediate';
  }

  private extractFitnessGoals(userProfile?: UserProfile): string[] {
    if (!userProfile?.fitnessGoal) return ['general_fitness'];

    const goal = userProfile.fitnessGoal.toLowerCase();
    const goals: string[] = [];

    if (goal.includes('weight') || goal.includes('lose') || goal.includes('fat')) {
      goals.push('weight_loss');
    }
    if (goal.includes('muscle') || goal.includes('strength') || goal.includes('bulk')) {
      goals.push('muscle_gain', 'strength');
    }
    if (goal.includes('endurance') || goal.includes('cardio') || goal.includes('stamina')) {
      goals.push('endurance');
    }
    if (goal.includes('flexibility') || goal.includes('stretch') || goal.includes('mobility')) {
      goals.push('flexibility');
    }
    if (goal.includes('tone') || goal.includes('lean')) {
      goals.push('weight_loss', 'strength');
    }

    return goals.length > 0 ? goals : ['general_fitness'];
  }

  private analyzeActivityPatterns(recentLogs?: DailyLog[], categories?: TrackingCategory[]): any {
    if (!recentLogs || !categories) {
      return { avgDuration: 30, preferredTypes: ['cardio'], frequency: 2 };
    }

    // Calculate average workout duration based on logs
    const workoutCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('workout') || 
      cat.name.toLowerCase().includes('exercise') ||
      cat.unit.toLowerCase().includes('min')
    );

    const workoutLogs = recentLogs.filter(log => 
      workoutCategories.some(cat => cat.id === log.categoryId)
    );

    const avgDuration = workoutLogs.length > 0 
      ? workoutLogs.reduce((sum, log) => sum + log.value, 0) / workoutLogs.length 
      : 30;

    // Determine frequency (workouts per week)
    const weeksOfData = Math.max(1, Math.ceil(recentLogs.length / 7));
    const frequency = workoutLogs.length / weeksOfData;

    return {
      avgDuration,
      preferredTypes: ['cardio', 'strength'], // Could be enhanced with more analysis
      frequency
    };
  }

  private estimateAvailableTime(recentLogs?: DailyLog[]): number {
    if (!recentLogs || recentLogs.length === 0) return 30;

    // Find workout-related logs and calculate average time
    const workoutTimes = recentLogs
      .filter(log => log.value > 5 && log.value < 180) // Reasonable workout times
      .map(log => log.value);

    if (workoutTimes.length === 0) return 30;

    const avgTime = workoutTimes.reduce((sum, time) => sum + time, 0) / workoutTimes.length;
    return Math.round(avgTime);
  }

  private calculateWorkoutScore(
    workout: WorkoutRecommendation, 
    factors: {
      fitnessLevel: string;
      primaryGoals: string[];
      activityPatterns: any;
      availableTime: number;
      userProfile?: UserProfile;
    }
  ): number {
    let score = 0;

    // Fitness level match (30% weight)
    if (workout.difficulty === factors.fitnessLevel) {
      score += 0.3;
    } else if (
      (workout.difficulty === 'intermediate' && factors.fitnessLevel === 'beginner') ||
      (workout.difficulty === 'beginner' && factors.fitnessLevel === 'intermediate')
    ) {
      score += 0.15; // Partial match for adjacent levels
    }

    // Goal alignment (40% weight)
    const goalMatches = workout.fitness_goals.filter(goal => 
      factors.primaryGoals.includes(goal)
    ).length;
    score += (goalMatches / Math.max(workout.fitness_goals.length, 1)) * 0.4;

    // Time availability (20% weight)
    const timeDiff = Math.abs(workout.duration - factors.availableTime);
    const timeScore = Math.max(0, 1 - (timeDiff / factors.availableTime));
    score += timeScore * 0.2;

    // Activity frequency compatibility (10% weight)
    if (factors.activityPatterns.frequency >= 4 && workout.workout_type === 'flexibility') {
      score += 0.1; // Recommend recovery for active users
    } else if (factors.activityPatterns.frequency < 3 && workout.difficulty === 'beginner') {
      score += 0.1; // Recommend beginner workouts for less active users
    }

    return Math.min(score, 1.0);
  }

  private generatePersonalizedReasoning(
    workout: WorkoutRecommendation,
    factors: {
      fitnessLevel: string;
      primaryGoals: string[];
      activityPatterns: any;
      userProfile?: UserProfile;
    }
  ): string {
    const reasons: string[] = [];

    // Fitness level reasoning
    if (workout.difficulty === factors.fitnessLevel) {
      reasons.push(`Perfect match for your ${factors.fitnessLevel} fitness level`);
    }

    // Goal alignment
    const matchingGoals = workout.fitness_goals.filter(goal => 
      factors.primaryGoals.includes(goal)
    );
    if (matchingGoals.length > 0) {
      reasons.push(`Aligns with your ${matchingGoals.join(' and ')} goals`);
    }

    // Duration consideration
    if (Math.abs(workout.duration - factors.activityPatterns.avgDuration) <= 5) {
      reasons.push(`${workout.duration} minutes fits your typical workout duration`);
    }

    // Equipment consideration
    if (workout.equipment_needed.length === 0) {
      reasons.push('No equipment needed - can be done anywhere');
    }

    // Frequency consideration
    if (factors.activityPatterns.frequency < 3 && workout.difficulty === 'beginner') {
      reasons.push('Great for building consistency with your current activity level');
    }

    return reasons.length > 0 
      ? reasons.join('. ') + '.' 
      : 'Recommended based on your fitness profile and activity history.';
  }

  // Method to get workout by ID (for when user selects a recommendation)
  getWorkoutById(id: string): WorkoutRecommendation | null {
    return this.workoutTemplates.find(workout => workout.id === id) || null;
  }

  // Method to add user feedback to improve future recommendations
  addUserFeedback(workoutId: string, rating: number, feedback?: string): void {
    // In a real implementation, this would store feedback in the database
    // and be used to improve the recommendation algorithm
    console.log(`User feedback for workout ${workoutId}: ${rating}/5`, feedback);
  }
}

export const workoutRecommendationEngine = new WorkoutRecommendationEngine();
