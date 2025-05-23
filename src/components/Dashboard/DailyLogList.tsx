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
    <Card className="w-full bg-background border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-4 sm:px-6">
        <CardTitle className="text-text text-lg sm:text-xl">
          <span className="hidden sm:inline">
            Daily Logs - {format(selectedDate, "MMMM d, yyyy")}
          </span>
          <span className="sm:hidden">
            Daily Logs - {format(selectedDate, "MMM d")}
          </span>
        </CardTitle>
        <Button
          onClick={onAdd}
          size="sm"
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Log
        </Button>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {logs.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-text-secondary">
            <p className="text-sm sm:text-base">No logs for this date.</p>
            <p className="text-sm">Add your first log entry.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {logs.map((log) => {
              const category = getCategoryById(log.categoryId);
              if (!category) return null;

              const progress = (log.value / category.dailyTarget) * 100;
              const progressColor =
                progress >= 100 ? "bg-primary" : "bg-primary/60";

              return (
                <div
                  key={log.id}
                  className="p-3 sm:p-4 rounded-md border border-border bg-background-secondary"
                  style={{
                    borderLeftColor: category?.color || "#3b82f6",
                    borderLeftWidth: "4px",
                  }}
                >
                  <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                    <h3 className="font-medium text-text text-sm sm:text-base">
                      {category?.name}
                    </h3>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(log)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(log.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                    <span className="text-xs sm:text-sm text-text-secondary">
                      {log.value} / {category?.dailyTarget} {category?.unit}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-text-secondary">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  {log.notes && (
                    <p className="mt-2 text-xs sm:text-sm text-text-secondary break-words">
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
