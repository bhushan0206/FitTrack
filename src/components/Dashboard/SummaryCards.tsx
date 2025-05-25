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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Reduced gap from gap-6 to gap-4 */}
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-4 px-4"> {/* Reduced padding from pt-6 px-6 to pt-4 px-4 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {completedCategories}/{categories.length}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                Goals Completed
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {Math.round(overallPercentage)}% Complete
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-4 px-4"> {/* Reduced padding */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {todayLogs.length}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                Activities Logged
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Total Value: {totalProgress}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
