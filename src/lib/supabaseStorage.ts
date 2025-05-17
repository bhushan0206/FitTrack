import { supabase } from "./supabase";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import { getCurrentUser } from "./auth";

// Initialize user profile in Supabase
export const initializeUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      // Get categories for this user
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      // Get logs for this user
      const { data: logs } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", user.id);

      return {
        id: user.id,
        name: existingProfile.name || user.email?.split("@")[0] || "User",
        categories: categories?.map(mapCategoryFromDB) || [],
        logs: logs?.map(mapLogFromDB) || [],
      };
    }

    // Create default profile with sample categories
    const defaultCategories = [
      {
        name: "Steps",
        unit: "steps",
        daily_target: 10000,
        color: "#3b82f6",
        user_id: user.id,
      },
      {
        name: "Water",
        unit: "glasses",
        daily_target: 8,
        color: "#06b6d4",
        user_id: user.id,
      },
      {
        name: "Workout",
        unit: "minutes",
        daily_target: 30,
        color: "#10b981",
        user_id: user.id,
      },
    ];

    // Create profile
    await supabase.from("profiles").insert({
      id: user.id,
      name: user.email?.split("@")[0] || "User",
    });

    // Create default categories
    const { data: insertedCategories } = await supabase
      .from("categories")
      .insert(defaultCategories)
      .select();

    return {
      id: user.id,
      name: user.email?.split("@")[0] || "User",
      categories: insertedCategories?.map(mapCategoryFromDB) || [],
      logs: [],
    };
  } catch (error) {
    console.error("Error initializing user profile:", error);
    return null;
  }
};

// Get user profile from Supabase
export const getUserProfile = async (): Promise<UserProfile | null> => {
  return await initializeUserProfile();
};

// Add a new category
export const addCategory = async (
  category: TrackingCategory,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data } = await supabase
      .from("categories")
      .insert({
        id: category.id,
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
        user_id: user.id,
      })
      .select();

    return await getUserProfile();
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// Update an existing category
export const updateCategory = async (
  category: TrackingCategory,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    await supabase
      .from("categories")
      .update({
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
      })
      .eq("id", category.id)
      .eq("user_id", user.id);

    return await getUserProfile();
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (
  categoryId: string,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Delete all logs for this category first
    await supabase
      .from("logs")
      .delete()
      .eq("category_id", categoryId)
      .eq("user_id", user.id);

    // Then delete the category
    await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", user.id);

    return await getUserProfile();
  } catch (error) {
    console.error("Error deleting category:", error);
    return null;
  }
};

// Add a new log entry
export const addLogEntry = async (
  log: DailyLog,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    await supabase.from("logs").insert({
      id: log.id,
      category_id: log.categoryId,
      date: log.date,
      value: log.value,
      notes: log.notes,
      user_id: user.id,
    });

    return await getUserProfile();
  } catch (error) {
    console.error("Error adding log entry:", error);
    return null;
  }
};

// Update an existing log entry
export const updateLogEntry = async (
  log: DailyLog,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    await supabase
      .from("logs")
      .update({
        category_id: log.categoryId,
        date: log.date,
        value: log.value,
        notes: log.notes,
      })
      .eq("id", log.id)
      .eq("user_id", user.id);

    return await getUserProfile();
  } catch (error) {
    console.error("Error updating log entry:", error);
    return null;
  }
};

// Delete a log entry
export const deleteLogEntry = async (
  logId: string,
): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    await supabase.from("logs").delete().eq("id", logId).eq("user_id", user.id);

    return await getUserProfile();
  } catch (error) {
    console.error("Error deleting log entry:", error);
    return null;
  }
};

// Get logs for a specific date
export const getLogsByDate = async (date: string): Promise<DailyLog[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data } = await supabase
      .from("logs")
      .select("*")
      .eq("date", date)
      .eq("user_id", user.id);

    return data?.map(mapLogFromDB) || [];
  } catch (error) {
    console.error("Error getting logs by date:", error);
    return [];
  }
};

// Get logs for a specific category
export const getLogsByCategory = async (
  categoryId: string,
): Promise<DailyLog[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data } = await supabase
      .from("logs")
      .select("*")
      .eq("category_id", categoryId)
      .eq("user_id", user.id);

    return data?.map(mapLogFromDB) || [];
  } catch (error) {
    console.error("Error getting logs by category:", error);
    return [];
  }
};

// Helper functions to map between DB and app models
function mapCategoryFromDB(dbCategory: any): TrackingCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    unit: dbCategory.unit,
    dailyTarget: dbCategory.daily_target,
    color: dbCategory.color,
  };
}

function mapLogFromDB(dbLog: any): DailyLog {
  return {
    id: dbLog.id,
    categoryId: dbLog.category_id,
    date: dbLog.date,
    value: dbLog.value,
    notes: dbLog.notes,
  };
}

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
