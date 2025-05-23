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
    <Card className="w-full bg-background border-border">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle
          className="text-text text-lg sm:text-xl"
          role="heading"
          aria-level={2}
        >
          {log ? "Edit Log Entry" : "Add New Log Entry"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="space-y-3">
            <Label htmlFor="category" className="text-text block mb-1 text-sm">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-1">
            <Label htmlFor="value" className="text-text block mb-1 text-sm">
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
              className="w-full"
              required
            />
            {selectedCategory && (
              <p className="text-xs text-text-secondary mt-1">
                Daily target: {selectedCategory.dailyTarget}{" "}
                {selectedCategory.unit}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-1">
            <Label htmlFor="notes" className="text-text block mb-1 text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here"
              rows={3}
              className="min-h-[80px] w-full resize-none"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-4 sm:pt-6 px-4 sm:px-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!categoryId}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {log ? "Update" : "Add"} Log Entry
          </Button>
        </CardFooter>
      </form>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <p className="text-xs text-text-secondary">
          {log
            ? "Last updated: " + new Date(log.date).toLocaleString()
            : "Note: All fields are required."}
        </p>
      </div>
    </Card>
  );
};

export default LogEntryForm;
