import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { TrackingCategory, DailyLog, UserProfile } from "@/types/fitness";
import { useFitnessData } from "@/hooks/useFitnessData";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import SummaryCards from "@/components/Dashboard/SummaryCards";
import ProgressChart from "@/components/Dashboard/ProgressChart";
import DailyLogList from "@/components/Dashboard/DailyLogList";
import CategoryForm from "@/components/Dashboard/CategoryForm";
import LogEntryForm from "@/components/Dashboard/LogEntryForm";
import ProfileForm from "@/components/Profile/ProfileForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

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

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Cards */}
          <SummaryCards
            logs={selectedDateLogs}
            categories={categories}
            selectedDate={selectedDate}
          />

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProgressChart logs={logs} categories={categories} />
            
            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowCategoryForm(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Category
                  </Button>
                  <Button
                    onClick={() => setShowLogForm(true)}
                    disabled={categories.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    Log Entry
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Management */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🏷️</span>
                My Categories
              </h3>
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Category
              </Button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏷️</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                  No categories yet
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Create your first category to start tracking your fitness goals
                </p>
                <Button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  // Calculate today's progress for this category
                  const todayLogs = selectedDateLogs.filter(log => log.categoryId === category.id);
                  const todayValue = todayLogs.reduce((sum, log) => sum + log.value, 0);
                  const progress = (todayValue / category.dailyTarget) * 100;
                  const isCompleted = progress >= 100;

                  return (
                    <div
                      key={category.id}
                      className="p-4 rounded-xl border-0 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-600/50 shadow-md hover:shadow-lg transition-all duration-300"
                      style={{ borderLeft: `4px solid ${category.color}` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </h4>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 p-0 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            Target: {category.dailyTarget} {category.unit}/day
                          </span>
                          {isCompleted && (
                            <span className="text-green-600 dark:text-green-400 font-bold">
                              ✓ Done
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            Today: {todayValue} {category.unit}
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Logs */}
          <DailyLogList
            logs={selectedDateLogs}
            categories={categories}
            onEdit={handleEditLog}
            onDelete={handleDeleteLog}
            onAdd={() => setShowLogForm(true)}
            selectedDate={selectedDate}
          />
        </div>
      </main>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-2xl rounded-2xl shadow-2xl">
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={handleCancelCategoryForm}
          />
        </DialogContent>
      </Dialog>

      {/* Log Entry Form Dialog */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-2xl rounded-2xl shadow-2xl">
          <LogEntryForm
            categories={categories}
            log={editingLog}
            selectedDate={selectedDateString}
            onSave={handleSaveLog}
            onCancel={handleCancelLogForm}
          />
        </DialogContent>
      </Dialog>

      <Footer />
      
      {/* Toast container - positioned properly */}
      <div className="fixed top-0 right-0 z-[100] p-4">
        {/* This ensures toasts appear in the correct position */}
      </div>
    </div>
  );
};

export default StatisticsPanel;
