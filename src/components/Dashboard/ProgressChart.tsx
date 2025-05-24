import React, { useState, useEffect } from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { ExerciseLog } from "@/types/exercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface ProgressChartProps {
  logs: DailyLog[];
  categories: TrackingCategory[];
  exerciseLogs?: ExerciseLog[];
}

type ChartMode = "categories" | "exercises" | "combined";

const ProgressChart = ({
  logs,
  categories,
  exerciseLogs = [],
}: ProgressChartProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories.length > 0 ? categories[0].id : "",
  );
  const [chartMode, setChartMode] = useState<ChartMode>("combined");

  // Update selected category when categories change
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Get the last 7 days
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  // Format data for category chart
  const categoryChartData = last7Days.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayLogs = logs.filter(
      (log) => log.date === dateString && log.categoryId === selectedCategoryId,
    );

    const value = dayLogs.reduce((sum, log) => sum + log.value, 0);

    return {
      date,
      dateString,
      value,
      target: selectedCategory?.dailyTarget || 0,
      percentage:
        selectedCategory && selectedCategory.dailyTarget > 0
          ? (value / selectedCategory.dailyTarget) * 100
          : 0,
    };
  });

  // Format data for exercise chart
  const exerciseChartData = last7Days.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayExerciseLogs = exerciseLogs.filter(
      (log) => log.date === dateString,
    );

    const totalMinutes = dayExerciseLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalCalories = dayExerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const exerciseCount = dayExerciseLogs.length;

    // Target is 30 minutes per day (recommended daily exercise)
    const dailyMinuteTarget = 30;
    const minutePercentage = (totalMinutes / dailyMinuteTarget) * 100;

    return {
      date,
      dateString,
      value: totalMinutes,
      target: dailyMinuteTarget,
      percentage: minutePercentage,
      calories: totalCalories,
      exerciseCount,
    };
  });

  // Combined data for unified view
  const combinedChartData = last7Days.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Category progress
    const completedCategories = categories.filter(category => {
      const dayLogs = logs.filter(
        (log) => log.date === dateString && log.categoryId === category.id,
      );
      const value = dayLogs.reduce((sum, log) => sum + log.value, 0);
      return value >= category.dailyTarget;
    }).length;
    const categoryPercentage = categories.length > 0 ? (completedCategories / categories.length) * 100 : 0;

    // Exercise progress
    const dayExerciseLogs = exerciseLogs.filter((log) => log.date === dateString);
    const totalMinutes = dayExerciseLogs.reduce((sum, log) => sum + log.duration, 0);
    const exercisePercentage = (totalMinutes / 30) * 100; // 30 min target

    // Combined score (average of both)
    const combinedPercentage = (categoryPercentage + exercisePercentage) / 2;

    return {
      date,
      dateString,
      categoryPercentage,
      exercisePercentage,
      combinedPercentage,
      completedCategories,
      totalCategories: categories.length,
      exerciseMinutes: totalMinutes,
      exerciseCount: dayExerciseLogs.length,
      calories: dayExerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
    };
  });

  const getChartData = () => {
    switch (chartMode) {
      case "categories":
        return categoryChartData;
      case "exercises":
        return exerciseChartData;
      case "combined":
        return combinedChartData;
      default:
        return combinedChartData;
    }
  };

  const chartData = getChartData();

  if (categories.length === 0 && exerciseLogs.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-indigo-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">No Data Yet</p>
            <p className="text-gray-500 text-sm">
              Add categories or log exercises to see progress charts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Weekly Progress
          </CardTitle>

          {/* Chart Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartMode("combined")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartMode === "combined"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Combined
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartMode("categories")}
              disabled={categories.length === 0}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartMode === "categories"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Categories
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChartMode("exercises")}
              disabled={exerciseLogs.length === 0}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                chartMode === "exercises"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Exercises
            </Button>
          </div>
        </div>

        {/* Category Selector (only show for categories mode) */}
        {chartMode === "categories" && categories.length > 0 && (
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="w-full sm:w-[220px] bg-white/90 dark:bg-gray-700/90 border-gray-200/50 dark:border-gray-600/50 rounded-xl font-medium text-gray-900 dark:text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl">
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/80 rounded-lg mx-1 font-medium text-gray-800 dark:text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-4 border border-gray-100/50 dark:border-gray-600/50">
          <div className="h-[180px] sm:h-[220px] flex items-end justify-between gap-2 sm:gap-3">
            {chartData.map((day, index) => {
              const isToday = index === chartData.length - 1;
              
              let height, isCompleted, barColor, tooltipText;

              if (chartMode === "combined") {
                const combinedDay = day as any;
                height = Math.max(Math.min(combinedDay.combinedPercentage, 100), 8);
                isCompleted = combinedDay.combinedPercentage >= 100;
                barColor = isCompleted ? "from-green-400 to-green-500" : "from-indigo-400 to-purple-500";
                tooltipText = `Categories: ${combinedDay.completedCategories}/${combinedDay.totalCategories} • Exercise: ${combinedDay.exerciseMinutes}min • ${Math.round(combinedDay.combinedPercentage)}%`;
              } else if (chartMode === "exercises") {
                const exerciseDay = day as any;
                height = Math.max(Math.min(exerciseDay.percentage, 100), 8);
                isCompleted = exerciseDay.percentage >= 100;
                barColor = isCompleted ? "from-green-400 to-green-500" : "from-purple-400 to-purple-500";
                tooltipText = `${exerciseDay.value} min • ${exerciseDay.calories} cal • ${exerciseDay.exerciseCount} exercises (${Math.round(exerciseDay.percentage)}%)`;
              } else {
                const categoryDay = day as any;
                height = Math.max(Math.min(categoryDay.percentage, 100), 8);
                isCompleted = categoryDay.percentage >= 100;
                barColor = isCompleted ? "from-green-400 to-green-500" : selectedCategory?.color ? `from-gray-300 to-[${selectedCategory.color}]` : "from-gray-300 to-indigo-400";
                tooltipText = `${categoryDay.value} / ${categoryDay.target} ${selectedCategory?.unit || ""} (${Math.round(categoryDay.percentage)}%)`;
              }

              return (
                <div
                  key={day.dateString}
                  className="flex flex-col items-center flex-1 min-w-0 group"
                >
                  <div className="w-full h-full relative flex flex-col justify-end mb-2">
                    {/* Combined mode shows stacked bars */}
                    {chartMode === "combined" ? (
                      <div className="w-full h-full relative flex flex-col justify-end">
                        {/* Exercise bar (bottom) */}
                        <div
                          className="w-full bg-gradient-to-t from-purple-400 to-purple-500 transition-all duration-500 ease-out"
                          style={{
                            height: `${Math.max(Math.min((day as any).exercisePercentage, 100), 4)}%`,
                          }}
                        />
                        {/* Category bar (top) */}
                        <div
                          className="w-full bg-gradient-to-t from-indigo-400 to-indigo-500 transition-all duration-500 ease-out"
                          style={{
                            height: `${Math.max(Math.min((day as any).categoryPercentage, 100), 4)}%`,
                          }}
                        />
                        {/* Completion indicator */}
                        {(day as any).combinedPercentage >= 100 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ease-out min-h-[8px] shadow-sm bg-gradient-to-t ${barColor} ${
                          isToday ? "ring-2 ring-indigo-300 ring-offset-2" : ""
                        } group-hover:shadow-md`}
                        style={{
                          height: `${height}%`,
                          backgroundColor: !isCompleted && chartMode === "categories" ? selectedCategory?.color || "#6366f1" : undefined,
                        }}
                        title={tooltipText}
                      />
                    )}

                    {/* Completion indicator for single modes */}
                    {chartMode !== "combined" && isCompleted && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Day label */}
                  <div
                    className={`text-xs font-bold text-center ${
                      isToday ? "text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-lg" : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {format(day.date, "EEE")}
                  </div>
                  <div
                    className={`text-xs text-center font-semibold ${
                      isToday ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {format(day.date, "d")}
                  </div>

                  {/* Value display */}
                  <div className="text-xs text-gray-700 dark:text-gray-300 text-center mt-1 font-bold hidden sm:block bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    {chartMode === "combined" 
                      ? `${Math.round((day as any).combinedPercentage)}%`
                      : chartMode === "exercises"
                      ? (day as any).value > 0 ? `${(day as any).value}m` : "—"
                      : (day as any).value > 0 ? (day as any).value : "—"
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm">
          {chartMode === "categories" && selectedCategory ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-md border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {selectedCategory.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Target: {selectedCategory.dailyTarget} {selectedCategory.unit}/day
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Weekly Goal: {selectedCategory.dailyTarget * 7} {selectedCategory.unit}
                </div>
              </div>
            </div>
          ) : chartMode === "exercises" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full shadow-md border-2 border-white dark:border-gray-800 bg-purple-500" />
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  Exercise Minutes
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Target: 30 minutes/day
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Weekly Goal: 210 minutes
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-5 rounded-sm shadow-md border border-white dark:border-gray-800 bg-indigo-500" />
                  <div className="w-3 h-5 rounded-sm shadow-md border border-white dark:border-gray-800 bg-purple-500" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  Combined Progress
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Categories + Exercises
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Balanced fitness tracking
                </div>
              </div>
            </div>
          )}

          {/* Stats section */}
          {chartMode === "exercises" && (
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {exerciseChartData.reduce((sum, day) => sum + day.value, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Minutes
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {exerciseChartData.reduce((sum, day) => sum + (day as any).calories, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Calories
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {exerciseChartData.reduce((sum, day) => sum + (day as any).exerciseCount, 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Exercises
                </div>
              </div>
            </div>
          )}

          {/* Combined mode legend */}
          {chartMode === "combined" && (
            <div className="mt-4 flex items-center justify-center gap-6 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-t from-indigo-400 to-indigo-500 rounded-sm" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gradient-to-t from-purple-400 to-purple-500 rounded-sm" />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Exercises</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
