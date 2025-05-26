import { UserProfile, TrackingCategory, DailyLog } from '@/types/fitness';
import { MotivationMessage, Goal, GoalRecommendation, ProgressInsight, MotivationProfile } from '@/types/motivation';

interface MotivationContext {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
  currentGoals?: Goal[];
  motivationProfile?: MotivationProfile;
}

export class MotivationEngine {
  private motivationalMessages = {
    encouragement: [
      "You're stronger than you think! 💪",
      "Every small step counts towards your big goals! 🌟",
      "Progress, not perfection - you're doing amazing! 🎯",
      "Your future self will thank you for the work you're putting in today! 🚀",
      "Champions are made when nobody's watching - keep going! 👑"
    ],
    achievement: [
      "🎉 Incredible work! You've smashed your goal!",
      "🏆 Achievement unlocked! You're on fire!",
      "⭐ Outstanding performance! You're setting the bar high!",
      "🔥 You're absolutely crushing it! Keep this momentum going!",
      "💎 Consistency pays off - look at what you've accomplished!"
    ],
    reminder: [
      "⏰ Don't forget to log your progress today!",
      "📊 A quick check-in with your goals can make all the difference!",
      "🎯 Small actions today = big results tomorrow!",
      "📝 Remember: tracking leads to improvement!",
      "⚡ Quick reminder to stay on track with your health goals!"
    ],
    challenge: [
      "🚀 Ready to level up? Try increasing your goal by 10%!",
      "🎯 Challenge accepted: Can you beat your personal best this week?",
      "💪 Your body is capable of more than you think - push those limits!",
      "🏃‍♀️ Time to step out of your comfort zone - growth happens there!",
      "⚡ New week, new challenges - what will you conquer?"
    ],
    tip: [
      "💡 Pro tip: Consistency beats intensity every time!",
      "🧠 Remember: your mindset determines your success!",
      "⏰ Morning workouts can boost your energy for the entire day!",
      "🥗 Fuel your body like the high-performance machine it is!",
      "😴 Quality sleep is just as important as your workouts!"
    ]
  };

  private analyzeProgress(context: MotivationContext): ProgressInsight[] {
    const insights: ProgressInsight[] = [];
    const { recentLogs, categories } = context;

    if (!recentLogs || !categories) return insights;

    // Analyze last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentData = recentLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);

    categories.forEach(category => {
      const categoryLogs = recentData
        .filter(log => log.categoryId === category.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (categoryLogs.length < 5) return; // Need at least 5 data points

      const values = categoryLogs.map(log => log.value);
      const recentValues = values.slice(-7); // Last 7 entries
      const olderValues = values.slice(0, -7);

      // Calculate trends
      const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const olderAvg = olderValues.length > 0 ? olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length : recentAvg;
      
      const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
      let trendDirection: 'up' | 'down' | 'stable' | 'volatile' = 'stable';
      let significance: 'low' | 'medium' | 'high' = 'low';

      if (Math.abs(changePercent) > 20) {
        significance = 'high';
        trendDirection = changePercent > 0 ? 'up' : 'down';
      } else if (Math.abs(changePercent) > 10) {
        significance = 'medium';
        trendDirection = changePercent > 0 ? 'up' : 'down';
      }

      // Check for volatility
      const variance = values.reduce((sum, val) => sum + Math.pow(val - recentAvg, 2), 0) / values.length;
      if (variance > recentAvg * 0.5) {
        trendDirection = 'volatile';
      }

      // Generate insights
      let insightType: 'trend' | 'achievement' | 'concern' | 'opportunity' = 'trend';
      let title = '';
      let description = '';
      let actionableTips: string[] = [];

      if (trendDirection === 'up' && significance === 'high') {
        insightType = 'achievement';
        title = `🚀 Excellent progress in ${category.name}!`;
        description = `You've improved by ${changePercent.toFixed(1)}% over the past month. Keep up the fantastic work!`;
        actionableTips = [
          'Continue your current routine - it\'s working!',
          'Consider gradually increasing your target to maintain challenge',
          'Share your success to inspire others'
        ];
      } else if (trendDirection === 'down' && significance === 'high') {
        insightType = 'concern';
        title = `📉 ${category.name} needs attention`;
        description = `There's been a ${Math.abs(changePercent).toFixed(1)}% decrease in your ${category.name} recently.`;
        actionableTips = [
          'Review what might have changed in your routine',
          'Consider setting smaller, more achievable daily targets',
          'Focus on consistency over intensity'
        ];
      } else if (trendDirection === 'volatile') {
        insightType = 'opportunity';
        title = `🎯 Opportunity to stabilize ${category.name}`;
        description = `Your ${category.name} shows high variability. Consistency could unlock better results.`;
        actionableTips = [
          'Try to maintain similar daily targets',
          'Set up reminders for consistent logging',
          'Identify factors causing the variation'
        ];
      } else {
        insightType = 'trend';
        title = `📊 ${category.name} is trending ${trendDirection}`;
        description = `Your ${category.name} has been ${trendDirection === 'stable' ? 'consistent' : `trending ${trendDirection}`} over the past month.`;
        actionableTips = [
          'Keep monitoring your progress',
          'Small adjustments can lead to big improvements',
          'Celebrate consistent effort'
        ];
      }

      insights.push({
        id: `insight-${category.id}-${Date.now()}`,
        category_id: category.id,
        insight_type: insightType,
        title,
        description,
        data_points: values,
        trend_direction: trendDirection,
        significance,
        actionable_tips: actionableTips,
        created_at: new Date().toISOString()
      });
    });

    return insights.sort((a, b) => {
      const significanceOrder = { high: 3, medium: 2, low: 1 };
      return significanceOrder[b.significance] - significanceOrder[a.significance];
    });
  }

  // Removed duplicate implementation of generateGoalRecommendations

  generateMotivationMessages(context: MotivationContext): MotivationMessage[] {
    const messages: MotivationMessage[] = [];
    const { recentLogs, categories, motivationProfile } = context;

    if (!recentLogs || !categories) {
      // Default encouragement if no data
      messages.push({
        id: `motivation-${Date.now()}`,
        type: 'encouragement',
        message: this.motivationalMessages.encouragement[Math.floor(Math.random() * this.motivationalMessages.encouragement.length)],
        context: 'general',
        priority: 'medium',
        sentiment: 'positive',
        created_at: new Date().toISOString()
      });
      return messages;
    }

    // Check recent activity (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentActivity = recentLogs.filter(log => new Date(log.date) >= threeDaysAgo);

    // Check if user has been inactive
    if (recentActivity.length === 0) {
      messages.push({
        id: `motivation-reminder-${Date.now()}`,
        type: 'reminder',
        message: "We miss you! 🌟 Your fitness journey is waiting - even 5 minutes of activity can restart your momentum!",
        context: 'inactivity',
        priority: 'high',
        sentiment: 'motivating',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    }

    // Check for achievements
    categories.forEach(category => {
      const todayLog = recentLogs.find(log => 
        log.categoryId === category.id && 
        log.date === new Date().toISOString().split('T')[0]
      );

      if (todayLog && todayLog.value >= category.dailyTarget) {
        messages.push({
          id: `achievement-${category.id}-${Date.now()}`,
          type: 'achievement',
          message: `🎉 Goal achieved! You hit your ${category.name} target of ${category.dailyTarget} ${category.unit}!`,
          context: category.name,
          priority: 'high',
          sentiment: 'positive',
          created_at: new Date().toISOString()
        });
      }
    });

    // Generate personalized tips based on user profile
    const personalizedTip = this.generatePersonalizedTip(context);
    if (personalizedTip) {
      messages.push(personalizedTip);
    }

    // Add challenge if user is doing well
    if (recentActivity.length >= 2) {
      const challengeMessage = this.motivationalMessages.challenge[Math.floor(Math.random() * this.motivationalMessages.challenge.length)];
      messages.push({
        id: `challenge-${Date.now()}`,
        type: 'challenge',
        message: challengeMessage,
        context: 'performance',
        priority: 'medium',
        sentiment: 'motivating',
        created_at: new Date().toISOString()
      });
    }

    return messages.slice(0, 5); // Limit to 5 messages
  }

  private generatePersonalizedTip(context: MotivationContext): MotivationMessage | null {
    const { userProfile, recentLogs, categories } = context;

    if (!userProfile || !recentLogs || !categories) return null;

    let tip = '';
    let context_name = 'general';

    // Tips based on fitness goal
    if (userProfile.fitnessGoal === 'weight_loss') {
      tip = "💡 Pro tip: Combine cardio with strength training to maximize calorie burn and preserve muscle mass!";
      context_name = 'weight_loss';
    } else if (userProfile.fitnessGoal === 'muscle_gain') {
      tip = "💪 Remember: Rest days are growth days! Your muscles need recovery time to get stronger.";
      context_name = 'muscle_gain';
    } else if (userProfile.fitnessGoal === 'endurance') {
      tip = "🏃‍♀️ Endurance tip: Gradually increase your training duration by 10% each week to avoid injury.";
      context_name = 'endurance';
    } else {
      tip = "🌟 Consistency is key! Small daily actions compound into massive results over time.";
    }

    return {
      id: `tip-${Date.now()}`,
      type: 'tip',
      message: tip,
      context: context_name,
      priority: 'medium',
      sentiment: 'supportive',
      created_at: new Date().toISOString()
    };
  }

  generateProgressInsights(context: MotivationContext): ProgressInsight[] {
    return this.analyzeProgress(context);
  }

  generateGoalRecommendations(context: MotivationContext): GoalRecommendation[] {
    return this.generateGoalRecommendations(context);
  }
}

export const motivationEngine = new MotivationEngine();
