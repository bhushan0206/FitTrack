import { getUserProfile, createUserProfile } from './users';
import { 
  addCategory as addCategoryBase, 
  updateCategory as updateCategoryBase, 
  deleteCategory as deleteCategoryBase, 
  createDefaultCategories 
} from './categories';
import { 
  addLogEntry as addLogEntryBase, 
  updateLogEntry as updateLogEntryBase, 
  deleteLogEntry as deleteLogEntryBase 
} from './logs';
import { generateId, mapCategoryFromDB, mapLogFromDB } from './utils';
import { getAchievements, checkAndAwardAchievements } from './achievements';

// Re-export utilities
export { generateId, mapCategoryFromDB, mapLogFromDB };

// Export user functions
export { getUserProfile, createUserProfile };

// Wrap category functions to inject getUserProfile
export const addCategory = (category: any, userId: string) => 
  addCategoryBase(category, userId, getUserProfile);

export const updateCategory = (category: any, userId: string) => 
  updateCategoryBase(category, userId, getUserProfile);

export const deleteCategory = (categoryId: string, userId: string) => 
  deleteCategoryBase(categoryId, userId, getUserProfile);

export { createDefaultCategories };

// Wrap log functions to inject getUserProfile
export const addLogEntry = (log: any, userId: string) => 
  addLogEntryBase(log, userId, getUserProfile);

export const updateLogEntry = (log: any, userId: string) => 
  updateLogEntryBase(log, userId, getUserProfile);

export const deleteLogEntry = (logId: string, userId: string) => 
  deleteLogEntryBase(logId, userId, getUserProfile);

// Initialize user profile in Supabase
export const initializeUserProfile = async (userId: string, userName?: string) => {
  try {
    // Check if user profile exists
    const existingProfile = await getUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    await createUserProfile(userId, userName);
    // Create default categories
    const categories = await createDefaultCategories(userId);

    return {
      id: userId,
      name: userName || "User",
      categories,
      logs: [],
    };
  } catch (error) {
    // Remove sensitive initialization data
    console.error("Error initializing user profile");
  }
};

// Export achievement functions
export { getAchievements, checkAndAwardAchievements };
