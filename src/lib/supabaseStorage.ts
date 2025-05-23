import { supabase } from './supabase';
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
    const { data, error } = await supabase
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

// Initialize user profile in Supabase with proper auth handling
export const initializeUserProfile = async (userId: string, userName?: string): Promise<UserProfile | null> => {
  try {
    // Remove the session check since we're using Clerk auth
    // We'll rely on RLS policies or handle auth differently
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
    }

    if (existingProfile) {
      // Get categories and logs separately
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);

      const { data: logs } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId);

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

      const profile: UserProfile = {
        id: existingProfile.id,
        name: existingProfile.name,
        age: existingProfile.age,
        gender: existingProfile.gender,
        weight: existingProfile.weight,
        height: existingProfile.height,
        fitnessGoal: existingProfile.fitness_goal,
        categories: transformedCategories,
        logs: transformedLogs,
        createdAt: existingProfile.created_at,
        updatedAt: existingProfile.updated_at,
      };
      return profile;
    }

    // Create new profile if it doesn't exist
    const now = new Date().toISOString();
    const newProfileData = {
      id: userId,
      name: userName || 'User',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      fitnessGoal: data.fitness_goal,
      categories: [],
      logs: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in initializeUserProfile:', error);
    return null;
  }
};

// Update profile update function
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    // Remove session check
    
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', fetchError);
      throw fetchError;
    }

    const now = new Date().toISOString();

    if (existingProfile) {
      // Profile exists, update it
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          weight: profileData.weight,
          height: profileData.height,
          fitness_goal: profileData.fitnessGoal,
          updated_at: now,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Get categories and logs separately
      const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);

      const { data: logs } = await supabase
        .from("logs")
        .select("*")
        .eq("user_id", userId);

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

      const profile: UserProfile = {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        fitnessGoal: data.fitness_goal,
        categories: transformedCategories,
        logs: transformedLogs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return profile;
    } else {
      // Profile doesn't exist, create it with the provided data
      const newProfileData = {
        id: userId,
        name: profileData.name || 'User',
        age: profileData.age,
        gender: profileData.gender,
        weight: profileData.weight,
        height: profileData.height,
        fitness_goal: profileData.fitnessGoal,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      const profile: UserProfile = {
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        fitnessGoal: data.fitness_goal,
        categories: [],
        logs: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return profile;
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Get user profile from Supabase
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) throw new Error("User not authenticated");

    // Get user profile info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // Get categories and logs separately
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    if (categoriesError) throw categoriesError;

    const { data: logs, error: logsError } = await supabase
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
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      fitnessGoal: profile?.fitness_goal,
      categories: transformedCategories,
      logs: transformedLogs,
      createdAt: profile?.created_at,
      updatedAt: profile?.updated_at,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
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

    const { data, error } = await supabase
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

    const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { error } = await supabase
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

// Helper function to convert database profile to frontend profile
const mapDatabaseToProfile = (dbProfile: any): UserProfile => {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    age: dbProfile.age,
    gender: dbProfile.gender,
    weight: dbProfile.weight,
    height: dbProfile.height,
    fitnessGoal: dbProfile.fitness_goal, // Map from snake_case to camelCase
    categories: [],
    logs: [],
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
};

// Helper function to convert frontend profile to database format
const mapProfileToDatabase = (profile: Partial<UserProfile>) => {
  return {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    fitness_goal: profile.fitnessGoal, // Map from camelCase to snake_case
  };
};

export const profileStorage = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) return null;

      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const dbData = {
        id: userId,
        ...mapProfileToDatabase(profileData),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;

      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const dbData = mapProfileToDatabase(profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // ...existing code...
};
