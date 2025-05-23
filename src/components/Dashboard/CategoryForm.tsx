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
    <Card className="w-full bg-gradient-to-br from-white to-purple-50/30 border-0 shadow-lg backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="pb-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏷️</span>
          {category ? "Edit Category" : "Add New Category"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-gray-700 font-medium text-sm">
              Category Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Steps, Water, Workout"
              className="w-full bg-white/80 border-gray-200/50 rounded-xl"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="unit" className="text-gray-700 font-medium text-sm">
              Unit of Measurement
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., steps, glasses, minutes"
              className="w-full bg-white/80 border-gray-200/50 rounded-xl"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="target" className="text-gray-700 font-medium text-sm">
              Daily Target
            </Label>
            <Input
              id="target"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              placeholder="e.g., 10000, 8, 30"
              className="w-full bg-white/80 border-gray-200/50 rounded-xl"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="color" className="text-gray-700 font-medium text-sm">
              Color Theme
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-14 h-12 p-1 rounded-xl border-2 border-gray-200/50 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-white/80 border-gray-200/50 rounded-xl"
                placeholder="#3b82f6"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'].map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 px-6 py-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1 rounded-xl border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg"
          >
            {category ? "Update" : "Add"} Category
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
