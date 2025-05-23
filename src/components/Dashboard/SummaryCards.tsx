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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {completedCategories}/{categories.length}
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Categories Completed
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {Math.round(overallPercentage)}% Complete
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {todayLogs.length}
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Entries Logged
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-medium">Today's Activity</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm md:col-span-2 lg:col-span-1">
        <CardContent className="pt-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900 mb-1">
                {format(selectedDate, "MMM d, yyyy")}
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Current Date
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📅</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-medium">
              {format(selectedDate, "EEEE")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
