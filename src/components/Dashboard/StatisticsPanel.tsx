import { useState } from "react";
import { format } from "date-fns";
import { TrackingCategory, DailyLog } from "@/types/fitness";
import { useFitnessData } from "@/hooks/useFitnessData";
import { useDialogState } from "@/hooks/useDialogState";
import DashboardHeader from "@/components/Layout/DashboardHeader";
import DashboardTabs from "@/components/Dashboard/DashboardTabs";
import CategoryDialog from "@/components/Categories/CategoryDialog";
import LogDialog from "@/components/Logs/LogDialog";

const StatisticsPanel = () => {
  // State management hooks
  const {
    categories,
    logs,
    isLoading,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddLog,
    handleUpdateLog,
    handleDeleteLog,
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          datePickerOpen={datePickerOpen}
          onDatePickerToggle={setDatePickerOpen}
        />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          logs={logs}
          selectedDate={selectedDate}
          selectedDateLogs={selectedDateLogs}
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
      </div>
    </div>
  );
};

export default StatisticsPanel;
