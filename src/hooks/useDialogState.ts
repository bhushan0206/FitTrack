import { useState } from "react";
import { TrackingCategory, DailyLog } from "@/types/fitness";

export const useDialogState = () => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TrackingCategory | undefined>();
  const [editingLog, setEditingLog] = useState<DailyLog | undefined>();

  const openCategoryDialog = (category?: TrackingCategory) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const closeCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(undefined);
  };

  const openLogDialog = (log?: DailyLog) => {
    setEditingLog(log);
    setLogDialogOpen(true);
  };

  const closeLogDialog = () => {
    setLogDialogOpen(false);
    setEditingLog(undefined);
  };

  return {
    categoryDialogOpen,
    logDialogOpen,
    editingCategory,
    editingLog,
    openCategoryDialog,
    closeCategoryDialog,
    openLogDialog,
    closeLogDialog,
  };
};
