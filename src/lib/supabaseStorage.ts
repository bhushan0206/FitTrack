import { supabaseAdmin } from './supabaseAdmin';
import { supabase } from "./supabase";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Add a new category
export const addCategory = async (
  category: TrackingCategory,
  userId: string
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    // Use admin client to bypass RLS
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

    // Return updated profile with new category
    const updatedProfile = await getUserProfile(userId);
    return updatedProfile;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// Get user profile from Supabase
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    // Get user profile info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.warn("Profile not found, creating new one");
    }

    // Use admin client to bypass RLS
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    if (categoriesError) throw categoriesError;

    const { data: logs, error: logsError } = await supabaseAdmin
      .from("logs")
      .select("*")
      .eq("user_id", userId);

    if (logsError) throw logsError;

    // Transform data to match frontend types
    const transformedCategories = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      unit: cat.unit,
      dailyTarget: cat.daily_target,
      color: cat.color,
    }));

    const transformedLogs = (logs || []).map((log) => ({
      id: log.id,
      categoryId: log.category_id,
      date: log.date,
      value: log.value,
      notes: log.notes,
    }));

    return {
      id: userId,
      name: profile?.name || "User",
      categories: transformedCategories,
      logs: transformedLogs,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Initialize user profile in Supabase
export const initializeUserProfile = async (userId: string, userName?: string): Promise<UserProfile | null> => {
  try {
    // Check if user profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      // Get categories for this user
      const { data: categories } = await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("user_id", userId);

      // Get logs for this user
      const { data: logs } = await supabaseAdmin
        .from("logs")
        .select("*")
        .eq("user_id", userId);

      return {
        id: userId,
        name: existingProfile.name || "User",
        categories: categories?.map(mapCategoryFromDB) || [],
        logs: logs?.map(mapLogFromDB) || [],
      };
    }

    // Create default profile with sample categories
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

    // Create profile with admin client
    await supabaseAdmin.from("profiles").insert({
      id: userId,
      name: userName || "User",
    });

    // Create default categories with admin client
    const { data: insertedCategories } = await supabaseAdmin
      .from("categories")
      .insert(defaultCategories)
      .select();

    return {
      id: userId,
      name: userName || "User",
      categories: insertedCategories?.map(mapCategoryFromDB) || [],
      logs: [],
    };
  } catch (error) {
    console.error("Error initializing user profile:", error);
    return null;
  }
};

// Update an existing category
export const updateCategory = async (
  category: TrackingCategory,
  userId: string
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
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", userId);

    if (error) throw error;
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error deleting category:", error);
    return null;
  }
};

// Add a new log entry
export const addLogEntry = async (
  log: DailyLog,
  userId: string
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabaseAdmin
      .from("logs")
      .insert({
        id: log.id,
        category_id: log.categoryId,
        user_id: userId,
        date: log.date,
        value: log.value,
        notes: log.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error adding log entry:", error);
    return null;
  }
};

// Update an existing log entry
export const updateLogEntry = async (
  log: DailyLog,
  userId: string
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabaseAdmin
      .from("logs")
      .update({
        category_id: log.categoryId,
        date: log.date,
        value: log.value,
        notes: log.notes,
      })
      .eq("id", log.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating log entry:", error);
    return null;
  }
};

// Delete a log entry
export const deleteLogEntry = async (
  logId: string,
  userId: string
): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabaseAdmin
      .from("logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);

    if (error) throw error;
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error deleting log entry:", error);
    return null;
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
