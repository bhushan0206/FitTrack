import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import { Exercise, ExerciseLog } from '@/types/exercise';
import { useFitnessData } from "@/hooks/useFitnessData";
import { exerciseStorage } from "@/lib/exerciseStorage";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import SummaryCards from "@/components/Dashboard/SummaryCards";
import ProgressChart from "@/components/Dashboard/ProgressChart";
import DailyLogList from "@/components/Dashboard/DailyLogList";
import CategoryForm from "@/components/Dashboard/CategoryForm";
import LogEntryForm from "@/components/Dashboard/LogEntryForm";
import CategoryManager from './CategoryManager';
import ProfileForm from "@/components/Profile/ProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FolderPlus, Users, Sparkles, Brain, MessageCircle, Dumbbell, Salad, BarChart3, TrendingUp, Settings, Calendar, Target } from "lucide-react";
import ExerciseLibrary from "../Exercise/ExerciseLibrary";
import ExerciseDetails from "@/components/Exercise/ExerciseDetails";
import ExerciseTracker from "@/components/Exercise/ExerciseTracker";
import SocialHub from "@/components/Social/SocialHub";
import { useNotifications } from '@/hooks/useNotifications';
import { socialStorage } from '@/lib/socialStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChat from "../AI/AIChat";
import WorkoutRecommendations from "../AI/WorkoutRecommendations";
import NutritionRecommendations from "../AI/NutritionRecommendations";
import GoalTrackingAssistant from '../AI/GoalTrackingAssistant';
import TabNavigation, { TabValue } from "@/components/Layout/TabNavigation";
import QuickActions from "./QuickActions";
import { updateUserProfile } from '@/lib/supabaseStorage';

const StatisticsPanel = () => {
  const { user, signOut } = useAuth();
  const { totalUnread, refreshCounts } = useNotifications();

  // State management hooks
  const {
    profile: userProfile, 
    categories,
    logs,
    isLoading: dataLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddLog,
    handleUpdateLog,
    handleDeleteLog,
    handleUpdateProfile,
  } = useFitnessData();

  // Local state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TrackingCategory | null>(null);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showExerciseTracker, setShowExerciseTracker] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showSocialHub, setShowSocialHub] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load exercises and exercise logs
  useEffect(() => {
    const loadExerciseData = async () => {
      // Only load exercise data if user is authenticated
      if (!user) {
        console.log('User not authenticated, skipping exercise data load');
        setExercises([]);
        setExerciseLogs([]);
        return;
      }

      try {
        console.log('Loading exercise data for user:', user.id);
        const [exerciseList, logs] = await Promise.all([
          exerciseStorage.getExercises(),
          exerciseStorage.getExerciseLogs()
        ]);
        
        console.log('Loaded exercises:', exerciseList.length);
        console.log('Loaded exercise logs:', logs.length);
        
        // Filter logs for selected date
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        const filteredLogs = logs.filter(log => log.date === selectedDateString);
        
        setExercises(exerciseList);
        setExerciseLogs(filteredLogs);
      } catch (error) {
        console.error('Error loading exercise data:', error);
        setExercises([]);
        setExerciseLogs([]);
      }
    };

    loadExerciseData();
  }, [selectedDate, user]); // Add user dependency

  // User effect for loading data
  useEffect(() => {
    console.log('StatisticsPanel useEffect - User:', user);
    
    if (user) {
      console.log('User found, loading data...');
      loadData();
    } else {
      console.log('No user found, redirecting to auth');
      // Don't redirect here, let App.tsx handle it
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      console.log('LoadData called but no user, stopping');
      setLoading(false);
      return;
    }

    console.log('Starting to load data for user:', user.id);
    setLoading(true);
    
    try {
      // Since we're using useFitnessData hook, we don't need to load data here
      // The hook handles all the data loading
      console.log('Data loading handled by useFitnessData hook');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Add timeout fallback for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && user) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
        setError('Loading took too long. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, user]);

  // Add real-time subscription to refresh notification counts
  useEffect(() => {
    // Subscribe to message updates to refresh notification counts
    const subscription = socialStorage.subscribeToMessages(() => {
      // Refresh notification counts when any message is received
      refreshCounts();
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [refreshCounts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading your fitness data...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            This may take a moment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              loadData();
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Computed values
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const selectedDateLogs = logs.filter((log) => log.date === selectedDateString);

  // Add recentLogs derived from logs
  const recentLogs = logs.slice(-20); // Get last 20 logs

  // Event handlers
  const handleEditCategory = (category: TrackingCategory) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setShowLogForm(true);
  };

  const handleSaveCategory = async (category: TrackingCategory) => {
    let success = false;
    if (editingCategory) {
      success = await handleUpdateCategory(category);
    } else {
      success = await handleAddCategory(category);
    }

    if (success) {
      setShowCategoryForm(false);
      setEditingCategory(null);
    }
  };

  const handleSaveLog = async (log: DailyLog) => {
    let success = false;
    if (editingLog) {
      success = await handleUpdateLog(log);
    } else {
      success = await handleAddLog(log);
    }

    if (success) {
      setShowLogForm(false);
      setEditingLog(null);
    }
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCancelLogForm = () => {
    setShowLogForm(false);
    setEditingLog(null);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Exercise handlers
  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseLibrary(false);
    setShowExerciseTracker(true);
  };

  const handleViewExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseLibrary(false);
    setShowExerciseDetails(true);
  };

  const handleCompleteExercise = async (exerciseLog: ExerciseLog) => {
    try {
      console.log('Exercise completed:', exerciseLog);
      
      // Optimistically update the UI
      setExerciseLogs(prev => [...prev, exerciseLog]);
      setShowExerciseTracker(false);
      setSelectedExercise(null);
      
      // Refresh data only if user is authenticated
      if (user) {
        const logs = await exerciseStorage.getExerciseLogs();
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        const filteredLogs = logs.filter(log => log.date === selectedDateString);
        setExerciseLogs(filteredLogs);
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      // Remove the optimistically added log if there's an error
      setExerciseLogs(prev => prev.filter(log => log.id !== exerciseLog.id));
    }
  };

  // Create the onCategoryUpdate function outside the render to be more explicit
  const handleCategoryUpdate = async (category: TrackingCategory): Promise<boolean> => {
    console.log('Category updated:', category);
    try {
      // Refresh the dashboard data after category update
      await loadData();
      return true; // Return true to indicate success
    } catch (error) {
      console.error('Error refreshing data after category update:', error);
      return false; // Return false to indicate failure
    }
  };

  // Create a profile object with fallback values
  const currentProfile = userProfile || {
    id: user?.id || "temp-id",
    name: user?.name || user?.email || "",
    age: undefined,
    gender: undefined,
    weight: undefined,
    height: undefined,
    fitnessGoal: undefined,
    categories: [],
    logs: [],
  };

  // Simplified handleProfileSave - just close dialog and refresh data
  const handleProfileSave = async (profileData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const result = await updateUserProfile(profileData);
      if (result) {
        // The useFitnessData hook will automatically update with the new profile
        setShowProfileDialog(false);
        // Show success message
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile updated successfully');
        }
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        datePickerOpen={datePickerOpen}
        onDatePickerToggle={setDatePickerOpen}
        profile={currentProfile}
        onProfileUpdate={handleUpdateProfile}
        isLoading={isLoading}
        onAIChatClick={() => setActiveTab("ai-assistant")}
        onQuickDateSelect={(date) => {
          setSelectedDate(date);
          setDatePickerOpen(false);
        }}
        showDatePicker={true}
      >
        <ProfileForm />
      </Header>

      {/* Mobile-optimized main content */}
      <main className="w-full max-w-full md:max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 overflow-hidden">
        {/* Mobile-first layout with reordered content */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-3 md:gap-4">
          {/* Main Content - First on mobile, second on desktop */}
          <div className="w-full order-1 md:order-2 md:col-span-8 lg:col-span-9">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabValue)}
              className="w-full"
            >
              {/* Mobile-optimized tab navigation */}
              <div className="w-full overflow-hidden mb-2">
                <div className="tabs-list overflow-x-auto hide-scrollbar">
                  <TabNavigation />
                </div>
              </div>

              {/* Dynamic height container that works on mobile */}
              <div className="mobile-height-fix overflow-y-auto overflow-x-hidden">
                <TabsContent
                  value="overview"
                  className="space-y-3 mt-2 sm:mt-4 px-0.5"
                >
                  <DailyLogList
                    logs={selectedDateLogs}
                    categories={categories}
                    onEdit={handleEditLog}
                    onDelete={handleDeleteLog}
                    onAdd={() => setShowLogForm(true)}
                    selectedDate={selectedDate}
                  />
                </TabsContent>

                <TabsContent
                  value="categories"
                  className="space-y-3 mt-2 sm:mt-4 px-0.5"
                >
                  <CategoryManager
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </TabsContent>

                <TabsContent
                  value="social"
                  className="space-y-3 mt-2 sm:mt-4 px-0.5"
                >
                  <SocialHub />
                </TabsContent>

                <TabsContent value="ai-assistant" className="h-full px-0.5">
                  <div className="mobile-height-fix">
                    <Tabs defaultValue="chat" className="h-full flex flex-col">
                      {/* Mobile-optimized AI tabs */}
                      <TabsList className="grid grid-cols-2 xs:grid-cols-4 mb-2 p-1 w-full overflow-x-auto hide-scrollbar">
                        <TabsTrigger
                          value="chat"
                          className="flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Chat</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="workouts"
                          className="flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                        >
                          <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Workouts</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="nutrition"
                          className="flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                        >
                          <Salad className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Nutrition</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="goals"
                          className="flex items-center justify-center gap-1 text-xs whitespace-nowrap"
                        >
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Goals</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex-1 min-h-0">
                        <TabsContent value="chat" className="h-full mt-0">
                          <AIChat
                            userProfile={userProfile}
                            recentLogs={recentLogs}
                            categories={userProfile?.categories}
                          />
                        </TabsContent>

                        <TabsContent value="workouts" className="h-full mt-0">
                          <WorkoutRecommendations 
                              profile={userProfile}
                              categories={categories}
                              logs={recentLogs}
                            />
                        </TabsContent>

                        <TabsContent value="nutrition" className="h-full mt-0">
                          <NutritionRecommendations
                            userProfile={userProfile}
                            recentLogs={recentLogs}
                            categories={userProfile?.categories}
                          />
                        </TabsContent>

                        <TabsContent value="goals" className="h-full mt-0">
                          <div className="h-full overflow-y-auto">
                            <GoalTrackingAssistant
                              userProfile={userProfile}
                              recentLogs={recentLogs}
                              categories={userProfile?.categories}
                            />
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="exercises" className="h-full px-0.5">
                  <ExerciseLibrary
                    onStartExercise={(exercise) => {
                      console.log("Starting exercise:", exercise);
                    }}
                    onViewExerciseDetails={(exercise) => {
                      console.log("Viewing exercise details:", exercise);
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Summary Cards - Second on mobile, first on desktop */}
          <div className="w-full order-2 md:order-1 md:col-span-4 lg:col-span-3 mt-2 md:mt-0">
            <div className="md:sticky md:top-2 space-y-2 sm:space-y-3">
              <SummaryCards
                selectedDate={selectedDate}
                logs={selectedDateLogs}
                categories={categories}
              />

              {/* Use the new QuickActions component */}
              <QuickActions
                onAddLog={() => setShowLogForm(true)}
                onAddCategory={() => setShowCategoryForm(true)}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile-optimized dialogs */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-[calc(100vw-16px)] sm:max-w-md rounded-lg shadow-xl p-3 sm:p-4 overflow-y-auto max-h-[90vh]">
          <CategoryForm
            onSave={handleSaveCategory}
            category={editingCategory || undefined}
            existingCategories={categories}
            onCancel={handleCancelCategoryForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-[calc(100vw-16px)] sm:max-w-2xl rounded-lg shadow-xl p-3 sm:p-4 overflow-y-auto max-h-[90vh]">
          <LogEntryForm
            categories={categories}
            onSave={handleSaveLog}
            log={editingLog || undefined}
            onCancel={handleCancelLogForm}
            selectedDate={selectedDateString}
          />
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-semibold">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <ProfileForm 
              profile={userProfile} 
              onSave={handleProfileSave}
              onCancel={() => setShowProfileDialog(false)}
              standalone={true}
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StatisticsPanel;