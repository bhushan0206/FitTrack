import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import {
  getUserProfile,
  initializeUserProfile,
  updateUserProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
} from "@/lib/supabaseStorage";

export const useFitnessData = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<TrackingCategory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || authLoading) {
        setIsLoading(authLoading);
        return;
      }

      try {
        setIsLoading(true);
        
        // Try to get existing profile
        let userProfile = await getUserProfile();
        
        // If no profile exists, initialize one
        if (!userProfile) {
          userProfile = await initializeUserProfile(user.name);
        }

        if (userProfile) {
          setProfile(userProfile);
          setCategories(userProfile.categories || []);
          setLogs(userProfile.logs || []);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, authLoading]);

  // Category management
  const handleAddCategory = async (category: TrackingCategory): Promise<boolean> => {
    try {
      const updatedProfile = await addCategory(category);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setCategories(updatedProfile.categories || []);
        toast({
          title: "Success",
          description: "Category added successfully",
        });
        return true;
      }
      return false;
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

  const handleUpdateCategory = async (category: TrackingCategory): Promise<boolean> => {
    try {
      const updatedProfile = await updateCategory(category);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setCategories(updatedProfile.categories || []);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        return true;
      }
      return false;
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

  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      const updatedProfile = await deleteCategory(categoryId);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setCategories(updatedProfile.categories || []);
        setLogs(updatedProfile.logs || []);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        return true;
      }
      return false;
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

  // Log management
  const handleAddLog = async (log: DailyLog): Promise<boolean> => {
    try {
      const updatedProfile = await addLogEntry(log);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setLogs(updatedProfile.logs || []);
        toast({
          title: "Success",
          description: "Log entry added successfully",
        });
        return true;
      }
      return false;
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

  const handleUpdateLog = async (log: DailyLog): Promise<boolean> => {
    try {
      const updatedProfile = await updateLogEntry(log);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setLogs(updatedProfile.logs || []);
        toast({
          title: "Success",
          description: "Log entry updated successfully",
        });
        return true;
      }
      return false;
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

  const handleDeleteLog = async (logId: string): Promise<boolean> => {
    try {
      const updatedProfile = await deleteLogEntry(logId);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setLogs(updatedProfile.logs || []);
        toast({
          title: "Success",
          description: "Log entry deleted successfully",
        });
        return true;
      }
      return false;
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

  // Profile management
  const handleUpdateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<boolean> => {
    try {
      const updatedProfile = await updateUserProfile(profileData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    profile,
    categories,
    logs,
    isLoading: isLoading || authLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddLog,
    handleUpdateLog,
    handleDeleteLog,
    handleUpdateProfile,
  };
};
