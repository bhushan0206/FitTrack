import React, { useState } from "react";
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
  existingCategories?: TrackingCategory[];
}

const CategoryForm = ({ onSave, category, onCancel, existingCategories = [] }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || "");
  const [unit, setUnit] = useState(category?.unit || "");
  const [dailyTarget, setDailyTarget] = useState(
    category?.dailyTarget?.toString() || "",
  );
  const [color, setColor] = useState(category?.color || "#3b82f6");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (process.env.NODE_ENV === 'development') {
      console.log('Category form submitted');
    }

    if (!name.trim() || !unit.trim() || !dailyTarget) {
      console.log('Validation failed');
      setError("Please fill in all required fields");
      return;
    }

    // Check for duplicate category names (excluding the current category if editing)
    const isDuplicate = existingCategories.some(
      existingCategory => 
        existingCategory.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        existingCategory.id !== category?.id
    );

    if (isDuplicate) {
      setError(`A category named "${name.trim()}" already exists. Please choose a different name.`);
      return;
    }

    // Clear any previous errors
    setError("");

    const newCategory: TrackingCategory = {
      id: category?.id || generateId(),
      name: name.trim(),
      unit: unit.trim(),
      dailyTarget: parseFloat(dailyTarget) || 0,
      color,
    };

    console.log('Saving category:', newCategory);
    onSave(newCategory);
  };

  // Clear error when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 border-0 shadow-lg backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="pb-4 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          {category ? "Edit Category" : "Add New Category"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6 py-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Category Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Steps, Water, Workout"
              className={`w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white ${
                error && error.includes('already exists') ? 'border-red-300 dark:border-red-600' : ''
              }`}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Unit of Measurement
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., steps, glasses, minutes"
              className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="target" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Daily Target
            </Label>
            <Input
              id="target"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              placeholder="e.g., 10000, 8, 30"
              className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="color" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Color Theme
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-14 h-12 p-1 rounded-xl border-2 border-gray-200/50 dark:border-gray-600/50 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Category form cancelled');
                onCancel();
              }}
              className="w-full sm:w-auto order-2 sm:order-1 rounded-xl border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!name.trim() || !unit.trim() || !dailyTarget}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 hover:from-purple-600 hover:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800 text-white rounded-xl shadow-lg disabled:opacity-50"
          >
            {category ? "Update" : "Add"} Category
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CategoryForm;
