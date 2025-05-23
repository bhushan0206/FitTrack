import { TrackingCategory, DailyLog } from "@/types/fitness";

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Helper functions to map between DB and app models
export function mapCategoryFromDB(dbCategory: any): TrackingCategory {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    unit: dbCategory.unit,
    dailyTarget: dbCategory.daily_target,
    color: dbCategory.color,
  };
}

export function mapLogFromDB(dbLog: any): DailyLog {
  return {
    id: dbLog.id,
    categoryId: dbLog.category_id,
    date: dbLog.date,
    value: dbLog.value,
    notes: dbLog.notes,
  };
}
