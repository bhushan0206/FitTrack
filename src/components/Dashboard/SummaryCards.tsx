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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-background border-border">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="text-xl sm:text-2xl font-bold text-text">
            {completedCategories}/{categories.length}
          </div>
          <p className="text-text-secondary text-sm sm:text-base">
            Categories Completed Today
          </p>
          <div className="w-full bg-background-secondary rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background border-border">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="text-xl sm:text-2xl font-bold text-text">
            {todayLogs.length}
          </div>
          <p className="text-text-secondary text-sm sm:text-base">
            Entries Logged Today
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background border-border sm:col-span-2 lg:col-span-1">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="text-lg sm:text-2xl font-bold text-text">
            {format(selectedDate, "MMM d, yyyy")}
          </div>
          <p className="text-text-secondary text-sm sm:text-base">
            Current Date
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
