import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';

interface AIContext {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
}

class AIEngine {
  async generateResponse(message: string, context: AIContext): Promise<string> {
    try {
      console.log('AIEngine: Generating response for:', message);
      
      // Add a small delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple rule-based responses for now
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        return this.generateWorkoutResponse(context);
      }
      
      if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
        return this.generateNutritionResponse(context);
      }
      
      if (lowerMessage.includes('progress') || lowerMessage.includes('goal')) {
        return this.generateProgressResponse(context);
      }
      
      if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return this.generateHelpResponse();
      }
      
      // Default response
      return "I'm here to help you with your fitness journey! Ask me about workouts, nutrition, or tracking your progress.";
      
    } catch (error) {
      console.error('AIEngine: Error generating response:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
    }
  }

  private generateWorkoutResponse(context: AIContext): string {
    const goal = context.userProfile?.fitnessGoal;
    
    if (goal === 'weight_loss') {
      return "For weight loss, I recommend combining cardio exercises like running or cycling with strength training. Aim for 150 minutes of moderate cardio per week plus 2-3 strength sessions.";
    }
    
    if (goal === 'muscle_gain') {
      return "For muscle gain, focus on progressive overload with compound exercises like squats, deadlifts, and bench press. Aim for 3-4 strength training sessions per week with adequate rest between sessions.";
    }
    
    return "A balanced workout routine should include both cardio and strength training. Start with 3 sessions per week and gradually increase intensity.";
  }

  private generateNutritionResponse(context: AIContext): string {
    const goal = context.userProfile?.fitnessGoal;
    
    if (goal === 'weight_loss') {
      return "For weight loss, focus on a caloric deficit. Eat plenty of lean proteins, vegetables, and whole grains. Stay hydrated and consider tracking your food intake.";
    }
    
    if (goal === 'muscle_gain') {
      return "For muscle gain, ensure adequate protein intake (0.8-1g per pound of body weight) and eat in a slight caloric surplus. Don't forget post-workout nutrition!";
    }
    
    return "A balanced diet with adequate protein, healthy fats, and complex carbohydrates will support your fitness goals. Remember to stay hydrated!";
  }

  private generateProgressResponse(context: AIContext): string {
    const logs = context.recentLogs || [];
    const categories = context.categories || [];
    
    if (logs.length === 0) {
      return "Start tracking your daily activities to monitor progress. Consistency is key to achieving your fitness goals!";
    }
    
    const completedToday = categories.filter(cat => {
      const todayLogs = logs.filter(log => log.categoryId === cat.id);
      const total = todayLogs.reduce((sum, log) => sum + log.value, 0);
      return total >= cat.dailyTarget;
    }).length;
    
    if (completedToday === categories.length) {
      return "Excellent! You've completed all your daily goals. Keep up the great work!";
    }
    
    return `You've completed ${completedToday} out of ${categories.length} goals today. You're doing great - every step counts toward your fitness journey!`;
  }

  private generateHelpResponse(): string {
    return `I can help you with:
    
📊 Progress tracking - Ask about your daily goals
🏋️ Workout advice - Get exercise recommendations
🥗 Nutrition tips - Learn about healthy eating
💪 Motivation - Stay encouraged on your fitness journey

What would you like to know more about?`;
  }
}

export const aiEngine = new AIEngine();
