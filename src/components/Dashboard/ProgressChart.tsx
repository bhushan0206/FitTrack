import { useState, useEffect } from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface ProgressChartProps {
  logs: DailyLog[];
  categories: TrackingCategory[];
}

const ProgressChart = ({ logs, categories }: ProgressChartProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories.length > 0 ? categories[0].id : "",
  );

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

  // Format data for the chart
  const chartData = last7Days.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dayLogs = logs.filter(
      (log) => log.date === dateString && log.categoryId === selectedCategoryId,
    );

    // Sum all values for this category on this day
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

  if (categories.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-indigo-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">No Categories Yet</p>
            <p className="text-gray-500 text-sm">
              Add categories to see progress charts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
        <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Weekly Progress
        </CardTitle>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="w-full sm:w-[220px] bg-white/90 border-gray-200/50 rounded-xl font-medium">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-md border-gray-200/50 rounded-xl">
            {categories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.id}
                className="hover:bg-gray-50/80 rounded-lg mx-1 font-medium"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-800 font-medium">{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="bg-gradient-to-b from-gray-50/50 to-white rounded-xl p-4 border border-gray-100/50">
          <div className="h-[180px] sm:h-[220px] flex items-end justify-between gap-2 sm:gap-3">
            {chartData.map((day, index) => {
              const height = Math.max(Math.min(day.percentage, 100), 8);
              const isToday = index === chartData.length - 1;
              const isCompleted = day.percentage >= 100;

              return (
                <div
                  key={day.dateString}
                  className="flex flex-col items-center flex-1 min-w-0 group"
                >
                  <div className="w-full h-full relative flex flex-col justify-end mb-2">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out min-h-[8px] shadow-sm ${
                        isCompleted
                          ? "bg-gradient-to-t from-green-400 to-green-500"
                          : selectedCategory?.color
                          ? `bg-gradient-to-t from-gray-300 to-[${selectedCategory.color}]`
                          : "bg-gradient-to-t from-gray-300 to-indigo-400"
                      } ${isToday ? "ring-2 ring-indigo-300 ring-offset-2" : ""} group-hover:shadow-md`}
                      style={{
                        height: `${height}%`,
                        backgroundColor: isCompleted
                          ? undefined
                          : selectedCategory?.color || "#6366f1",
                      }}
                      title={`${
                        day.value
                      } / ${day.target} ${selectedCategory?.unit || ""} (${Math.round(
                        day.percentage,
                      )}%)`}
                    />

                    {/* Completion indicator */}
                    {isCompleted && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Day label - improved visibility */}
                  <div
                    className={`text-xs font-bold text-center ${
                      isToday ? "text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg" : "text-gray-800"
                    }`}
                  >
                    {format(day.date, "EEE")}
                  </div>
                  <div
                    className={`text-xs text-center font-semibold ${
                      isToday ? "text-indigo-600" : "text-gray-600"
                    }`}
                  >
                    {format(day.date, "d")}
                  </div>

                  {/* Value display - improved visibility */}
                  <div className="text-xs text-gray-700 text-center mt-1 font-bold hidden sm:block bg-gray-100 px-2 py-1 rounded">
                    {day.value > 0 ? day.value : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category info - improved styling */}
        {selectedCategory && (
          <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-md border-2 border-white"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="font-bold text-gray-900 text-lg">
                  {selectedCategory.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">
                  Target: {selectedCategory.dailyTarget} {selectedCategory.unit}/day
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Weekly Goal: {selectedCategory.dailyTarget * 7} {selectedCategory.unit}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
