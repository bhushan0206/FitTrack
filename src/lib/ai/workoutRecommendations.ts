import { AIContext, WorkoutRecommendation, UserFitnessProfile, WorkoutPreferences } from '@/types/ai';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';
import { ExerciseLog } from '@/types/exercise';

export class WorkoutRecommendationEngine {
  // Predefined workout templates categorized by goals and difficulty
  private workoutTemplates: WorkoutRecommendation[] = [
    {
      id: 'beginner-bodyweight',
      type: 'workout_plan',
      title: 'Beginner Bodyweight Routine',
      description: 'Perfect for beginners starting their fitness journey',
      confidence_score: 0.9,
      reasoning: 'Bodyweight exercises are safe and effective for beginners',
      priority: 'high',
      created_at: new Date().toISOString(),
      difficulty: 'beginner',
      fitness_goals: ['general_health', 'weight_loss'],
      duration: 20,
      equipment_needed: [],
      workout_type: 'strength'
    },
    {
      id: 'hiit_fat_loss_beginner',
      type: 'workout_plan',
      title: 'HIIT Fat Burner - Beginner',
      description: 'High-intensity interval training designed for beginners to maximize fat burn',
      confidence_score: 0.9,
      reasoning: 'Perfect for beginners looking to lose weight with minimal equipment',
      priority: 'high',
      created_at: new Date().toISOString(),
      difficulty: 'beginner',
      duration: 20,
      equipment_needed: [],
      fitness_goals: ['weight_loss', 'endurance'],
      workout_type: 'hiit'
    },
    {
      id: 'strength_muscle_gain_intermediate',
      type: 'workout_plan',
      title: 'Upper Body Strength Builder',
      description: 'Intermediate strength training focused on building upper body muscle',
      confidence_score: 0.85,
      reasoning: 'Based on your strength goals and intermediate fitness level',
      priority: 'medium',
      created_at: new Date().toISOString(),
      difficulty: 'intermediate',
      duration: 45,
      equipment_needed: ['dumbbells', 'resistance_bands'],
      fitness_goals: ['muscle_gain', 'strength'],
      workout_type: 'strength'
    },
    {
      id: 'cardio_endurance_advanced',
      type: 'workout_plan',
      title: 'Advanced Cardio Circuit',
      description: 'High-intensity cardio workout for advanced fitness enthusiasts',
      confidence_score: 0.8,
      reasoning: 'Your advanced fitness level and endurance goals make this ideal',
      priority: 'medium',
      created_at: new Date().toISOString(),
      difficulty: 'advanced',
      duration: 35,
      equipment_needed: [],
      fitness_goals: ['endurance', 'weight_loss'],
      workout_type: 'cardio'
    },
    {
      id: 'flexibility_recovery_all',
      type: 'workout_plan',
      title: 'Full Body Flexibility & Recovery',
      description: 'Gentle stretching and mobility work for recovery and flexibility',
      confidence_score: 0.95,
      reasoning: 'Perfect for recovery days or improving overall flexibility',
      priority: 'low',
      created_at: new Date().toISOString(),
      difficulty: 'beginner',
      duration: 25,
      equipment_needed: ['yoga_mat'],
      fitness_goals: ['flexibility', 'recovery'],
      workout_type: 'flexibility'
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

    // Difficulty match (30% weight)
    if (workout.difficulty === factors.fitnessLevel) {
      score += 0.3;
    } else if (
      (workout.difficulty === 'intermediate' && factors.fitnessLevel === 'beginner') ||
      (workout.difficulty === 'beginner' && factors.fitnessLevel === 'intermediate')
    ) {
      score += 0.15; // Partial match for adjacent difficulty levels
    }

    // Goal alignment (40% weight)
    if (workout.fitness_goals) {
      const goalMatches = workout.fitness_goals.filter(goal =>
        factors.primaryGoals.includes(goal)
      ).length;
      score += (goalMatches / Math.max(workout.fitness_goals.length, 1)) * 0.4;
    }

    // Time availability (20% weight)
    if (workout.duration) {
      const timeDiff = Math.abs(workout.duration - factors.availableTime);
      const timeScore = Math.max(0, 1 - (timeDiff / factors.availableTime));
      score += timeScore * 0.2;
    }

    // Activity pattern bonus (10% weight)
    if (factors.activityPatterns.frequency >= 4 && workout.workout_type === 'flexibility') {
      score += 0.1; // Bonus for flexibility for frequent exercisers
    } else if (factors.activityPatterns.frequency < 3 && workout.difficulty === 'beginner') {
      score += 0.1; // Bonus for beginner workouts for infrequent exercisers
    }

    return Math.min(score, 1); // Cap at 1.0
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

    // Difficulty reasoning
    if (workout.difficulty === factors.fitnessLevel) {
      reasons.push(`Perfect for your ${factors.fitnessLevel} fitness level`);
    }

    // Goal alignment
    if (workout.fitness_goals) {
      const matchingGoals = workout.fitness_goals.filter(goal =>
        factors.primaryGoals.includes(goal)
      );
      if (matchingGoals.length > 0) {
        reasons.push(`Aligns with your ${matchingGoals.join(' and ')} goals`);
      }
    }

    // Time considerations
    if (workout.duration && Math.abs(workout.duration - factors.activityPatterns.avgDuration) <= 5) {
      reasons.push(`${workout.duration} minutes fits your typical workout duration`);
    }

    // Equipment considerations
    if (workout.equipment_needed && workout.equipment_needed.length === 0) {
      reasons.push('No equipment needed - perfect for home workouts');
    }

    // Activity pattern considerations
    if (factors.activityPatterns.frequency < 3 && workout.difficulty === 'beginner') {
      reasons.push('Great for building a consistent exercise habit');
    }

    return reasons.length > 0 
      ? reasons.join('. ') + '.' 
      : 'This workout matches your fitness profile and goals.';
  }

  // Method to get workout by ID (for when user selects a recommendation)
  getWorkoutById(id: string): WorkoutRecommendation | null {
    return this.workoutTemplates.find(workout => workout.id === id) || null;
  }

  // Method to add user feedback to improve future recommendations
  addUserFeedback(workoutId: string, rating: number, feedback?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`User feedback for workout ${workoutId}: ${rating}/5`, feedback);
    }
  }
}

export const workoutRecommendationEngine = new WorkoutRecommendationEngine();
