import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Apple, Droplets, Zap, Heart, Target } from 'lucide-react';
import { UserProfile, TrackingCategory, DailyLog } from '@/types/fitness';

interface NutritionAdviceProps {
  profile: UserProfile | null;
  categories: TrackingCategory[];
  logs: DailyLog[];
}

const NutritionAdvice: React.FC<NutritionAdviceProps> = ({ 
  profile, 
  categories, 
  logs 
}) => {
  // Generate nutrition recommendations based on user data
  const generateNutritionRecommendations = () => {
    const recommendations = [];
    
    // Calculate BMI if height and weight are available
    let bmi: number | null = null;
    if (profile?.weight && profile?.height) {
      bmi = profile.weight / ((profile.height / 100) ** 2);
    }
    
    // Basic recommendations based on fitness goal
    if (profile?.fitnessGoal) {
      switch (profile.fitnessGoal) {
        case 'lose_weight':
          recommendations.push({
            title: 'Caloric Deficit',
            description: 'Aim for a moderate caloric deficit of 300-500 calories below maintenance',
            icon: <Target className="w-5 h-5" />,
            priority: 'high',
            category: 'calories'
          });
          recommendations.push({
            title: 'Protein Intake',
            description: 'Consume 1.2-1.6g protein per kg body weight to preserve muscle',
            icon: <Zap className="w-5 h-5" />,
            priority: 'high',
            category: 'protein'
          });
          break;
          
        case 'build_muscle':
          recommendations.push({
            title: 'Protein Priority',
            description: 'Aim for 1.6-2.2g protein per kg body weight for muscle growth',
            icon: <Zap className="w-5 h-5" />,
            priority: 'high',
            category: 'protein'
          });
          recommendations.push({
            title: 'Caloric Surplus',
            description: 'Maintain a slight caloric surplus of 200-300 calories above maintenance',
            icon: <Target className="w-5 h-5" />,
            priority: 'medium',
            category: 'calories'
          });
          break;
          
        case 'improve_endurance':
          recommendations.push({
            title: 'Carbohydrate Focus',
            description: 'Prioritize complex carbs for sustained energy (45-65% of calories)',
            icon: <Apple className="w-5 h-5" />,
            priority: 'high',
            category: 'carbs'
          });
          recommendations.push({
            title: 'Hydration',
            description: 'Increase water intake to 35-40ml per kg body weight',
            icon: <Droplets className="w-5 h-5" />,
            priority: 'high',
            category: 'hydration'
          });
          break;
          
        default:
          recommendations.push({
            title: 'Balanced Nutrition',
            description: 'Follow a balanced diet with adequate protein, carbs, and healthy fats',
            icon: <Heart className="w-5 h-5" />,
            priority: 'medium',
            category: 'general'
          });
      }
    }
    
    // BMI-based recommendations
    if (bmi) {
      if (bmi < 18.5) {
        recommendations.push({
          title: 'Weight Gain Support',
          description: 'Focus on nutrient-dense, calorie-rich foods to reach healthy weight',
          icon: <Target className="w-5 h-5" />,
          priority: 'high',
          category: 'calories'
        });
      } else if (bmi > 25) {
        recommendations.push({
          title: 'Weight Management',
          description: 'Focus on portion control and nutrient-dense, lower-calorie foods',
          icon: <Apple className="w-5 h-5" />,
          priority: 'medium',
          category: 'calories'
        });
      }
    }
    
    // Analyze nutrition-related categories
    const nutritionCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes('water') || 
      cat.name.toLowerCase().includes('protein') ||
      cat.name.toLowerCase().includes('calorie') ||
      cat.name.toLowerCase().includes('meal') ||
      cat.name.toLowerCase().includes('vitamin')
    );
    
    // Check recent nutrition tracking
    const recentLogs = logs.filter(log => 
      new Date(log.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (nutritionCategories.length === 0) {
      recommendations.push({
        title: 'Start Nutrition Tracking',
        description: 'Add nutrition categories like water intake, protein, or calories to track your diet',
        icon: <Apple className="w-5 h-5" />,
        priority: 'medium',
        category: 'tracking'
      });
    }
    
    // Check hydration tracking
    const waterCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('water') || cat.name.toLowerCase().includes('hydration')
    );
    
    if (!waterCategory) {
      recommendations.push({
        title: 'Hydration Tracking',
        description: 'Add water intake tracking - aim for 8-10 glasses (2-2.5L) daily',
        icon: <Droplets className="w-5 h-5" />,
        priority: 'medium',
        category: 'hydration'
      });
    }
    
    return recommendations;
  };

  const recommendations = generateNutritionRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protein': return 'text-red-600 dark:text-red-400';
      case 'carbs': return 'text-orange-600 dark:text-orange-400';
      case 'calories': return 'text-purple-600 dark:text-purple-400';
      case 'hydration': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  // Calculate user stats for display
  const userStats = {
    bmi: profile?.weight && profile?.height ? 
      (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : null,
    recommendedProtein: profile?.weight ? 
      `${(profile.weight * 1.4).toFixed(0)}-${(profile.weight * 1.8).toFixed(0)}g` : null,
    recommendedWater: profile?.weight ? 
      `${(profile.weight * 35 / 1000).toFixed(1)}L` : '2-2.5L'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-6 h-6 text-green-600" />
          Nutrition Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Stats */}
        {profile && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {userStats.bmi || 'N/A'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">BMI</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {userStats.recommendedProtein || 'N/A'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Protein/day</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {userStats.recommendedWater}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Water/day</div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Complete your profile to get personalized nutrition recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`mt-1 ${getCategoryColor(rec.category)}`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </h4>
                    <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {profile && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              💡 These recommendations are based on your fitness goal: 
              <span className="font-medium">
                {profile.fitnessGoal ? profile.fitnessGoal.replace('_', ' ') : 'Not set'}
              </span>
              {userStats.bmi && (
                <span> and your BMI of {userStats.bmi}</span>
              )}
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Tips:</h5>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Eat protein with every meal to support muscle maintenance</li>
            <li>• Include colorful vegetables and fruits for micronutrients</li>
            <li>• Stay hydrated throughout the day, especially during workouts</li>
            <li>• Time carbohydrates around your training sessions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionAdvice;
