import { supabaseAdmin } from '../supabaseAdmin';
import { UserProfile } from "@/types/fitness";
import { mapCategoryFromDB, mapLogFromDB } from './utils';

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
    const transformedCategories = (categories || []).map(mapCategoryFromDB);
    const transformedLogs = (logs || []).map(mapLogFromDB);

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

// Create profile in Supabase
export const createUserProfile = async (userId: string, userName?: string): Promise<void> => {
  try {
    await supabaseAdmin.from("profiles").insert({
      id: userId,
      name: userName || "User",
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};
