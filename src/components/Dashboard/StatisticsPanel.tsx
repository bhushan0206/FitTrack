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
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// Define the valid tab values as a union type
type TabValue = 'overview' | 'progress' | 'categories' | 'logs' | 'exercises' | 'social' | 'ai-assistant';

const StatisticsPanel = () => {
  const { user, signOut } = useAuth();
  const { totalUnread, refreshCounts } = useNotifications();

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
  const currentProfile = profile || {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        datePickerOpen={datePickerOpen}
        onDatePickerToggle={setDatePickerOpen}
        profile={currentProfile}
        onProfileUpdate={handleUpdateProfile}
        isLoading={isLoading}
        onAIChatClick={() => setActiveTab("ai-assistant")}
      >
        <ProfileForm />
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Summary Cards and Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <SummaryCards
              selectedDate={selectedDate}
              logs={selectedDateLogs}
              categories={categories}
            />

            {/* Quick Actions */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-gray-900 dark:text-white text-lg font-bold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 space-y-3">
                <Button
                  onClick={() => setShowLogForm(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Log Entry
                </Button>
                <Button
                  onClick={() => setShowCategoryForm(true)}
                  variant="outline"
                  className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
                <Button
                  onClick={() => setActiveTab("social")}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Social Hub
                </Button>
                <Button
                  onClick={() => setActiveTab("ai-assistant")}
                  variant="outline"
                  className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                  AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full h-full">
              <TabsList className="grid w-full grid-cols-7 mb-6 bg-gray-100/50 dark:bg-gray-700/50 p-1 rounded-lg">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Daily Logs
                </TabsTrigger>
                <TabsTrigger value="exercises" className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Exercises
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <div className="h-[calc(100vh-200px)] overflow-y-auto">
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <DailyLogList
                    logs={selectedDateLogs}
                    categories={categories}
                    onEdit={handleEditLog}
                    onDelete={handleDeleteLog}
                    onAdd={() => setShowLogForm(true)}
                    selectedDate={selectedDate}
                  />
                </TabsContent>

                <TabsContent value="categories" className="space-y-6 mt-6">
                  <CategoryManager
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </TabsContent>

                <TabsContent value="social" className="space-y-6 mt-6">
                  <SocialHub />
                </TabsContent>

                <TabsContent value="ai-assistant" className="h-full">
                  <div className="h-full">
                    <Tabs defaultValue="chat" className="h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          AI Chat
                        </TabsTrigger>
                        <TabsTrigger value="workouts" className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4" />
                          Workouts
                        </TabsTrigger>
                        <TabsTrigger value="nutrition" className="flex items-center gap-2">
                          <Salad className="w-4 h-4" />
                          Nutrition
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Goals & Motivation
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="flex-1 min-h-0">
                        <TabsContent value="chat" className="h-full mt-0">
                          <AIChat 
                            userProfile={profile}
                            recentLogs={recentLogs}
                            categories={profile?.categories}
                          />
                        </TabsContent>
                        
                        <TabsContent value="workouts" className="h-full mt-0">
                          <WorkoutRecommendations 
                            userProfile={profile}
                            recentLogs={recentLogs}
                            categories={profile?.categories}
                          />
                        </TabsContent>
                        
                        <TabsContent value="nutrition" className="h-full mt-0">
                          <NutritionRecommendations 
                            userProfile={profile}
                            recentLogs={recentLogs}
                            categories={profile?.categories}
                          />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="exercises" className="h-full">
                  <ExerciseLibrary 
                    onStartExercise={(exercise) => {
                      // Handle starting an exercise - you can implement this based on your needs
                      console.log('Starting exercise:', exercise);
                    }}
                    onViewExerciseDetails={(exercise) => {
                      // Handle viewing exercise details - you can implement this based on your needs
                      console.log('Viewing exercise details:', exercise);
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-md rounded-2xl shadow-2xl sm:max-w-md">
          <CategoryForm
            onSave={handleSaveCategory}
            category={editingCategory || undefined}
            existingCategories={categories}
            onCancel={() => {
              console.log('Category form cancelled');
              handleCancelCategoryForm();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-2xl rounded-2xl shadow-2xl">
          <LogEntryForm
            categories={categories}
            onSave={handleSaveLog}
            log={editingLog || undefined}
            onCancel={handleCancelLogForm}
            selectedDate={selectedDateString}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatisticsPanel;
