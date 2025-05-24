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
import CategoryManager from "@/components/Dashboard/CategoryManager";
import ProfileForm from "@/components/Profile/ProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";
import ExerciseLibrary from "@/components/Exercise/ExerciseLibrary";
import ExerciseDetails from "@/components/Exercise/ExerciseDetails";
import ExerciseTracker from "@/components/Exercise/ExerciseTracker";
import SocialHub from "@/components/Social/SocialHub";

const StatisticsPanel = () => {
  const { user } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <Header
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        datePickerOpen={datePickerOpen}
        onDatePickerToggle={setDatePickerOpen}
        profile={currentProfile}
        onProfileUpdate={handleUpdateProfile}
        isLoading={isLoading}
      >
        <ProfileForm />
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Social Hub */}
        {showSocialHub && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSocialHub(false);
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <SocialHub />
          </div>
        )}

        {/* Exercise Library */}
        {showExerciseLibrary && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowExerciseLibrary(false);
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <ExerciseLibrary
              onStartExercise={handleStartExercise}
              onViewExerciseDetails={handleViewExerciseDetails}
            />
          </div>
        )}

        {/* Exercise Details */}
        {showExerciseDetails && selectedExercise && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowExerciseDetails(false);
                  setShowExerciseLibrary(true);
                }}
                className="mb-4"
              >
                ← Back to Library
              </Button>
            </div>
            <ExerciseDetails
              exercise={selectedExercise}
              onStart={handleStartExercise}
              onClose={() => {
                setShowExerciseDetails(false);
                setShowExerciseLibrary(true);
              }}
            />
          </div>
        )}

        {/* Exercise Tracker */}
        {showExerciseTracker && selectedExercise && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowExerciseTracker(false);
                  setShowExerciseLibrary(true);
                }}
                className="mb-4"
              >
                ← Back to Library
              </Button>
            </div>
            <ExerciseTracker
              exercise={selectedExercise}
              onComplete={handleCompleteExercise}
              onCancel={() => {
                setShowExerciseTracker(false);
                setShowExerciseLibrary(true);
              }}
              selectedDate={format(selectedDate, 'yyyy-MM-dd')}
            />
          </div>
        )}

        {/* Main Dashboard - Reorganized for better UX */}
        {!showExerciseLibrary && !showExerciseDetails && !showExerciseTracker && !showSocialHub && (
          <>
            {/* Quick Actions Section - High Priority */}
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-3xl">🚀</span>
                    Quick Actions
                  </CardTitle>
                  <p className="text-indigo-100">Start tracking your fitness journey</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowExerciseLibrary(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-20 flex flex-col gap-2 backdrop-blur-sm"
                      variant="outline"
                      disabled={!user}
                    >
                      <span className="text-2xl">💪</span>
                      <span className="font-semibold">Start Exercise</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowLogForm(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-20 flex flex-col gap-2 backdrop-blur-sm"
                      variant="outline"
                      disabled={!user}
                    >
                      <span className="text-2xl">📝</span>
                      <span className="font-semibold">Log Activity</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Add Category button clicked on mobile');
                        setShowCategoryForm(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-20 flex flex-col gap-2 backdrop-blur-sm"
                      variant="outline"
                      disabled={!user}
                    >
                      <span className="text-2xl">🎯</span>
                      <span className="font-semibold">Add Category</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSocialHub(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-20 flex flex-col gap-2 backdrop-blur-sm"
                      variant="outline"
                      disabled={!user}
                    >
                      <span className="text-2xl">👥</span>
                      <span className="font-semibold">Social Hub</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Overview - Summary Cards */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  Today's Overview
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowSocialHub(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={!user}
                  >
                    <span className="text-lg">👥</span>
                    Social
                  </Button>
                </div>
              </div>
              <SummaryCards
                logs={logs}
                categories={categories}
                selectedDate={selectedDate}
              />
            </div>

            {/* Exercise Activity Section */}
            <div className="mb-8">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">💪</span>
                    Exercise Activity
                  </CardTitle>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowExerciseLibrary(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    disabled={!user}
                  >
                    Browse All Exercises
                  </Button>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Authentication Required
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Please sign in to access exercise tracking features.
                      </p>
                    </div>
                  ) : exerciseLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🏃‍♂️</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Ready to get moving?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        No exercises logged for today. Start your fitness journey now!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowExerciseLibrary(true);
                          }}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3"
                        >
                          <span className="mr-2">🔍</span>
                          Browse Exercises
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowLogForm(true);
                          }}
                          className="px-6 py-3"
                        >
                          <span className="mr-2">📝</span>
                          Quick Log
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {exerciseLogs.length}
                          </p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Exercises Completed
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {exerciseLogs.reduce((sum, log) => sum + log.duration, 0)}
                          </p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Total Minutes
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {exerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0)}
                          </p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Calories Burned
                          </p>
                        </div>
                      </div>
                      
                      {/* Recent Exercise Logs */}
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Recent Exercises
                        </h4>
                        <div className="space-y-2">
                          {exerciseLogs.slice(0, 3).map((log, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  Exercise #{index + 1}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {log.duration} min • {log.calories || 0} cal
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {log.intensity || 'Moderate'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">📈</span>
                  Analytics & Management
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProgressChart 
                  logs={logs} 
                  categories={categories} 
                  exerciseLogs={exerciseLogs}
                />
                <CategoryManager
                  categories={categories}
                  onCategoryUpdate={() => {}}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onAdd={(e) => {
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    console.log('Category Manager Add button clicked');
                    setShowCategoryForm(true);
                  }}
                />
              </div>
            </div>

            {/* Daily Activity Log Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">📋</span>
                  Daily Activity Log
                </h2>
              </div>
              <DailyLogList
                logs={selectedDateLogs}
                categories={categories}
                onEdit={handleEditLog}
                onDelete={handleDeleteLog}
                onAdd={() => setShowLogForm(true)}
                selectedDate={selectedDate}
              />
            </div>

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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StatisticsPanel;
