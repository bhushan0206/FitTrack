import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { useAuth, useUser } from "@clerk/clerk-react";
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
import { Plus, Target } from "lucide-react";

const StatisticsPanel = () => {
  const { userId } = useAuth();
  const { user } = useUser();

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
    </div>
  );
};

export default StatisticsPanel;
