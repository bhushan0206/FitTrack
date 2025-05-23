import { useState } from "react";
import { TrackingCategory } from "@/types/fitness";
import { generateId } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryFormProps {
  onSave: (category: TrackingCategory) => void;
  category?: TrackingCategory;
  onCancel?: () => void;
}

const CategoryForm = ({ onSave, category, onCancel }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || "");
  const [unit, setUnit] = useState(category?.unit || "");
  const [dailyTarget, setDailyTarget] = useState(
    category?.dailyTarget?.toString() || "",
  );
  const [color, setColor] = useState(category?.color || "#3b82f6");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCategory: TrackingCategory = {
      id: category?.id || generateId(),
      name,
      unit,
      dailyTarget: parseFloat(dailyTarget) || 0,
      color,
    };

    onSave(newCategory);
  };

  return (
    <Card className="w-full bg-background border-border max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-text">
          {category ? "Edit Category" : "Add New Category"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text">
              Category Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Steps, Water, Workout"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-text">
              Unit of Measurement
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., steps, glasses, minutes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-text">
              Daily Target
            </Label>
            <Input
              id="target"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              placeholder="e.g., 10000, 8, 30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-text">
              Color
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{category ? "Update" : "Add"} Category</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
