import { NutritionChatMessage, MealPlan, Meal, DietaryPreferences, NutritionAnalysis } from '@/types/nutrition';
import { UserProfile } from '@/types/fitness';

interface NutritionContext {
  userProfile?: UserProfile;
  dietaryPreferences?: DietaryPreferences;
  recentMeals?: Meal[];
  nutritionGoals?: {
    dailyCalories?: number;
    proteinTarget?: number;
    carbTarget?: number;
    fatTarget?: number;
  };
}

class NutritionChatService {
  async generateResponse(
    message: string,
    context: NutritionContext
  ): Promise<string> {
    try {
      console.log('Nutrition Chat: Processing message:', message);
      
      const lowerMessage = message.toLowerCase();
      
      // Handle different types of nutrition queries
      if (lowerMessage.includes('meal plan') || lowerMessage.includes('meals')) {
        return this.generateMealPlanResponse(context);
      }
      
      if (lowerMessage.includes('calories') || lowerMessage.includes('nutrition')) {
        return this.generateNutritionAdvice(context);
      }
      
      if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
        return this.generateRecipeResponse(context);
      }
      
      // Default nutrition response
      return this.generateGeneralNutritionResponse(context);
    } catch (error) {
      console.error('Error in nutrition chat service:', error);
      return "I'm having trouble processing your nutrition question right now. Please try again.";
    }
  }

  private generateMealPlanResponse(context: NutritionContext): string {
    const goal = context.userProfile?.fitnessGoal;
    
    if (goal === 'weight_loss') {
      return "For weight loss, I recommend a balanced meal plan with a moderate caloric deficit. Focus on lean proteins, vegetables, and whole grains. Would you like me to suggest specific meals?";
    }
    
    if (goal === 'muscle_gain') {
      return "For muscle building, you'll need adequate protein and calories. I suggest 5-6 smaller meals throughout the day with protein at each meal. Shall I create a detailed meal plan?";
    }
    
    return "I can help you create a personalized meal plan based on your goals. What specific dietary preferences do you have?";
  }

  private generateNutritionAdvice(context: NutritionContext): string {
    const calories = context.nutritionGoals?.dailyCalories;
    
    if (calories) {
      return `Based on your ${calories} calorie goal, I recommend focusing on nutrient-dense foods. Aim for 25-30% protein, 40-45% carbohydrates, and 25-30% healthy fats.`;
    }
    
    return "Good nutrition is key to reaching your fitness goals. Focus on whole foods, adequate protein, and staying hydrated. What specific nutrition question do you have?";
  }

  private generateRecipeResponse(context: NutritionContext): string {
    const preferences = context.dietaryPreferences;
    
    if (preferences?.dietType === 'vegetarian') {
      return "I have some great vegetarian recipes that are high in protein! Try a quinoa Buddha bowl with chickpeas, or a lentil and vegetable curry. Would you like the full recipe?";
    }
    
    return "I can suggest healthy recipes based on your goals! Are you looking for something quick, high-protein, or low-calorie?";
  }

  private generateGeneralNutritionResponse(context: NutritionContext): string {
    return "I'm here to help with all your nutrition questions! I can assist with meal planning, recipe suggestions, calorie counting, and nutrition advice tailored to your fitness goals. What would you like to know?";
  }

  async analyzeFood(foodDescription: string): Promise<NutritionAnalysis> {
    // Simplified food analysis - in a real app, this would use a food database API
    const baseAnalysis: NutritionAnalysis = {
      calories: 200,
      protein: 15,
      carbs: 25,
      fat: 8,
      fiber: 5,
      sugar: 10,
      sodium: 300
    };
    
    return baseAnalysis;
  }
}

export const nutritionChatService = new NutritionChatService();