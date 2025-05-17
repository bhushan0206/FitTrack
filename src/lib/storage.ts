import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";

const STORAGE_KEY = "fitness_tracker_data";

// Default user profile with sample data
const defaultUserProfile: UserProfile = {
  id: "user1",
  name: "User",
  categories: [
    {
      id: "cat1",
      name: "Steps",
      unit: "steps",
      dailyTarget: 10000,
      color: "#3b82f6",
    },
    {
      id: "cat2",
      name: "Water",
      unit: "glasses",
      dailyTarget: 8,
      color: "#06b6d4",
    },
    {
      id: "cat3",
      name: "Workout",
      unit: "minutes",
      dailyTarget: 30,
      color: "#10b981",
    },
  ],
  logs: [],
};

// Initialize storage with default data if empty
export const initializeStorage = (): UserProfile => {
  if (typeof window === "undefined") return defaultUserProfile;

  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUserProfile));
    return defaultUserProfile;
  }

  return JSON.parse(storedData);
};

// Get user profile from storage
export const getUserProfile = (): UserProfile => {
  if (typeof window === "undefined") return defaultUserProfile;

  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : defaultUserProfile;
};

// Save user profile to storage
export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

// Add a new category
export const addCategory = (category: TrackingCategory): UserProfile => {
  const profile = getUserProfile();
  profile.categories.push(category);
  saveUserProfile(profile);
  return profile;
};

// Update an existing category
export const updateCategory = (category: TrackingCategory): UserProfile => {
  const profile = getUserProfile();
  const index = profile.categories.findIndex((c) => c.id === category.id);
  if (index !== -1) {
    profile.categories[index] = category;
    saveUserProfile(profile);
  }
  return profile;
};

// Delete a category
export const deleteCategory = (categoryId: string): UserProfile => {
  const profile = getUserProfile();
  profile.categories = profile.categories.filter((c) => c.id !== categoryId);
  profile.logs = profile.logs.filter((log) => log.categoryId !== categoryId);
  saveUserProfile(profile);
  return profile;
};

// Add a new log entry
export const addLogEntry = (log: DailyLog): UserProfile => {
  const profile = getUserProfile();
  profile.logs.push(log);
  saveUserProfile(profile);
  return profile;
};

// Update an existing log entry
export const updateLogEntry = (log: DailyLog): UserProfile => {
  const profile = getUserProfile();
  const index = profile.logs.findIndex((l) => l.id === log.id);
  if (index !== -1) {
    profile.logs[index] = log;
    saveUserProfile(profile);
  }
  return profile;
};

// Delete a log entry
export const deleteLogEntry = (logId: string): UserProfile => {
  const profile = getUserProfile();
  profile.logs = profile.logs.filter((l) => l.id !== logId);
  saveUserProfile(profile);
  return profile;
};

// Get logs for a specific date
export const getLogsByDate = (date: string): DailyLog[] => {
  const profile = getUserProfile();
  return profile.logs.filter((log) => log.date === date);
};

// Get logs for a specific category
export const getLogsByCategory = (categoryId: string): DailyLog[] => {
  const profile = getUserProfile();
  return profile.logs.filter((log) => log.categoryId === categoryId);
};

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
