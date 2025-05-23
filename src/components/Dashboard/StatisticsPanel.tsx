import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import { useFitnessData } from "@/hooks/useFitnessData";
import { useToast } from "@/components/ui/use-toast";
import { useDialogState } from "@/hooks/useDialogState";
import DashboardTabs from "@/components/Dashboard/DashboardTabs";
import CategoryDialog from "@/components/Categories/CategoryDialog";
import LogDialog from "@/components/Logs/LogDialog";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ProfileForm from "@/components/Profile/ProfileForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

const StatisticsPanel = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  // State management hooks
  const {
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
  } = useFitnessData();

  const {
    categoryDialogOpen,
    logDialogOpen,
    editingCategory,
    editingLog,
    openCategoryDialog,
    closeCategoryDialog,
    openLogDialog,
    closeLogDialog,
  } = useDialogState();

  // Add profile dialog state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Local state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Computed values
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const selectedDateLogs = logs.filter((log) => log.date === selectedDateString);

  // Event handlers
  const handleSaveCategory = async (category: TrackingCategory) => {
    const success = editingCategory
      ? await handleUpdateCategory(category)
      : await handleAddCategory(category);
    
    if (success) {
      closeCategoryDialog();
    }
  };

  const handleSaveLog = async (log: DailyLog) => {
    const success = editingLog
      ? await handleUpdateLog(log)
      : await handleAddLog(log);
    
    if (success) {
      closeLogDialog();
    }
  };
  // Add profile handlers with better error handling
  
  const handleEditProfile = useCallback(() => {
    setProfileDialogOpen(true);
  }, []);

  // Update profile handler to use the hook
  const handleSaveProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    const success = await handleUpdateProfile(profileData);
    if (success) {
      setProfileDialogOpen(false);
    }
  }, [handleUpdateProfile]);

  // Add sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [signOut, toast]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Create a profile object with fallback values
  const currentProfile = profile || {
    id: userId || "temp-id",
    name: user?.fullName || user?.firstName || user?.username || "",
    age: undefined,
    gender: undefined,
    weight: undefined,
    height: undefined,
    fitnessGoal: undefined,
    categories: [],
    logs: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black relative overflow-hidden flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        datePickerOpen={datePickerOpen}
        onDatePickerToggle={setDatePickerOpen}
        profile={currentProfile}
        onProfileUpdate={handleUpdateProfile}
        isLoading={isLoading}
      >
        <ProfileForm />
      </Header>

      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 py-8 w-full">
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          logs={logs}
          selectedDate={selectedDate}
          selectedDateLogs={selectedDateLogs}
          profile={currentProfile}
          onEditCategory={openCategoryDialog}
          onDeleteCategory={handleDeleteCategory}
          onAddCategory={() => openCategoryDialog()}
          onEditLog={openLogDialog}
          onDeleteLog={handleDeleteLog}
          onAddLog={() => openLogDialog()}
        />

        <CategoryDialog
          isOpen={categoryDialogOpen}
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={closeCategoryDialog}
        />

        <LogDialog
          isOpen={logDialogOpen}
          log={editingLog}
          categories={categories}
          selectedDate={selectedDateString}
          onSave={handleSaveLog}
          onClose={closeLogDialog}
        />
      </main>

      <Footer />
    </div>
  );
};

export default StatisticsPanel;
