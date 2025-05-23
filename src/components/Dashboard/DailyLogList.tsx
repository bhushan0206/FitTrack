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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text">
          Daily Logs - {format(selectedDate, "MMMM d, yyyy")}
        </CardTitle>
        <Button onClick={onAdd} size="sm" className="flex items-center gap-1">
          <Plus size={16} />
          Add Log
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No logs for this date. Add your first log entry.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const category = getCategoryById(log.categoryId);
              if (!category) return null;

              const progress = (log.value / category.dailyTarget) * 100;
              const progressColor =
                progress >= 100 ? "bg-primary" : "bg-primary/60";

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-md border border-border bg-background-secondary"
                  style={{
                    borderLeftColor: category?.color || "#3b82f6",
                    borderLeftWidth: "4px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-text">{category?.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(log)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(log.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">
                      {log.value} / {category?.dailyTarget} {category?.unit}
                    </span>
                    <span className="text-sm font-medium text-text-secondary">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className={`${progressColor} h-2 rounded-full`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  {log.notes && (
                    <p className="mt-2 text-sm text-text-secondary">
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
