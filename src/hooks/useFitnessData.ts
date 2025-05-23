import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from '@clerk/clerk-react';
import { useToast } from "@/components/ui/use-toast";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import {
  initializeUserProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
  updateUserProfile,
  profileStorage,
} from "@/lib/supabaseStorage";
import { supabase } from "@/lib/supabase";

export const useFitnessData = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<TrackingCategory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the data loading function to prevent infinite re-renders
  const loadUserData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Wait a bit to ensure Clerk auth is fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userName = user?.fullName || user?.firstName || user?.username;
      const userProfile = await initializeUserProfile(userId, userName);
      
      if (userProfile) {
        setProfile(userProfile);
        setCategories(userProfile.categories);
        setLogs(userProfile.logs);
      } else {
        // Create a basic profile locally if database creation fails
        console.warn('Failed to load profile from database, using local fallback');
        const fallbackProfile: UserProfile = {
          id: userId,
          name: userName || 'User',
          categories: [],
          logs: [],
        };
        setProfile(fallbackProfile);
        setCategories([]);
        setLogs([]);
        
        toast({
          title: "Notice",
          description: "Using offline mode. Data will not be saved.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      // Create fallback profile
      const fallbackProfile: UserProfile = {
        id: userId,
        name: user?.fullName || user?.firstName || user?.username || 'User',
        categories: [],
        logs: [],
      };
      setProfile(fallbackProfile);
      setCategories([]);
      setLogs([]);
      
      toast({
        title: "Error",
        description: "Could not connect to database. Using offline mode.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, user?.fullName, user?.firstName, user?.username, toast]);

  // Initialize data from Supabase
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Set up real-time subscriptions using the single supabase instance
  useEffect(() => {
    if (!userId) return;

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'categories',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Categories changed:', payload);
          // Refresh data when changes occur
          loadUserData();
        }
      )
      .subscribe();

    const logsSubscription = supabase
      .channel('logs-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_logs',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Logs changed:', payload);
          // Refresh data when changes occur
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      categoriesSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, [loadUserData, userId]);

  // Category operations
  const handleAddCategory = async (category: TrackingCategory) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await addCategory(category, userId);
      if (updatedProfile) {
        setCategories(updatedProfile.categories);
        toast({
          title: "Success",
          description: "Category added successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  const handleUpdateCategory = async (category: TrackingCategory) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await updateCategory(category, userId);
      if (updatedProfile) {
        setCategories(updatedProfile.categories);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await deleteCategory(categoryId, userId);
      if (updatedProfile) {
        setCategories(updatedProfile.categories);
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  // Log operations
  const handleAddLog = async (log: DailyLog) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await addLogEntry(log, userId);
      if (updatedProfile) {
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Log entry added successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error adding log entry:', error);
      toast({
        title: "Error",
        description: "Failed to add log entry. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  const handleUpdateLog = async (log: DailyLog) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await updateLogEntry(log, userId);
      if (updatedProfile) {
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Log entry updated successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error updating log entry:', error);
      toast({
        title: "Error",
        description: "Failed to update log entry. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  const handleDeleteLog = async (logId: string) => {
    if (!userId) return false;
    
    try {
      const updatedProfile = await deleteLogEntry(logId, userId);
      if (updatedProfile) {
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Log entry deleted successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error deleting log entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete log entry. Please try again.",
        variant: "destructive",
      });
    }
    return false;
  };

  // Add profile update handler with better error handling
  const handleUpdateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!userId) {
      console.error("No user ID available");
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      console.log("handleUpdateProfile called with:", profileData);

      const finalProfileData = {
        ...profileData,
        name: profileData.name || user?.fullName || user?.firstName || user?.username || 'User',
      };

      let updatedProfile: UserProfile;

      try {
        updatedProfile = await profileStorage.updateProfile(userId, finalProfileData);
      } catch (error) {
        console.log("Attempting to create profile...");
        updatedProfile = await profileStorage.createProfile(userId, finalProfileData);
      }

      const finalProfile = {
        ...updatedProfile,
        categories: profile?.categories || [],
        logs: profile?.logs || [],
      };

      setProfile(finalProfile);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, profile, user, toast]);

  return {
    categories,
    logs,
    profile,
    isLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddLog,
    handleUpdateLog,
    handleDeleteLog,
    handleUpdateProfile,
  };
};
