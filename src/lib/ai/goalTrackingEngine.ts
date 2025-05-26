import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';
import { AIContext } from '@/types/ai';

interface GoalAnalysis {
  categoryId: string;
  categoryName: string;
  currentProgress: number;
  target: number;
  progressPercentage: number;
  streak: number;
  trend: 'improving' | 'declining' | 'stable';
  averageCompletion: number;
  daysToComplete: number;
}

interface MotivationalMessage {
  id: string;
  type: 'reminder' | 'encouragement' | 'challenge' | 'celebration' | 'tip';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  actionable?: boolean;
  suggestedAction?: string;
  timestamp: string;
}

interface GoalAdjustmentSuggestion {
  categoryId: string;
  currentTarget: number;
  suggestedTarget: number;
  reason: string;
  confidence: number;
  adjustmentType: 'increase' | 'decrease';
}

export class GoalTrackingEngine {
  // NLP-powered motivational message templates
  private motivationalTemplates = {
    morning: [
      "Good morning, {name}! Today is a fresh start. Your {category} goal awaits! 🌅",
      "Rise and shine! Yesterday's {category} progress was great - let's build on it today! ☀️",
      "Morning champion! Time to tackle that {category} goal with energy and determination! 💪"
    ],
    struggling: [
      "Hey {name}, I noticed {category} has been challenging. Remember, every small step counts! 🌟",
      "Progress isn't always linear, {name}. Your {category} journey is unique - keep pushing! 🚀",
      "Tough days build stronger habits, {name}. Your {category} goal is still within reach! 💪"
    ],
    consistent: [
      "Your consistency with {category} is impressive, {name}! You're {percentage}% of the way there! 📈",
      "Building excellent habits, {name}! Your {category} progress shows real dedication! 🏆",
      "Steady wins the race! Your {category} consistency is paying off beautifully! ⭐"
    ],
    celebration: [
      "Fantastic work, {name}! You've crushed your {category} goal today! 🎉",
      "Goal achieved! Your {category} success today is inspiring! Keep this momentum! 🔥",
      "Incredible! Another {category} goal completed. You're on fire! 🌟"
    ],
    challenge: [
      "Ready to level up, {name}? Your {category} performance suggests you can handle more! 🚀",
      "You've been crushing {category} goals! Time for a bigger challenge? 💪",
      "Your {category} streak is amazing! Can you push it even further? 🔥"
    ]
  };

  generateMotivationalMessages(context: AIContext): MotivationalMessage[] {
    const { userProfile, recentLogs, categories } = context;
    const messages: MotivationalMessage[] = [];
    
    // Only log aggregated, non-sensitive data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('GoalTrackingEngine: Generating messages with context:', {
        hasUserProfile: !!userProfile,
        hasCategories: !!categories,
        categoriesCount: categories?.length || 0,
        logsCount: recentLogs?.length || 0
      });
    }

    if (!userProfile || !categories || categories.length === 0) {
      // Return some default messages even if no categories
      return [{
        id: 'welcome-message',
        type: 'tip',
        title: 'Welcome to FitTrack!',
        message: 'Start by adding some fitness categories and logging your daily activities. I\'ll provide personalized insights and motivation based on your progress! 🎯',
        priority: 'high',
        actionable: true,
        suggestedAction: 'Add your first fitness category',
        timestamp: new Date().toISOString()
      }];
    }

    const userName = userProfile.name || 'Champion';
    const today = new Date().toISOString().split('T')[0];
    const goalAnalyses = this.analyzeGoalProgress(userProfile, recentLogs || [], categories);

    console.log('Goal analyses:', goalAnalyses);

    // Generate different types of motivational messages
    messages.push(...this.generateTimeBasedReminders(goalAnalyses, today, recentLogs || [], userName));
    messages.push(...this.generateContextualEncouragement(goalAnalyses, userName));
    messages.push(...this.generateProgressCelebrations(goalAnalyses, userName));
    messages.push(...this.generateSmartChallenges(goalAnalyses, userName));
    messages.push(...this.generatePersonalizedTips(goalAnalyses, userName));

    console.log('Generated messages:', messages.length);

    // If no messages generated, add a default one
    if (messages.length === 0) {
      messages.push({
        id: 'default-motivation',
        type: 'encouragement',
        title: `Hello ${userName}!`,
        message: 'Ready to make progress on your fitness goals today? Every small step counts towards building lasting habits! 💪',
        priority: 'medium',
        actionable: true,
        suggestedAction: 'Log some activity today',
        timestamp: new Date().toISOString()
      });
    }

    // Sort by priority and return top 5
    return messages
      .sort((a, b) => {
        const priorityWeight = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
        if (priorityWeight !== 0) return priorityWeight;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, 5);
  }

  generateGoalAdjustments(context: AIContext): GoalAdjustmentSuggestion[] {
    const { userProfile, recentLogs, categories } = context;
    const adjustments: GoalAdjustmentSuggestion[] = [];
    
    console.log('Generating goal adjustments for:', categories?.length || 0, 'categories');
    
    if (!userProfile || !categories || categories.length === 0) return adjustments;

    const goalAnalyses = this.analyzeGoalProgress(userProfile, recentLogs || [], categories);

    goalAnalyses.forEach(analysis => {
      const adjustment = this.calculateSmartGoalAdjustment(analysis);
      if (adjustment) {
        adjustments.push(adjustment);
      }
    });

    console.log('Generated adjustments:', adjustments.length);

    return adjustments
      .filter(adj => adj.confidence > 0.7)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeGoalProgress(
    userProfile: UserProfile,
    recentLogs: DailyLog[],
    categories: TrackingCategory[]
  ): GoalAnalysis[] {
    const today = new Date().toISOString().split('T')[0];

    return categories.map(category => {
      const todayLogs = recentLogs.filter(log => 
        log.categoryId === category.id && log.date === today
      );
      const currentProgress = todayLogs.reduce((sum, log) => sum + log.value, 0);

      const streak = this.calculateStreak(category.id, recentLogs);
      const trend = this.calculateTrend(category.id, recentLogs);
      const averageCompletion = this.calculateAverageCompletion(category.id, recentLogs, category.dailyTarget);

      return {
        categoryId: category.id,
        categoryName: category.name,
        currentProgress,
        target: category.dailyTarget,
        progressPercentage: Math.min((currentProgress / category.dailyTarget) * 100, 100),
        streak,
        trend,
        averageCompletion,
        daysToComplete: this.estimateDaysToComplete(currentProgress, category.dailyTarget)
      };
    });
  }

  private generateTimeBasedReminders(
    analyses: GoalAnalysis[],
    today: string,
    recentLogs: DailyLog[],
    userName: string
  ): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];
    const currentHour = new Date().getHours();

    analyses.forEach(analysis => {
      // Morning motivation (6-10 AM)
      if (currentHour >= 6 && currentHour <= 10 && analysis.progressPercentage === 0) {
        messages.push({
          id: `morning-${analysis.categoryId}-${Date.now()}`,
          type: 'reminder',
          title: 'Good Morning! Start Strong',
          message: `Good morning, ${userName}! Today is a fresh start. Your ${analysis.categoryName} goal awaits! 🌅`,
          priority: 'medium',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: `Log some ${analysis.categoryName} activity`,
          timestamp: new Date().toISOString()
        });
      }

      // Afternoon check-ins (12-3 PM)
      if (currentHour >= 12 && currentHour <= 15 && analysis.progressPercentage < 50) {
        messages.push({
          id: `afternoon-${analysis.categoryId}-${Date.now()}`,
          type: 'reminder',
          title: 'Midday Momentum Check',
          message: `${userName}, you're ${Math.round(analysis.progressPercentage)}% toward your ${analysis.categoryName} goal. Small steps lead to big wins! 🎯`,
          priority: 'low',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: `Add to your ${analysis.categoryName} progress`,
          timestamp: new Date().toISOString()
        });
      }

      // Evening push (6-9 PM)
      if (currentHour >= 18 && currentHour <= 21 && analysis.progressPercentage < 80 && analysis.progressPercentage > 0) {
        const remaining = analysis.target - analysis.currentProgress;
        messages.push({
          id: `evening-${analysis.categoryId}-${Date.now()}`,
          type: 'reminder',
          title: 'Evening Excellence Time!',
          message: `Almost there, ${userName}! Just ${remaining} more ${analysis.categoryName} to hit your goal. The finish line is calling! 🏁`,
          priority: 'high',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: `Complete your ${analysis.categoryName} goal`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return messages;
  }

  private generateContextualEncouragement(
    analyses: GoalAnalysis[],
    userName: string
  ): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];

    analyses.forEach(analysis => {
      // Struggling with goals
      if (analysis.averageCompletion < 0.5 && analysis.trend === 'declining') {
        messages.push({
          id: `encourage-struggle-${analysis.categoryId}-${Date.now()}`,
          type: 'encouragement',
          title: 'Every Step Counts',
          message: `Hey ${userName}, I noticed ${analysis.categoryName} has been challenging. Remember, every small step counts! Progress isn't always linear. 🌟`,
          priority: 'high',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: 'Start with a smaller, achievable goal today',
          timestamp: new Date().toISOString()
        });
      }

      // Consistent progress
      if (analysis.averageCompletion >= 0.5 && analysis.averageCompletion < 0.8) {
        const percentage = Math.round(analysis.averageCompletion * 100);
        messages.push({
          id: `encourage-consistent-${analysis.categoryId}-${Date.now()}`,
          type: 'encouragement',
          title: 'Building Strong Habits!',
          message: `Your consistency with ${analysis.categoryName} is impressive, ${userName}! You're ${percentage}% of the way there on average. 📈`,
          priority: 'medium',
          category: analysis.categoryName,
          timestamp: new Date().toISOString()
        });
      }

      // Breaking a streak
      if (analysis.streak === 0 && analysis.averageCompletion > 0.7) {
        messages.push({
          id: `encourage-comeback-${analysis.categoryId}-${Date.now()}`,
          type: 'encouragement',
          title: 'Comeback Champions Rise Again',
          message: `One missed day doesn't define you, ${userName}! Your ${analysis.categoryName} track record speaks volumes. Ready for a strong comeback? 💪`,
          priority: 'medium',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: `Restart your ${analysis.categoryName} streak today`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return messages;
  }

  private generateProgressCelebrations(
    analyses: GoalAnalysis[],
    userName: string
  ): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];

    analyses.forEach(analysis => {
      // Goal completion celebration
      if (analysis.progressPercentage >= 100) {
        messages.push({
          id: `celebrate-complete-${analysis.categoryId}-${Date.now()}`,
          type: 'celebration',
          title: 'Goal Crushed! 🎉',
          message: `Fantastic work, ${userName}! You've crushed your ${analysis.categoryName} goal today. You're on fire! 🔥`,
          priority: 'high',
          category: analysis.categoryName,
          timestamp: new Date().toISOString()
        });
      }

      // Milestone celebrations
      if (analysis.streak === 7) {
        messages.push({
          id: `celebrate-week-${analysis.categoryId}-${Date.now()}`,
          type: 'celebration',
          title: 'One Week Warrior! 🗡️',
          message: `7 days straight of ${analysis.categoryName}, ${userName}! You're building an unstoppable habit. This is what dedication looks like! 🌟`,
          priority: 'medium',
          category: analysis.categoryName,
          timestamp: new Date().toISOString()
        });
      }

      if (analysis.streak === 30) {
        messages.push({
          id: `celebrate-month-${analysis.categoryId}-${Date.now()}`,
          type: 'celebration',
          title: 'Monthly Master! 👑',
          message: `30 days of consistent ${analysis.categoryName}, ${userName}! You've officially built a lasting habit. Absolutely incredible! 🏆`,
          priority: 'high',
          category: analysis.categoryName,
          timestamp: new Date().toISOString()
        });
      }
    });

    return messages;
  }

  private generateSmartChallenges(
    analyses: GoalAnalysis[],
    userName: string
  ): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];

    analyses.forEach(analysis => {
      // Challenge for high performers
      if (analysis.averageCompletion > 1.2 && analysis.trend === 'improving') {
        messages.push({
          id: `challenge-exceed-${analysis.categoryId}-${Date.now()}`,
          type: 'challenge',
          title: 'Ready for the Next Level?',
          message: `Ready to level up, ${userName}? Your ${analysis.categoryName} performance suggests you can handle more! 🚀`,
          priority: 'medium',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: 'Consider increasing your daily target',
          timestamp: new Date().toISOString()
        });
      }

      // Streak challenges
      if (analysis.streak >= 7 && analysis.streak < 30) {
        const nextMilestone = analysis.streak >= 14 ? 30 : 14;
        messages.push({
          id: `challenge-streak-${analysis.categoryId}-${Date.now()}`,
          type: 'challenge',
          title: `Streak Legend in the Making!`,
          message: `${analysis.streak} days strong with ${analysis.categoryName}, ${userName}! Your next milestone: ${nextMilestone} days. The legend continues! 🔥`,
          priority: 'low',
          category: analysis.categoryName,
          actionable: true,
          suggestedAction: `Keep your ${analysis.categoryName} streak alive`,
          timestamp: new Date().toISOString()
        });
      }
    });

    return messages;
  }

  private generatePersonalizedTips(
    analyses: GoalAnalysis[],
    userName: string
  ): MotivationalMessage[] {
    const messages: MotivationalMessage[] = [];
    const tips = this.getSmartFitnessTips();

    analyses.forEach(analysis => {
      if (analysis.averageCompletion < 0.6) {
        const relevantTips = tips.filter(tip => 
          tip.categories.includes(analysis.categoryName.toLowerCase()) ||
          tip.categories.includes('general')
        );

        if (relevantTips.length > 0) {
          const randomTip = relevantTips[Math.floor(Math.random() * relevantTips.length)];
          messages.push({
            id: `tip-${analysis.categoryId}-${Date.now()}`,
            type: 'tip',
            title: `💡 Smart Tip for ${userName}`,
            message: `${randomTip.title}: ${randomTip.content}`,
            priority: 'low',
            category: analysis.categoryName,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    return messages;
  }

  private calculateSmartGoalAdjustment(analysis: GoalAnalysis): GoalAdjustmentSuggestion | null {
    // Suggest increasing goals for overperformers
    if (analysis.averageCompletion > 1.3 && analysis.trend === 'improving' && analysis.streak >= 7) {
      const increasePercentage = Math.min(0.25, analysis.averageCompletion - 1);
      const suggestedIncrease = Math.round(analysis.target * increasePercentage);
      return {
        categoryId: analysis.categoryId,
        currentTarget: analysis.target,
        suggestedTarget: analysis.target + suggestedIncrease,
        reason: `You've been consistently exceeding your goal by ${Math.round((analysis.averageCompletion - 1) * 100)}% for ${analysis.streak} days. Time to level up!`,
        confidence: Math.min(0.95, 0.7 + (analysis.averageCompletion - 1.3) * 0.5),
        adjustmentType: 'increase'
      };
    }

    // Suggest decreasing goals for those struggling
    if (analysis.averageCompletion < 0.4 && analysis.trend === 'declining') {
      const decreasePercentage = Math.max(0.2, 0.6 - analysis.averageCompletion);
      const suggestedDecrease = Math.round(analysis.target * decreasePercentage);
      return {
        categoryId: analysis.categoryId,
        currentTarget: analysis.target,
        suggestedTarget: Math.max(1, analysis.target - suggestedDecrease),
        reason: `Your current goal might be too ambitious. Let's build momentum with a more achievable target!`,
        confidence: Math.min(0.9, 0.6 + (0.4 - analysis.averageCompletion) * 0.75),
        adjustmentType: 'decrease'
      };
    }

    return null;
  }

  // Helper methods
  private calculateStreak(categoryId: string, logs: DailyLog[]): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => log.categoryId === categoryId && log.date === dateStr);
      const dayTotal = dayLogs.reduce((sum, log) => sum + log.value, 0);
      
      if (dayTotal > 0) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateTrend(categoryId: string, logs: DailyLog[]): 'improving' | 'declining' | 'stable' {
    const last14Days = this.getLast14Days();
    const first7Days = last14Days.slice(0, 7);
    const recent7Days = last14Days.slice(7);

    const getAverageForPeriod = (period: string[]) => {
      const periodLogs = logs.filter(log => 
        log.categoryId === categoryId && period.includes(log.date)
      );
      return periodLogs.reduce((sum, log) => sum + log.value, 0) / period.length;
    };

    const firstWeekAvg = getAverageForPeriod(first7Days);
    const recentWeekAvg = getAverageForPeriod(recent7Days);

    const difference = recentWeekAvg - firstWeekAvg;
    const threshold = firstWeekAvg * 0.1;

    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  }

  private calculateAverageCompletion(categoryId: string, logs: DailyLog[], target: number): number {
    const last30Days = this.getLast30Days();
    const completionRates = last30Days.map(date => {
      const dayLogs = logs.filter(log => log.categoryId === categoryId && log.date === date);
      const dayTotal = dayLogs.reduce((sum, log) => sum + log.value, 0);
      return dayTotal / target;
    });

    return completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  private estimateDaysToComplete(current: number, target: number): number {
    if (current >= target) return 0;
    
    const currentHour = new Date().getHours();
    const hoursLeft = 24 - currentHour;
    const progressRate = current / (24 - hoursLeft);
    
    if (progressRate <= 0) return 1;
    
    const hoursNeeded = (target - current) / progressRate;
    return Math.ceil(hoursNeeded / 24);
  }

  private getLast14Days(): string[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  private getLast30Days(): string[] {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  private getPriorityWeight(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private getSmartFitnessTips() {
    return [
      {
        title: "The 2-Minute Rule",
        content: "If a goal feels overwhelming, commit to just 2 minutes. Often, you'll keep going once you start!",
        categories: ['general', 'exercise', 'workout']
      },
      {
        title: "Habit Stacking Power",
        content: "Link your fitness goal to something you already do daily, like having morning coffee.",
        categories: ['general', 'habits']
      },
      {
        title: "Small Wins Strategy",
        content: "Break big goals into smaller chunks throughout the day. Every bit counts!",
        categories: ['general', 'strategy']
      }
    ];
  }

  // Method to track user feedback
  addMessageFeedback(messageId: string, helpful: boolean, feedback?: string): void {
    console.log(`User feedback for message ${messageId}: ${helpful ? 'helpful' : 'not helpful'}`, feedback);
  }
}

export const goalTrackingEngine = new GoalTrackingEngine();
