import React from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

interface DailyLogListProps {
  logs: DailyLog[];
  categories: TrackingCategory[];
  onEdit: (log: DailyLog) => void;
  onDelete: (logId: string) => void;
  onAdd: () => void;
  onUpdate?: (log: DailyLog) => void; // Add this optional prop
  selectedDate: Date;
}

const DailyLogList: React.FC<DailyLogListProps> = ({
  logs,
  categories,
  onEdit,
  onDelete,
  onAdd,
  onUpdate,
  selectedDate,
}) => {
  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  // Consolidate logs by categoryId
  const consolidatedLogs = Object.values(
    logs.reduce<Record<string, DailyLog>>((acc, log) => {
      if (!acc[log.categoryId]) {
        acc[log.categoryId] = { ...log };
      } else {
        acc[log.categoryId].value += log.value;
        // Merge notes, separated by newline if both exist
        if (log.notes) {
          acc[log.categoryId].notes = acc[log.categoryId].notes
            ? acc[log.categoryId].notes + "\n" + log.notes
            : log.notes;
        }
      }
      return acc;
    }, {})
  );

  const handleUpdateLog = (log: DailyLog) => {
    if (onUpdate) {
      onUpdate(log); // Use onUpdate if provided
    } else {
      onEdit(log); // Fallback to onEdit
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg w-full max-w-full">
      <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
        <CardTitle className="text-gray-900 dark:text-white text-sm sm:text-base font-bold flex items-center gap-1">
          <ClipboardList className="w-4 h-4 text-indigo-600" />
          <span className="hidden xs:inline">
            Daily Logs - {format(selectedDate, "MMMM d, yyyy")}
          </span>
          <span className="xs:hidden">
            Logs - {format(selectedDate, "MM/dd")}
          </span>
        </CardTitle>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd();
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs py-1 px-2 h-auto rounded-lg shadow-sm transition-all flex items-center gap-1 whitespace-nowrap w-full xs:w-auto"
          size="sm"
        >
          <Plus size={12} />
          Add Log
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
        {consolidatedLogs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
              No logs for this date
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Start tracking your progress today!
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {consolidatedLogs.map((log) => {
              const category = getCategoryById(log.categoryId);

              if (!category) return null;

              const progress = (log.value / category.dailyTarget) * 100;

              return (
                <div
                  key={log.categoryId}
                  className="p-2 sm:p-3 rounded-lg border-0 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-600/50 shadow-sm relative overflow-hidden"
                  style={{
                    borderLeft: `3px solid ${category?.color || "#3b82f6"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      ></div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(log);
                        }}
                        className="h-6 w-6 p-0 text-gray-600 dark:text-gray-300"
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(log.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 dark:text-red-400"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1 sm:mb-2 text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {log.value} / {category?.dailyTarget} {category?.unit}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                      className="h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        background: `linear-gradient(90deg, ${category?.color}aa, ${category?.color})`,
                      }}
                    ></div>
                  </div>

                  {log.notes && (
                    <p className="mt-1.5 sm:mt-2 text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs bg-gray-50 dark:bg-gray-600/50 p-1.5 sm:p-2 rounded-md border-l-2 border-gray-200 dark:border-gray-500 whitespace-pre-line break-words max-h-16 sm:max-h-20 overflow-y-auto">
                      {log.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyLogList;
