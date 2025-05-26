import React from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface SummaryCardsProps {
  logs: DailyLog[];
  categories: TrackingCategory[];
  selectedDate: Date;
}

const SummaryCards = ({
  logs,
  categories,
  selectedDate,
}: SummaryCardsProps) => {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const todayLogs = logs.filter((log) => log.date === dateString);

  // Calculate completion percentage for each category
  const categoryStats = categories.map((category) => {
    const categoryLogs = todayLogs.filter(
      (log) => log.categoryId === category.id,
    );
    const totalValue = categoryLogs.reduce((sum, log) => sum + log.value, 0);
    const percentage = (totalValue / category.dailyTarget) * 100;

    return {
      ...category,
      currentValue: totalValue,
      percentage,
      completed: percentage >= 100,
    };
  });

  // Overall completion percentage
  const completedCategories = categoryStats.filter(
    (stat) => stat.completed,
  ).length;
  const overallPercentage =
    categories.length > 0 ? (completedCategories / categories.length) * 100 : 0;

  // Calculate streak or add another useful metric
  const totalProgress = categoryStats.reduce((sum, stat) => sum + stat.currentValue, 0);

  return (
    <div className="grid grid-cols-2 gap-2 w-full"> 
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 border-0 shadow-md w-full">
        <CardContent className="p-2 sm:p-3"> 
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {completedCategories}/{categories.length}
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                Goals Completed
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">✓</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1.5 sm:mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            {Math.round(overallPercentage)}% Complete
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border-0 shadow-md w-full">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {todayLogs.length}
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-300 font-medium">
                Activities
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm">📊</span>
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium">
              Total Value: {totalProgress}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
