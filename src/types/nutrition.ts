export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  servings: number;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
  prepTime: number;
  difficulty: 'easy' | 'intermediate' | 'advanced';
  dietaryRestrictions: string[];
  createdAt: string;
}

export interface DietaryPreferences {
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
  allergies: string[];
  dislikes: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  mealPrepTime: number; // minutes willing to spend
  budget: 'low' | 'medium' | 'high';
}

export interface NutritionRecommendation {
  id: string;
  type: 'meal_plan' | 'nutrition_tip' | 'recipe';
  title: string;
  description: string;
  confidence_score: number;
  meal_plan?: MealPlan;
  tip?: string;
  recipe?: Meal;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface NutritionChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    source?: string;
    references?: string[];
  };
}

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  micronutrients?: {
    [key: string]: number;
  };
}
