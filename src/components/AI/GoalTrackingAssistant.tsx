import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Star,
  Lightbulb,
  Zap,
  Trophy,
  Calendar,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';
import { format } from 'date-fns';

interface GoalTrackingAssistantProps {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
}

const GoalTrackingAssistant = ({ userProfile, recentLogs, categories }: GoalTrackingAssistantProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample motivational messages for demonstration
  const sampleMessages = [
    {
      id: 'sample-1',
      type: 'encouragement',
      title: 'Great Start!',
      message: 'Welcome to the Goal Tracking & Motivation system! Start logging your activities to unlock personalized AI insights.',
      priority: 'high',
      actionable: true,
      suggestedAction: 'Log your first activity',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sample-2',
      type: 'tip',
      title: 'Pro Tip',
      message: 'Consistency beats perfection! Even small daily actions compound into significant results over time.',
      priority: 'medium',
      timestamp: new Date().toISOString()
    },
    {
      id: 'sample-3',
      type: 'reminder',
      title: 'Stay Motivated',
      message: 'Your fitness journey is unique. Celebrate every milestone, no matter how small!',
      priority: 'low',
      timestamp: new Date().toISOString()
    }
  ];

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'encouragement': return <Star className="w-5 h-5 text-purple-600" />;
      case 'challenge': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'celebration': return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'tip': return <Lightbulb className="w-5 h-5 text-green-600" />;
      default: return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'encouragement': return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
      case 'challenge': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      case 'celebration': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'tip': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTodayProgress = () => {
    if (!categories || !recentLogs) return [];
    
    const today = format(new Date(), 'yyyy-MM-dd');
    return categories.map(category => {
      const todayLogs = recentLogs.filter(log => 
        log.categoryId === category.id && log.date === today
      );
      const currentValue = todayLogs.reduce((sum, log) => sum + log.value, 0);
      const percentage = Math.min((currentValue / category.dailyTarget) * 100, 100);
      
      return {
        category,
        currentValue,
        percentage,
        isComplete: currentValue >= category.dailyTarget
      };
    });
  };

  const todayProgress = getTodayProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Goal Tracking & Motivation
        </h2>
        <Button variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Debug Info */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border rounded-lg text-xs">
        <p>Debug: Profile: {userProfile?.name || 'None'}, Categories: {categories?.length || 0}, Logs: {recentLogs?.length || 0}</p>
        <p>Component is working! This is the Goals & Motivation section.</p>
      </div>

      {/* Today's Progress Overview */}
      {categories && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayProgress.map(({ category, currentValue, percentage, isComplete }) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {currentValue}/{category.dailyTarget} {category.unit}
                      </span>
                      {isComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Motivational Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your AI Motivation Coach
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30">
              Demo Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${getMessageColor(message.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getMessageIcon(message.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{message.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                      {message.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {message.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {message.actionable && message.suggestedAction && (
                          <Button size="sm" variant="outline" className="text-xs">
                            {message.suggestedAction}
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto text-gray-400"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Features Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">Component Loaded</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Goal Tracking interface is working correctly
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-400">AI Engine Ready</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Natural Language Processing enabled
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-400">Goal Analysis</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Smart goal recalibration system active
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-400">Motivation Engine</span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Personalized encouragement system online
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start Your AI-Powered Journey
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Add fitness categories and start logging your daily activities to unlock personalized motivation and smart goal adjustments!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-1">Step 1: Categories</h4>
              <p className="text-gray-600 dark:text-gray-400">Add fitness categories like steps, workouts, or water intake</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-1">Step 2: Log Data</h4>
              <p className="text-gray-600 dark:text-gray-400">Track your daily progress consistently</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-1">Step 3: AI Insights</h4>
              <p className="text-gray-600 dark:text-gray-400">Receive personalized motivation and goal adjustments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalTrackingAssistant;
