import { supabase } from './supabase';
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Helper function to get current user ID with better error handling
const getCurrentUserId = async (): Promise<string> => {
  try {
    // First try to get from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in getCurrentUserId:', sessionError);
    }
    
    if (session?.user?.id) {
      console.log('getCurrentUserId: Got user ID from session:', session.user.id);
      return session.user.id;
    }
    
    // Fallback to getUser()
    console.log('getCurrentUserId: No session, trying getUser()...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error in getCurrentUserId:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!user) {
      console.error('No user found in getCurrentUserId');
      throw new Error("User not authenticated");
    }
    
    console.log('getCurrentUserId successful for user:', user.id);
    return user.id;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    throw error;
  }
};

// Add a new category
export const addCategory = async (
  category: TrackingCategory
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: category.id,
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
        exerciseType: category.exerciseType,
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

// Update an existing category
export const updateCategory = async (
  category: TrackingCategory
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("categories")
      .update({
        name: category.name,
        unit: category.unit,
        daily_target: category.dailyTarget,
        color: category.color,
        exerciseType: category.exerciseType,
      })
      .eq("id", category.id)
      .eq("user_id", userId);

    if (error) throw error;
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category
export const deleteCategory = async (
  categoryId: string
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

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
  log: DailyLog
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

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
  log: DailyLog
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

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
  logId: string
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();

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

// Initialize user profile in Supabase with proper auth handling
export const initializeUserProfile = async (userName?: string): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();
    
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
        exerciseType: cat.exerciseType,
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
        theme: existingProfile.theme,
        accentColor: existingProfile.accentColor,
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
      theme: data.theme,
      accentColor: data.accentColor,
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

// Update profile function
export const updateUserProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const userId = await getCurrentUserId();
    
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

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
          theme: profileData.theme,
          accentColor: profileData.accentColor,
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
        exerciseType: cat.exerciseType,
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
        theme: data.theme,
        accentColor: data.accentColor,
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
        theme: profileData.theme,
        accentColor: profileData.accentColor,
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
        theme: data.theme,
        accentColor: data.accentColor,
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

// Get user profile from Supabase with better error handling
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    let currentUserId;
    
    if (userId) {
      currentUserId = userId;
      console.log('getUserProfile: Using provided user ID:', currentUserId);
    } else {
      // Try to get user ID with shorter timeout for Google users
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('User ID fetch timeout')), 3000) // Reduced timeout
        );
        
        const userIdPromise = getCurrentUserId();
        currentUserId = await Promise.race([userIdPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('getCurrentUserId timed out, checking localStorage...');
        
        // Try to get user ID from stored session
        try {
          const storedSession = localStorage.getItem('supabase-auth-token');
          if (storedSession) {
            const session = JSON.parse(storedSession);
            if (session?.user?.id) {
              console.log('getUserProfile: Using stored session user ID:', session.user.id);
              currentUserId = session.user.id;
            }
          }
        } catch (storageError) {
          console.error('Error reading from localStorage:', storageError);
        }
        
        if (!currentUserId) {
          console.error('Could not get user ID from any source');
          return null;
        }
      }
    }

    console.log('getUserProfile: Fetching for user:', currentUserId);

    // Get data with shorter timeout
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUserId)
      .maybeSingle();

    const categoriesPromise = supabase
      .from("categories")
      .select("*")
      .eq("user_id", currentUserId);

    const logsPromise = supabase
      .from("logs")
      .select("*")
      .eq("user_id", currentUserId);

    // Shorter timeout for database operations
    const allDataPromise = Promise.all([profilePromise, categoriesPromise, logsPromise]);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 5000) // Reduced timeout
    );

    const [
      { data: profile, error: profileError },
      { data: categories, error: categoriesError },
      { data: logs, error: logsError }
    ] = await Promise.race([allDataPromise, timeoutPromise]);

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      throw logsError;
    }

    // Transform data to match frontend types
    const transformedCategories = (categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      unit: cat.unit,
      dailyTarget: cat.daily_target,
      color: cat.color,
      exerciseType: cat.exerciseType,
    }));

    const transformedLogs = (logs || []).map((log) => ({
      id: log.id,
      categoryId: log.category_id,
      date: log.date,
      value: log.value,
      notes: log.notes,
    }));

    const result: UserProfile = {
      id: currentUserId,
      name: profile?.name || "User",
      age: profile?.age,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      fitnessGoal: profile?.fitness_goal,
      theme: profile?.theme,
      accentColor: profile?.accentColor,
      categories: transformedCategories,
      logs: transformedLogs,
      createdAt: profile?.created_at,
      updatedAt: profile?.updated_at,
    };

    console.log('getUserProfile: Successfully loaded profile for user:', currentUserId);
    return result;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Export updateTheme as a standalone function
export const updateTheme = async (theme: string, accentColor: string) => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from("profiles")
      .update({ theme, accentColor })
      .eq("id", userId);

    if (error) {
      console.error("Error updating theme:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating theme:", error);
    throw error;
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
  console.log("Mapping database profile to frontend:", dbProfile);
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
  console.log("Mapping frontend profile to database:", profile);
  const mapped = {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    fitness_goal: profile.fitnessGoal, // Map from camelCase to snake_case
  };
  console.log("Mapped result:", mapped);
  return mapped;
};

export const profileStorage = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("Getting profile for user:", userId);
      
      // First check if the profiles table exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === 'PGRST116') {
          // No rows found
          console.log("No profile found for user:", userId);
          return null;
        }
        if (error.message.includes('relation "profiles" does not exist')) {
          console.error("Profiles table does not exist!");
          return null;
        }
        throw error;
      }

      console.log("Profile data from database:", data);
      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null; // Return null instead of throwing to allow fallback
    }
  },

  async createProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log("Creating profile for user:", userId, "with data:", profileData);
      
      // Check if profile already exists first
      const existingProfile = await this.getProfile(userId);
      if (existingProfile) {
        console.log("Profile already exists, updating instead");
        return await this.updateProfile(userId, profileData);
      }

      const dbData = {
        id: userId,
        ...mapProfileToDatabase(profileData),
      };

      console.log("Database data to insert:", dbData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      console.log("Profile created successfully:", data);
      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log("Updating profile for user:", userId, "with data:", profileData);
      const dbData = mapProfileToDatabase(profileData);
      console.log("Mapped database data:", dbData);

      const { data, error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log("Profile doesn't exist, creating new one");
          return await this.createProfile(userId, profileData);
        }
        throw error;
      }

      console.log("Profile updated successfully:", data);
      return mapDatabaseToProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  async updateTheme(userId: string, theme: string, accentColor: string) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ theme, accentColor })
      .eq("id", userId);

    if (error) {
      console.error("Error updating theme:", error);
      throw error;
    }

    return data;
  },

  async getCategories(): Promise<TrackingCategory[]> {
    console.log('SupabaseStorage.getCategories called');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error in getCategories:', authError);
        throw authError;
      }
      
      if (!user) {
        console.log('No user found in getCategories, returning empty array');
        return [];
      }

      console.log('Getting categories for user:', user.id);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error in getCategories:', error);
        throw error;
      }

      console.log('Categories retrieved:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async getLogs(): Promise<DailyLog[]> {
    console.log('SupabaseStorage.getLogs called');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error in getLogs:', authError);
        throw authError;
      }
      
      if (!user) {
        console.log('No user found in getLogs, returning empty array');
        return [];
      }

      console.log('Getting logs for user:', user.id);
      
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error in getLogs:', error);
        throw error;
      }

      console.log('Logs retrieved:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getLogs:', error);
      return []; // Return empty array instead of throwing
    }
  },
};
