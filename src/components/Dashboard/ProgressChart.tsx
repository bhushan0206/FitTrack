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
      <Card className="w-full bg-background border-border">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-text-secondary">
            Add categories to see progress charts
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text">Weekly Progress</CardTitle>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end justify-between gap-2 p-4">
          {chartData.map((day) => {
            const height = Math.max(Math.min(day.percentage, 100), 5); // Minimum 5% for visibility
            const bgColor =
              day.percentage >= 100 ? "bg-primary" : "bg-primary/60";

            return (
              <div
                key={day.dateString}
                className="flex flex-col items-center flex-1 min-w-0"
              >
                <div className="w-full h-full relative flex flex-col justify-end mb-2">
                  <div
                    className={`w-full ${bgColor} rounded-t-sm transition-all duration-300 min-h-[4px]`}
                    style={{ height: `${height}%` }}
                    title={`${day.value} / ${day.target} ${
                      selectedCategory?.unit || ""
                    }`}
                  ></div>
                </div>
                <div className="text-xs font-medium text-text text-center">
                  {format(day.date, "EEE")}
                </div>
                <div className="text-xs text-text-secondary text-center">
                  {format(day.date, "d")}
                </div>
                <div className="text-xs text-text-secondary text-center mt-1">
                  {day.value}
                </div>
              </div>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-4 text-center text-sm text-text border-t border-border pt-4">
            <span className="font-medium">{selectedCategory.name}</span> -
            Target: {selectedCategory.dailyTarget} {selectedCategory.unit} per
            day
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
