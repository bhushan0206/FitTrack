import { useState } from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { generateId } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LogEntryFormProps {
  categories: TrackingCategory[];
  onSave: (log: DailyLog) => void;
  log?: DailyLog;
  onCancel?: () => void;
  selectedDate: string;
}

const LogEntryForm = ({
  categories,
  onSave,
  log,
  onCancel,
  selectedDate,
}: LogEntryFormProps) => {
  const [categoryId, setCategoryId] = useState(log?.categoryId || "");
  const [value, setValue] = useState(log?.value?.toString() || "");
  const [notes, setNotes] = useState(log?.notes || "");

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: DailyLog = {
      id: log?.id || generateId(),
      categoryId,
      date: selectedDate,
      value: parseFloat(value) || 0,
      notes: notes || undefined,
    };

    onSave(newLog);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-0 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">📝</span>
          {log ? "Edit Log Entry" : "Add New Log Entry"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl">
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/80 rounded-lg mx-1 text-gray-800 dark:text-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="value" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Value {selectedCategory ? `(${selectedCategory.unit})` : ""}
            </Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                selectedCategory
                  ? `Enter ${selectedCategory.unit}`
                  : "Enter value"
              }
              className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
              required
            />
            {selectedCategory && (
              <div className="p-3 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-700/50 dark:to-blue-900/30 rounded-lg border border-gray-100/50 dark:border-gray-600/50">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Daily target: {selectedCategory.dailyTarget} {selectedCategory.unit}
                </p>
                {value && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Progress: {Math.round((parseFloat(value) / selectedCategory.dailyTarget) * 100)}% of daily goal
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here..."
              rows={3}
              className="min-h-[80px] w-full resize-none bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 px-6 py-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1 rounded-xl border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!categoryId}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white rounded-xl shadow-lg"
          >
            {log ? "Update" : "Add"} Log Entry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LogEntryForm;
