import { useState, useEffect } from "react";
import { useAuth, useUser } from '@clerk/clerk-react';
import { useToast } from "@/components/ui/use-toast";
import { TrackingCategory, DailyLog } from "@/types/fitness";
import {
  initializeUserProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
} from "@/lib/supabaseStorage";

export const useFitnessData = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<TrackingCategory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const userName = user?.fullName || user?.firstName || user?.username;
        const profile = await initializeUserProfile(userId, userName);
        if (profile) {
          setCategories(profile.categories);
          setLogs(profile.logs);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load user data: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [toast, userId, user]);

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
      toast({
        title: "Error",
        description: "Failed to add category: " + error.message,
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
      toast({
        title: "Error",
        description: "Failed to update category: " + error.message,
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
      toast({
        title: "Error",
        description: "Failed to delete category: " + error.message,
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
      toast({
        title: "Error",
        description: "Failed to add log entry: " + error.message,
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
      toast({
        title: "Error",
        description: "Failed to update log entry: " + error.message,
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
      toast({
        title: "Error",
        description: "Failed to delete log entry: " + error.message,
        variant: "destructive",
      });
    }
    return false;
  };

  return {
    categories,
    logs,
    isLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddLog,
    handleUpdateLog,
    handleDeleteLog,
  };
};
