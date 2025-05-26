import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Salad, 
  Flame, 
  Utensils, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Users, 
  ChefHat,
  Apple,
  Beef,
  Wheat,
  Droplet
} from "lucide-react";
import { nutritionEngine } from "@/lib/ai/nutritionEngine";
import { UserProfile, DailyLog, TrackingCategory } from "@/types/fitness";
import { Meal, NutritionRecommendation } from "@/types/nutrition";

interface NutritionRecommendationsProps {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
}

const NutritionRecommendations: React.FC<NutritionRecommendationsProps> = ({
  userProfile,
  recentLogs,
  categories,
}) => {
  const [recommendations, setRecommendations] = useState<NutritionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showMealDetails, setShowMealDetails] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile, recentLogs, categories]);

  const generateRecommendations = () => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('NutritionRecommendations: Starting generation...');
    }
    setLoading(true);
    setRecommendations([]); // Clear existing recommendations
    
    // Add a small delay to show loading state
    setTimeout(() => {
      try {
        console.log('NutritionRecommendations: Generating with context:', {
          hasUserProfile: !!userProfile,
          hasRecentLogs: !!recentLogs,
          hasCategories: !!categories,
          userGoal: userProfile?.fitnessGoal
        });
        
        const context = { 
          userProfile, 
          recentLogs: recentLogs || [], 
          categories: categories || [],
          dietaryPreferences: {
            dietType: 'omnivore' as const,
            allergies: [],
            dislikes: [],
            cookingSkill: 'intermediate' as const,
            mealPrepTime: 30,
            budget: 'medium' as const
          }
        };
        
        const recs = nutritionEngine.generateRecommendations(context);
        console.log('NutritionRecommendations: Generated recommendations:', recs);
        
        if (recs && recs.length > 0) {
          setRecommendations(recs);
          console.log('NutritionRecommendations: Successfully set', recs.length, 'recommendations');
        } else {
          console.warn('NutritionRecommendations: No recommendations generated, using fallback');
          // Set fallback recommendations
          setRecommendations([
            {
              id: 'fallback-1',
              type: 'nutrition_tip',
              title: 'Stay Hydrated',
              description: 'Drinking enough water is crucial for optimal performance',
              confidence_score: 0.90,
              tip: 'Aim for at least 8 glasses of water per day to maintain proper hydration levels.',
              reasoning: 'Hydration is essential for all fitness goals and overall health.',
              priority: "medium",
              created_at: new Date().toISOString()
            },
            {
              id: 'fallback-2',
              type: 'nutrition_tip',
              title: 'Eat Protein with Every Meal',
              description: 'Protein helps with muscle maintenance and satiety',
              confidence_score: 0.85,
              tip: 'Include a palm-sized portion of protein (chicken, fish, beans, tofu) at every meal.',
              reasoning: 'Protein supports muscle repair and helps you feel full longer.',
              priority: "medium",
              created_at: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error("NutritionRecommendations: Error generating recommendations:", error);
        // Set fallback recommendations
        setRecommendations([{
          id: 'error-fallback',
          type: 'nutrition_tip',
          title: 'General Health Tip',
          description: 'Basic nutrition advice for everyone',
          confidence_score: 0.90,
          tip: 'Focus on eating whole, unprocessed foods and staying hydrated throughout the day.',
          reasoning: 'These fundamentals support any fitness goal.',
          priority: "medium",
          created_at: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
        console.log('NutritionRecommendations: Generation completed');
      }
    }, 500); // 500ms delay to show loading
  };

  const handleViewMealDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const getMacroIcon = (macro: string) => {
    switch (macro) {
      case 'protein': return <Beef className="w-4 h-4 text-red-600" />;
      case 'carbs': return <Wheat className="w-4 h-4 text-amber-600" />;
      case 'fat': return <Droplet className="w-4 h-4 text-blue-600" />;
      default: return <Apple className="w-4 h-4 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Salad className="w-5 h-5" />
            Generating Nutrition Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col max-h-[600px]">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Salad className="w-5 h-5" />
            AI Nutrition & Meal Plan Suggestions
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Personalized meal plans and nutrition tips based on your goals
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3 min-h-0 px-4 pb-4">
          {recommendations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Salad className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No nutrition suggestions available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete your profile and log some activities to get personalized nutrition advice!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {recommendations.map((rec, idx) => (
                <Card key={rec.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {rec.type === "meal_plan" && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1 text-xs">
                          <Utensils className="w-3 h-3" />
                          Meal Plan
                        </Badge>
                      )}
                      {rec.type === "nutrition_tip" && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1 text-xs">
                          <Sparkles className="w-3 h-3" />
                          Nutrition Tip
                        </Badge>
                      )}
                      {rec.type === "recipe" && (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1 text-xs">
                          <ChefHat className="w-3 h-3" />
                          Recipe
                        </Badge>
                      )}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {Math.round(rec.confidence_score * 100)}% Match
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-base mb-2">{rec.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{rec.description}</p>

                    {rec.type === "meal_plan" && rec.meal_plan && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <div>
                            <Flame className="w-3 h-3 mx-auto mb-1 text-red-600" />
                            <div className="text-sm font-bold">{rec.meal_plan.totalCalories}</div>
                            <div className="text-xs text-gray-500">Calories</div>
                          </div>
                          <div>
                            {getMacroIcon('protein')}
                            <div className="text-sm font-bold">{rec.meal_plan.totalProtein}g</div>
                            <div className="text-xs text-gray-500">Protein</div>
                          </div>
                          <div>
                            {getMacroIcon('carbs')}
                            <div className="text-sm font-bold">{rec.meal_plan.totalCarbs}g</div>
                            <div className="text-xs text-gray-500">Carbs</div>
                          </div>
                          <div>
                            {getMacroIcon('fat')}
                            <div className="text-sm font-bold">{rec.meal_plan.totalFat}g</div>
                            <div className="text-xs text-gray-500">Fat</div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Today's Meals ({rec.meal_plan.meals.length}):
                          </div>
                          <div className="grid grid-cols-2 gap-1 max-h-16 overflow-y-auto">
                            {rec.meal_plan.meals.map((meal) => (
                              <Button
                                key={meal.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewMealDetails(meal)}
                                className="justify-start h-auto p-2 text-xs"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-xs truncate">{meal.name}</div>
                                  <div className="text-xs text-gray-500">{meal.calories} cal</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {rec.type === "nutrition_tip" && rec.tip && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border-l-4 border-blue-500">
                        <p className="text-blue-700 dark:text-blue-300 text-sm font-medium line-clamp-3">{rec.tip}</p>
                      </div>
                    )}

                    {rec.type === "recipe" && rec.recipe && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                          <div className="text-center">
                            <Clock className="w-3 h-3 mx-auto mb-1 text-orange-600" />
                            <div className="text-sm font-bold">{rec.recipe.prepTime} min</div>
                            <div className="text-xs text-gray-500">Prep Time</div>
                          </div>
                          <div className="text-center">
                            <Flame className="w-3 h-3 mx-auto mb-1 text-red-600" />
                            <div className="text-sm font-bold">{rec.recipe.calories}</div>
                            <div className="text-xs text-gray-500">Calories</div>
                          </div>
                          <div className="text-center">
                            <Users className="w-3 h-3 mx-auto mb-1 text-blue-600" />
                            <div className="text-sm font-bold">{rec.recipe.servings}</div>
                            <div className="text-xs text-gray-500">Servings</div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMealDetails(rec.recipe!)}
                          className="w-full text-xs"
                        >
                          View Recipe Details
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <strong>Why this suggestion:</strong> <span className="line-clamp-2">{rec.reasoning}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              onClick={generateRecommendations}
              className="w-full flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Nutrition Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meal Details Dialog */}
      <Dialog open={showMealDetails} onOpenChange={setShowMealDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              {selectedMeal?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMeal && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">{selectedMeal.description}</p>

              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <div className="font-bold">{selectedMeal.calories}</div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  {getMacroIcon('protein')}
                  <div className="font-bold">{selectedMeal.protein}g</div>
                  <div className="text-xs text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  {getMacroIcon('carbs')}
                  <div className="font-bold">{selectedMeal.carbs}g</div>
                  <div className="text-xs text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  {getMacroIcon('fat')}
                  <div className="font-bold">{selectedMeal.fat}g</div>
                  <div className="text-xs text-gray-500">Fat</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Ingredients
                </h4>
                <div className="space-y-2">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ingredient.amount} {ingredient.unit} ({ingredient.calories} cal)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Instructions
                </h4>
                <ol className="space-y-2">
                  {selectedMeal.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedMeal.prepTime} min prep
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedMeal.servings} serving{selectedMeal.servings > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NutritionRecommendations;
