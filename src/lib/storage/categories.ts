import { supabaseAdmin } from '../supabaseAdmin';
import { TrackingCategory, UserProfile } from "@/types/fitness";
import { generateId, mapCategoryFromDB } from './utils';

// Add a new category
export const addCategory = async (
  category: TrackingCategory,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        id: category.id,
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return await getProfile(userId);
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// Update an existing category
export const updateCategory = async (
  category: TrackingCategory,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
      })
      .eq("id", category.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return await getProfile(userId);
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (
  categoryId: string,
  userId: string,
  getProfile: (uid: string) => Promise<UserProfile | null>
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", userId);

    if (error) throw error;
    return await getProfile(userId);
  } catch (error) {
    console.error("Error deleting category:", error);
    return null;
  }
};

// Create default categories for a new user
export const createDefaultCategories = async (userId: string): Promise<TrackingCategory[]> => {
  const defaultCategories = [
    {
      id: generateId(),
      name: "Steps",
      unit: "steps",
      daily_target: 10000,
      color: "#3b82f6",
      user_id: userId,
    },
    {
      id: generateId(),
      name: "Water",
      unit: "glasses",
      daily_target: 8,
      color: "#06b6d4",
      user_id: userId,
    },
    {
      id: generateId(),
      name: "Workout",
      unit: "minutes",
      daily_target: 30,
      color: "#10b981",
      user_id: userId,
    },
  ];

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert(defaultCategories)
      .select();
    
    if (error) throw error;
    return data?.map(mapCategoryFromDB) || [];
  } catch (error) {
    console.error("Error creating default categories:", error);
    return [];
  }
};
