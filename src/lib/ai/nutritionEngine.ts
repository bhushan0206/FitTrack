import { NutritionRecommendation, MealPlan, Meal, DietaryPreferences } from '@/types/nutrition';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';

interface NutritionContext {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
  dietaryPreferences?: DietaryPreferences;
}

class NutritionEngine {
  generateRecommendations(context: NutritionContext): NutritionRecommendation[] {
    console.log('NutritionEngine: Starting recommendation generation');
    console.log('NutritionEngine: Context received:', {
      hasUserProfile: !!context.userProfile,
      userGoal: context.userProfile?.fitnessGoal,
      hasRecentLogs: !!(context.recentLogs && context.recentLogs.length > 0),
      hasCategories: !!(context.categories && context.categories.length > 0),
      hasDietaryPrefs: !!context.dietaryPreferences
    });
    
    const recommendations: NutritionRecommendation[] = [];
    
    try {
      // Always generate at least some basic recommendations
      console.log('NutritionEngine: Generating basic meal plan...');
      const basicMealPlan = this.generateBasicMealPlan(context);
      recommendations.push({
        id: `meal-plan-${Date.now()}`,
        type: 'meal_plan',
        title: 'Balanced Daily Meal Plan',
        description: 'A well-rounded meal plan designed for your fitness goals',
        confidence_score: 0.85,
        meal_plan: basicMealPlan,
        reasoning: 'Generated based on balanced nutrition principles and your fitness goals.',
        priority: 'high',
        created_at: new Date().toISOString()
      });

      console.log('NutritionEngine: Generating nutrition tips...');
      // Add nutrition tips
      const tips = this.generateNutritionTips(context);
      tips.forEach((tip, index) => {
        recommendations.push({
          id: `tip-${Date.now()}-${index}`,
          type: 'nutrition_tip',
          title: tip.title,
          description: tip.description,
          confidence_score: 0.75,
          tip: tip.content,
          reasoning: tip.reasoning,
          priority: 'medium',
          created_at: new Date().toISOString()
        });
      });

      console.log('NutritionEngine: Generating featured recipe...');
      // Add a featured recipe
      const recipe = this.generateFeaturedRecipe(context);
      recommendations.push({
        id: `recipe-${Date.now()}`,
        type: 'recipe',
        title: recipe.name,
        description: recipe.description,
        confidence_score: 0.80,
        recipe: recipe,
        reasoning: 'Perfect for your current fitness goals and easy to prepare.',
        priority: 'medium',
        created_at: new Date().toISOString()
      });

      console.log('NutritionEngine: Successfully generated', recommendations.length, 'recommendations');
      return recommendations;
    } catch (error) {
      console.error('NutritionEngine: Error in generateRecommendations:', error);
      // Return at least one fallback recommendation
      return [{
        id: 'fallback-1',
        type: 'nutrition_tip',
        title: 'Stay Hydrated',
        description: 'Drinking enough water is crucial for optimal performance',
        confidence_score: 0.90,
        tip: 'Aim for at least 8 glasses of water per day to maintain proper hydration levels.',
        reasoning: 'Hydration is essential for all fitness goals and overall health.',
        priority: 'high',
        created_at: new Date().toISOString()
      }];
    }
  }

  private generateBasicMealPlan(context: NutritionContext): MealPlan {
    console.log('NutritionEngine: Creating basic meal plan...');
    
    const goal = context.userProfile?.fitnessGoal || 'general_health';
    const weight = context.userProfile?.weight || 70;
    
    // Calculate basic calorie needs
    let targetCalories = Math.round(weight * 25); // Basic estimate
    if (goal === 'weight_loss') targetCalories = Math.round(weight * 22);
    if (goal === 'muscle_gain') targetCalories = Math.round(weight * 28);
    
    console.log('NutritionEngine: Target calories calculated:', targetCalories, 'for goal:', goal);

    const meals: Meal[] = [
      {
        id: 'breakfast-1',
        type: 'breakfast',
        name: 'Power Breakfast Bowl',
        description: 'Protein-rich breakfast to fuel your morning',
        calories: Math.round(targetCalories * 0.25),
        protein: Math.round(targetCalories * 0.25 * 0.25 / 4), // 25% protein
        carbs: Math.round(targetCalories * 0.25 * 0.45 / 4), // 45% carbs
        fat: Math.round(targetCalories * 0.25 * 0.30 / 9), // 30% fat
        fiber: 8,
        ingredients: [
          { name: 'Greek Yogurt', amount: 150, unit: 'g', calories: 100, protein: 15, carbs: 6, fat: 0 },
          { name: 'Berries', amount: 100, unit: 'g', calories: 50, protein: 1, carbs: 12, fat: 0 },
          { name: 'Granola', amount: 30, unit: 'g', calories: 130, protein: 4, carbs: 20, fat: 5 },
          { name: 'Almonds', amount: 20, unit: 'g', calories: 120, protein: 4, carbs: 2, fat: 10 }
        ],
        instructions: [
          'Place Greek yogurt in a bowl',
          'Top with fresh berries',
          'Sprinkle granola over the berries',
          'Add sliced almonds',
          'Serve immediately'
        ],
        prepTime: 5,
        servings: 1
      },
      {
        id: 'lunch-1',
        type: 'lunch',
        name: 'Grilled Chicken Salad',
        description: 'Light but satisfying lunch with lean protein',
        calories: Math.round(targetCalories * 0.30),
        protein: Math.round(targetCalories * 0.30 * 0.30 / 4),
        carbs: Math.round(targetCalories * 0.30 * 0.40 / 4),
        fat: Math.round(targetCalories * 0.30 * 0.30 / 9),
        fiber: 6,
        ingredients: [
          { name: 'Chicken Breast', amount: 120, unit: 'g', calories: 200, protein: 37, carbs: 0, fat: 4 },
          { name: 'Mixed Greens', amount: 100, unit: 'g', calories: 20, protein: 2, carbs: 4, fat: 0 },
          { name: 'Cherry Tomatoes', amount: 100, unit: 'g', calories: 18, protein: 1, carbs: 4, fat: 0 },
          { name: 'Olive Oil', amount: 10, unit: 'ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
        ],
        instructions: [
          'Season and grill chicken breast until cooked through',
          'Slice chicken into strips',
          'Combine mixed greens and cherry tomatoes in bowl',
          'Top with sliced chicken',
          'Drizzle with olive oil and season to taste'
        ],
        prepTime: 15,
        servings: 1
      },
      {
        id: 'dinner-1',
        type: 'dinner',
        name: 'Salmon with Quinoa',
        description: 'Omega-3 rich dinner with complete protein',
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(targetCalories * 0.35 * 0.28 / 4),
        carbs: Math.round(targetCalories * 0.35 * 0.42 / 4),
        fat: Math.round(targetCalories * 0.35 * 0.30 / 9),
        fiber: 4,
        ingredients: [
          { name: 'Salmon Fillet', amount: 150, unit: 'g', calories: 250, protein: 35, carbs: 0, fat: 12 },
          { name: 'Quinoa', amount: 80, unit: 'g dry', calories: 290, protein: 11, carbs: 52, fat: 5 },
          { name: 'Broccoli', amount: 150, unit: 'g', calories: 40, protein: 4, carbs: 8, fat: 0 },
          { name: 'Lemon', amount: 1, unit: 'piece', calories: 5, protein: 0, carbs: 1, fat: 0 }
        ],
        instructions: [
          'Cook quinoa according to package instructions',
          'Steam broccoli until tender-crisp',
          'Season salmon with salt, pepper, and lemon',
          'Pan-sear salmon for 4-5 minutes each side',
          'Serve salmon over quinoa with broccoli on the side'
        ],
        prepTime: 25,
        servings: 1
      },
      {
        id: 'snack-1',
        type: 'snack',
        name: 'Protein Smoothie',
        description: 'Quick post-workout recovery drink',
        calories: Math.round(targetCalories * 0.10),
        protein: Math.round(targetCalories * 0.10 * 0.40 / 4),
        carbs: Math.round(targetCalories * 0.10 * 0.50 / 4),
        fat: Math.round(targetCalories * 0.10 * 0.10 / 9),
        fiber: 3,
        ingredients: [
          { name: 'Protein Powder', amount: 30, unit: 'g', calories: 120, protein: 24, carbs: 2, fat: 1 },
          { name: 'Banana', amount: 100, unit: 'g', calories: 90, protein: 1, carbs: 23, fat: 0 },
          { name: 'Almond Milk', amount: 250, unit: 'ml', calories: 40, protein: 2, carbs: 2, fat: 3 }
        ],
        instructions: [
          'Add all ingredients to blender',
          'Blend until smooth',
          'Serve immediately'
        ],
        prepTime: 3,
        servings: 1
      }
    ];

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    const mealPlan = {
      id: `plan-${Date.now()}`,
      name: goal === 'weight_loss' ? 'Weight Loss Meal Plan' : 
            goal === 'muscle_gain' ? 'Muscle Building Meal Plan' : 
            'Balanced Nutrition Plan',
      description: `Customized meal plan for your ${goal.replace('_', ' ')} goals`,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      meals,
      prepTime: meals.reduce((sum, meal) => sum + meal.prepTime, 0),
      difficulty: 'intermediate' as const,
      dietaryRestrictions: context.dietaryPreferences?.allergies || [],
      createdAt: new Date().toISOString()
    };

    console.log('NutritionEngine: Meal plan created:', mealPlan.name, 'with', meals.length, 'meals');
    return mealPlan;
  }

  private generateNutritionTips(context: NutritionContext) {
    console.log('NutritionEngine: Generating nutrition tips...');
    
    const goal = context.userProfile?.fitnessGoal || 'general_health';
    
    const allTips = [
      {
        title: 'Hydration First',
        description: 'Start your day with water',
        content: 'Drink a large glass of water as soon as you wake up to kickstart your metabolism and rehydrate after sleep.',
        reasoning: 'Proper hydration improves energy levels and supports all bodily functions.'
      },
      {
        title: 'Protein at Every Meal',
        description: 'Include protein in each meal for sustained energy',
        content: 'Aim to include a palm-sized portion of protein (chicken, fish, beans, tofu) at every meal to maintain muscle mass and feel fuller longer.',
        reasoning: 'Protein helps with muscle repair, satiety, and maintaining stable blood sugar levels.'
      }
    ];

    // Add goal-specific tips
    if (goal === 'weight_loss') {
      allTips.push({
        title: 'Mindful Portions',
        description: 'Control portions without feeling deprived',
        content: 'Use smaller plates and eat slowly to naturally reduce portion sizes while still feeling satisfied.',
        reasoning: 'Portion control is key for weight loss, and smaller plates create the illusion of larger portions.'
      });
    } else if (goal === 'muscle_gain') {
      allTips.push({
        title: 'Post-Workout Nutrition',
        description: 'Fuel your recovery properly',
        content: 'Consume protein and carbohydrates within 30 minutes after your workout to optimize muscle recovery and growth.',
        reasoning: 'The post-workout window is crucial for muscle protein synthesis and glycogen replenishment.'
      });
    }

    console.log('NutritionEngine: Generated', allTips.length, 'nutrition tips');
    return allTips.slice(0, 2); // Return 2 tips
  }

  private generateFeaturedRecipe(context: NutritionContext): Meal {
    console.log('NutritionEngine: Creating featured recipe...');
    
    const goal = context.userProfile?.fitnessGoal || 'general_health';
    
    // Default balanced recipe
    const recipe = {
      id: 'recipe-balanced',
      type: 'lunch' as const,
      name: 'Balanced Buddha Bowl',
      description: 'Perfectly balanced meal with all macronutrients',
      calories: 450,
      protein: 25,
      carbs: 50,
      fat: 16,
      fiber: 10,
      ingredients: [
        { name: 'Tofu', amount: 100, unit: 'g', calories: 150, protein: 15, carbs: 3, fat: 8 },
        { name: 'Sweet Potato', amount: 150, unit: 'g', calories: 130, protein: 2, carbs: 30, fat: 0 },
        { name: 'Spinach', amount: 100, unit: 'g', calories: 25, protein: 3, carbs: 4, fat: 0 },
        { name: 'Chickpeas', amount: 80, unit: 'g', calories: 120, protein: 6, carbs: 18, fat: 2 },
        { name: 'Tahini', amount: 15, unit: 'g', calories: 90, protein: 3, carbs: 3, fat: 8 }
      ],
      instructions: [
        'Roast cubed sweet potato until tender',
        'Pan-fry seasoned tofu until crispy',
        'Sauté spinach until wilted',
        'Warm chickpeas with spices',
        'Arrange all components in bowl and drizzle with tahini'
      ],
      prepTime: 25,
      servings: 1
    };

    console.log('NutritionEngine: Featured recipe created:', recipe.name);
    return recipe;
  }
}

export const nutritionEngine = new NutritionEngine();
