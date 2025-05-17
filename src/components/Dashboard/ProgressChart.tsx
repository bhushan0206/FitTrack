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
      percentage: selectedCategory
        ? (value / selectedCategory.dailyTarget) * 100
        : 0,
    };
  });

  if (categories.length === 0) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Add categories to see progress charts
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weekly Progress</CardTitle>
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
        <div className="h-[200px] flex items-end justify-between gap-2">
          {chartData.map((day) => {
            const height = `${Math.min(day.percentage, 100)}%`;
            const bgColor =
              day.percentage >= 100 ? "bg-green-500" : "bg-blue-500";

            return (
              <div
                key={day.dateString}
                className="flex flex-col items-center flex-1"
              >
                <div className="w-full h-full relative flex flex-col justify-end">
                  <div
                    className={`w-full ${bgColor} rounded-t-sm transition-all duration-300`}
                    style={{ height }}
                  ></div>
                </div>
                <div className="text-xs mt-2 text-center">
                  {format(day.date, "EEE")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(day.date, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-4 text-center text-sm">
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
