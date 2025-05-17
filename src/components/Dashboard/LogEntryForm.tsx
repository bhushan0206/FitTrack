import { useState } from "react";
import { DailyLog, TrackingCategory } from "@/types/fitness";
import { generateId } from "@/lib/storage";
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
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>{log ? "Edit Log Entry" : "Add New Log Entry"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
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
              required
            />
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                Daily target: {selectedCategory.dailyTarget}{" "}
                {selectedCategory.unit}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!categoryId}>
            {log ? "Update" : "Add"} Log Entry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LogEntryForm;
