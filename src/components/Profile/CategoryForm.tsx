import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/use-toast";
import { TrackingCategory } from "@/types/fitness";
import { addCategory, updateCategory } from "@/lib/supabaseStorage";
import { generateId } from "@/lib/storage";

interface CategoryFormProps {
  category?: TrackingCategory | null;
  onClose: () => void;
  onSave: () => void;
}

const exerciseTypes = [
  { value: "cardio", label: "Cardio" },
  { value: "strength", label: "Strength" },
  { value: "yoga", label: "Yoga" },
  { value: "hiit", label: "HIIT" },
  { value: "other", label: "Other" },
];

const CategoryForm = ({ category, onClose, onSave }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || "");
  const [unit, setUnit] = useState(category?.unit || "");
  const [dailyTarget, setDailyTarget] = useState<number>(
    category?.dailyTarget || 0,
  );
  const [color, setColor] = useState(category?.color || "#3b82f6");
  const [exerciseType, setExerciseType] = useState<string>(
    category?.exerciseType || "other",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit || dailyTarget <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const categoryData: TrackingCategory = {
        id: category?.id || generateId(),
        name,
        unit,
        dailyTarget,
        color,
        exerciseType: exerciseType as any,
      };

      if (category) {
        await updateCategory(categoryData);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await addCategory(categoryData);
        toast({
          title: "Success",
          description: "Category added successfully",
        });
      }
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${category ? "update" : "add"} category: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 dark:bg-gray-800">
      <CardHeader>
        <CardTitle>{category ? "Edit" : "Add"} Category</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Steps, Water, Workout"
              disabled={isSubmitting}
              className="dark:bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., steps, glasses, minutes"
              disabled={isSubmitting}
              className="dark:bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyTarget">Daily Target</Label>
            <Input
              id="dailyTarget"
              type="number"
              min="1"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseInt(e.target.value) || 0)}
              placeholder="e.g., 10000"
              disabled={isSubmitting}
              className="dark:bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 dark:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseType">Exercise Type</Label>
            <Select
              value={exerciseType}
              onValueChange={setExerciseType}
              disabled={isSubmitting}
            >
              <SelectTrigger className="dark:bg-gray-700">
                <SelectValue placeholder="Select exercise type" />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : category ? "Update" : "Add"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
