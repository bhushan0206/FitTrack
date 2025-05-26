import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Calendar, Zap } from 'lucide-react';
import { useFitnessData } from '@/hooks/useFitnessData';

const FitnessInsights = () => {
  const { logs, categories } = useFitnessData();
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    generateInsights();
  }, [logs, categories]);

  const generateInsights = () => {
    const newInsights = [];

    // 1. Streak Analysis
    categories.forEach(category => {
      const streak = calculateStreak(logs, category);
      if (streak >= 7) {
        newInsights.push({
          type: 'achievement',
          icon: '🔥',
          title: `${streak}-day streak!`,
          description: `Amazing consistency with ${category.name}`,
          priority: 'high'
        });
      }
    });

    // 2. Improvement Trends
    categories.forEach(category => {
      const trend = calculateTrend(logs, category);
      if (trend.percentage > 20) {
        newInsights.push({
          type: 'improvement',
          icon: '📈',
          title: `${category.name} improving`,
          description: `${trend.percentage}% increase this week`,
          priority: 'medium'
        });
      }
    });

    // 3. Goal Completions
    const todayCompletions = getTodayCompletions();
    if (todayCompletions.length > 0) {
      newInsights.push({
        type: 'success',
        icon: '✅',
        title: `${todayCompletions.length} goals completed today`,
        description: 'Great job staying on track!',
        priority: 'medium'
      });
    }

    // 4. Recommendations
    const recommendations = generateRecommendations();
    newInsights.push(...recommendations);

    setInsights(newInsights);
  };

  const calculateStreak = (logs, category) => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => 
        log.date === dateStr && log.categoryId === category.id
      );
      const dayTotal = dayLogs.reduce((sum, log) => sum + log.value, 0);
      
      if (dayTotal >= category.dailyTarget) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateTrend = (logs, category) => {
    const thisWeek = getWeekData(logs, category, 0);
    const lastWeek = getWeekData(logs, category, 1);
    
    const thisWeekAvg = thisWeek.reduce((sum, val) => sum + val, 0) / 7;
    const lastWeekAvg = lastWeek.reduce((sum, val) => sum + val, 0) / 7;
    
    const percentage = lastWeekAvg > 0 ? 
      ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 : 0;
    
    return { percentage: Math.round(percentage), thisWeekAvg, lastWeekAvg };
  };

  const getWeekData = (logs, category, weeksAgo) => {
    const weekData = Array(7).fill(0);
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i - (weeksAgo * 7));
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => 
        log.date === dateStr && log.categoryId === category.id
      );
      weekData[6 - i] = dayLogs.reduce((sum, log) => sum + log.value, 0);
    }
    
    return weekData;
  };

  const getTodayCompletions = () => {
    const today = new Date().toISOString().split('T')[0];
    return categories.filter(category => {
      const todayLogs = logs.filter(log => 
        log.date === today && log.categoryId === category.id
      );
      const total = todayLogs.reduce((sum, log) => sum + log.value, 0);
      return total >= category.dailyTarget;
    });
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    // Find categories that are consistently under-performed
    categories.forEach(category => {
      const last7DaysData = getWeekData(logs, category, 0);
      const avgCompletion = last7DaysData.reduce((sum, val) => sum + val, 0) / 7;
      const completionRate = (avgCompletion / category.dailyTarget) * 100;
      
      if (completionRate < 50) {
        recommendations.push({
          type: 'recommendation',
          icon: '💡',
          title: `Focus on ${category.name}`,
          description: `Only ${Math.round(completionRate)}% completion this week`,
          priority: 'low'
        });
      }
    });
    
    return recommendations;
  };

  const InsightCard = ({ insight }) => {
    const priorityColors = {
      high: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
      medium: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
      low: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    };

    return (
      <Card className={`${priorityColors[insight.priority]} transition-all hover:shadow-md`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{insight.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {insight.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {insight.description}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {insight.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Fitness Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600 dark:text-gray-300">
                  Keep logging your activities to get personalized insights!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessInsights;
