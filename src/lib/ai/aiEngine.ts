import { AIContext } from '@/types/ai';
import { goalTrackingEngine } from './goalTrackingEngine';

class AIEngine {
  async generateResponse(message: string, context: AIContext): Promise<string> {
    try {
      // Remove sensitive message content from logs
      if (process.env.NODE_ENV === 'development') {
        console.log('AIEngine: Generating response for message of length:', message.length);
      }
      
      // Add a small delay to simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple rule-based responses enhanced with goal tracking
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('motivation') || lowerMessage.includes('encourage')) {
        return this.generateMotivationalResponse(context);
      }
      
      if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
        return this.generateGoalResponse(context);
      }
      
      if (lowerMessage.includes('progress') || lowerMessage.includes('track')) {
        return this.generateProgressResponse(context);
      }
      
      if (lowerMessage.includes('streak') || lowerMessage.includes('consistent')) {
        return this.generateStreakResponse(context);
      }
      
      if (lowerMessage.includes('adjust') || lowerMessage.includes('change') || lowerMessage.includes('increase') || lowerMessage.includes('decrease')) {
        return this.generateAdjustmentResponse(context);
      }
      
      if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        return this.generateWorkoutResponse(context);
      }
      
      if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
        return this.generateNutritionResponse(context);
      }
      
      if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return this.generateHelpResponse();
      }
      
      // Default response with goal tracking context
      return this.generateContextualResponse(context);
      
    } catch (error) {
      console.error('AIEngine: Error generating response:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
    }
  }

  private generateMotivationalResponse(context: AIContext): string {
    const messages = goalTrackingEngine.generateMotivationalMessages(context);
    
    if (messages.length > 0) {
      const topMessage = messages[0];
      return `${topMessage.title}\n\n${topMessage.message}${topMessage.suggestedAction ? `\n\n💡 Try this: ${topMessage.suggestedAction}` : ''}`;
    }
    
    return "You're doing great! Every step forward, no matter how small, is progress. Remember, consistency beats perfection every time! 💪";
  }

  private generateGoalResponse(context: AIContext): string {
    const adjustments = goalTrackingEngine.generateGoalAdjustments(context);
    
    if (adjustments.length > 0) {
      const adjustment = adjustments[0];
      const category = context.categories?.find(c => c.id === adjustment.categoryId);
      
      return `I've analyzed your ${category?.name} progress and have a smart suggestion:\n\n${adjustment.reason}\n\nConsider adjusting from ${adjustment.currentTarget} to ${adjustment.suggestedTarget} ${category?.unit} daily. This could help you maintain momentum and see better results!`;
    }
    
    if (context.categories && context.categories.length > 0) {
      const completedToday = this.getCompletedGoalsToday(context);
      const totalGoals = context.categories.length;
      const completionPercentage = Math.round((completedToday / totalGoals) * 100);
      
      return `You have ${totalGoals} active goals with ${completedToday} completed today (${completionPercentage}%)! ${completedToday === totalGoals ? 'Amazing work! 🎉' : completedToday > totalGoals / 2 ? 'Great progress! Keep it up! 💪' : 'You\'ve got this! Every step counts! 🌟'}`;
    }
    
    return "Setting clear, achievable goals is key to success! Start with small, specific targets and build momentum. What goal would you like to work on?";
  }

  private generateProgressResponse(context: AIContext): string {
    if (!context.categories || !context.recentLogs) {
      return "I'd love to help track your progress! Start logging some activities and I'll provide personalized insights.";
    }

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = context.recentLogs.filter(log => log.date === today);
    
    if (todayLogs.length === 0) {
      return "No activities logged today yet. Let's get started! Even small actions towards your goals make a difference. 🎯";
    }

    const progressSummary = context.categories.map(category => {
      const categoryLogs = todayLogs.filter(log => log.categoryId === category.id);
      const total = categoryLogs.reduce((sum, log) => sum + log.value, 0);
      const percentage = Math.round((total / category.dailyTarget) * 100);
      
      return {
        name: category.name,
        current: total,
        target: category.dailyTarget,
        percentage: Math.min(percentage, 100),
        completed: total >= category.dailyTarget
      };
    }).filter(p => p.current > 0);

    if (progressSummary.length === 0) {
      return "Ready to make some progress today? Choose any goal and take the first step! 🚀";
    }

    const summaryText = progressSummary.map(p => 
      `• ${p.name}: ${p.current}/${p.target} (${p.percentage}%) ${p.completed ? '✅' : ''}`
    ).join('\n');

    const completedCount = progressSummary.filter(p => p.completed).length;
    const encouragement = completedCount === progressSummary.length ? 
      "All goals smashed today! You're absolutely crushing it! 🔥" :
      completedCount > 0 ? 
        "Great momentum! You're well on your way! 💪" :
        "Every journey starts with a single step. You're building something amazing! 🌟";

    return `Here's your progress today:\n\n${summaryText}\n\n${encouragement}`;
  }

  private generateStreakResponse(context: AIContext): string {
    if (!context.categories || !context.recentLogs) {
      return "Build a streak by consistently logging your activities! Even a 2-day streak is a win worth celebrating! 🎉";
    }

    // Calculate streaks for each category (simplified)
    const streakInfo = context.categories.map(category => {
      const last7Days = this.getLast7Days();
      let streak = 0;
      
      for (let i = 0; i < last7Days.length; i++) {
        const dayLogs = context.recentLogs!.filter(log => 
          log.categoryId === category.id && log.date === last7Days[i]
        );
        const dayTotal = dayLogs.reduce((sum, log) => sum + log.value, 0);
        
        if (dayTotal >= category.dailyTarget) {
          streak++;
        } else {
          break;
        }
      }
      
      return { name: category.name, streak };
    }).filter(s => s.streak > 0);

    if (streakInfo.length === 0) {
      return "Start building your streak today! Consistency is the key to lasting change. Even one day is the beginning of something great! 🔥";
    }

    const bestStreak = Math.max(...streakInfo.map(s => s.streak));
    const bestStreakCategories = streakInfo.filter(s => s.streak === bestStreak);

    if (bestStreak === 1) {
      return `You've got a 1-day streak going with ${bestStreakCategories.map(s => s.name).join(', ')}! The hardest part is starting - now let's build on this momentum! 🚀`;
    } else if (bestStreak < 7) {
      return `Awesome ${bestStreak}-day streak with ${bestStreakCategories.map(s => s.name).join(', ')}! You're building an incredible habit. Keep this fire burning! 🔥`;
    } else {
      return `WOW! ${bestStreak} days straight! Your consistency with ${bestStreakCategories.map(s => s.name).join(', ')} is absolutely inspiring! You're a streak legend! 👑`;
    }
  }

  private generateAdjustmentResponse(context: AIContext): string {
    const adjustments = goalTrackingEngine.generateGoalAdjustments(context);
    
    if (adjustments.length === 0) {
      return "Your current goals seem well-balanced! Keep logging consistently and I'll suggest adjustments when I see patterns that could help you optimize your progress. 📊";
    }

    const increaseCount = adjustments.filter(a => a.adjustmentType === 'increase').length;
    const decreaseCount = adjustments.filter(a => a.adjustmentType === 'decrease').length;

    let response = "Based on your progress patterns, I have some smart suggestions:\n\n";

    if (increaseCount > 0) {
      response += `🚀 ${increaseCount} goal(s) ready for a challenge boost - you've been crushing them!\n`;
    }
    
    if (decreaseCount > 0) {
      response += `🎯 ${decreaseCount} goal(s) could benefit from recalibration to build stronger momentum.\n`;
    }

    response += "\nCheck the 'Smart Goal Recalibration' section above for detailed recommendations!";

    return response;
  }

  private generateWorkoutResponse(context: AIContext): string {
    return "Looking for workout ideas? I can help you find exercises that match your fitness level and goals! Check out the Workouts tab for personalized recommendations based on your progress. 💪";
  }

  private generateNutritionResponse(context: AIContext): string {
    return "Nutrition is fuel for your goals! Check out the Nutrition tab for meal ideas and tips that complement your fitness journey. Remember, small changes in diet can make big differences! 🥗";
  }

  private generateHelpResponse(): string {
    return `I'm your AI fitness coach! Here's how I can help:

🎯 **Goal Tracking**: Ask about your progress, streaks, or goal adjustments
💪 **Motivation**: Get personalized encouragement and tips
📊 **Progress Analysis**: Learn about your trends and patterns
🚀 **Challenges**: Get suggestions to level up your goals
💡 **Tips**: Receive smart strategies to improve consistency

Try asking me things like:
• "How's my progress today?"
• "Should I adjust my goals?"
• "Give me some motivation!"
• "How's my streak?"`;
  }

  private generateContextualResponse(context: AIContext): string {
    const userName = context.userProfile?.name || 'there';
    
    if (!context.categories || context.categories.length === 0) {
      return `Hi ${userName}! I'm your AI fitness coach. Set up some fitness categories first, then start logging your activities. I'll provide personalized insights, motivation, and smart goal adjustments to help you succeed! 🎯`;
    }

    const completedToday = this.getCompletedGoalsToday(context);
    const totalGoals = context.categories.length;

    if (completedToday === 0) {
      return `Hey ${userName}! Ready to make today count? You have ${totalGoals} goals waiting for you. Pick one and take the first step - I'm here to cheer you on! 🌟`;
    } else if (completedToday === totalGoals) {
      return `Incredible work today, ${userName}! All ${totalGoals} goals completed! You're absolutely crushing your fitness journey! 🏆`;
    } else {
      return `Great start, ${userName}! You've completed ${completedToday} out of ${totalGoals} goals today. You're building amazing momentum! 💪`;
    }
  }

  private getCompletedGoalsToday(context: AIContext): number {
    if (!context.categories || !context.recentLogs) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    return context.categories.filter(category => {
      const todayLogs = context.recentLogs!.filter(log => 
        log.categoryId === category.id && log.date === today
      );
      const total = todayLogs.reduce((sum, log) => sum + log.value, 0);
      return total >= category.dailyTarget;
    }).length;
  }

  private getLast7Days(): string[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }
}

export const aiEngine = new AIEngine();
