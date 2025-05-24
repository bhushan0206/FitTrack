import React from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface DailyLogListProps {
  logs: DailyLog[];
  categories: TrackingCategory[];
  onEdit: (log: DailyLog) => void;
  onDelete: (logId: string) => void;
  onAdd: () => void;
  selectedDate: Date;
}

const DailyLogList = ({
  logs,
  categories,
  onEdit,
  onDelete,
  onAdd,
  selectedDate,
}: DailyLogListProps) => {
  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
        <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">
          <span className="hidden sm:inline">
            Daily Logs - {format(selectedDate, "MMMM d, yyyy")}
          </span>
          <span className="sm:hidden">
            Daily Logs - {format(selectedDate, "MMM d")}
          </span>
        </CardTitle>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd();
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white font-medium px-6 py-2 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Log
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No logs for this date
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start tracking your progress today!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const category = getCategoryById(log.categoryId);
              if (!category) return null;

              const progress = (log.value / category.dailyTarget) * 100;

              return (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl border-0 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-600/50 shadow-md hover:shadow-lg transition-all duration-300"
                  style={{
                    borderLeft: `5px solid ${category?.color || "#3b82f6"}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      ></div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {category?.name}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(log);
                        }}
                        className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(log.id);
                        }}
                        className="h-9 w-9 p-0 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {log.value} / {category?.dailyTarget} {category?.unit}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        background: `linear-gradient(90deg, ${category?.color}aa, ${category?.color})`,
                      }}
                    ></div>
                  </div>

                  {log.notes && (
                    <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-600/50 p-3 rounded-lg border-l-3 border-gray-200 dark:border-gray-500">
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
