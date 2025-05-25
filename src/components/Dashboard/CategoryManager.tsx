import React, { useState } from "react";
import { TrackingCategory } from "@/types/fitness";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Pencil, Trash2 } from "lucide-react";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";

interface CategoryManagerProps {
  categories: TrackingCategory[];
  onCategoryUpdate: (category: TrackingCategory) => Promise<boolean>;
  onEdit?: (category: TrackingCategory) => void;
  onDelete?: (categoryId: string) => Promise<void>;
  onAdd?: (e?: any) => void;
}

const CategoryManager = ({ 
  categories, 
  onCategoryUpdate, 
}: CategoryManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TrackingCategory | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: TrackingCategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    // You should implement the actual delete logic here, e.g. call a prop or context
    if (window.confirm("Are you sure you want to delete this category?")) {
      // Fake category object for update callback
      await onCategoryUpdate({ id: categoryId } as TrackingCategory);
    }
  };

  const handleFormSave = async (category: TrackingCategory) => {
    await onCategoryUpdate(category);
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-purple-600" />
          Manage Categories
        </CardTitle>
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6">
            <CategoryForm
              category={editingCategory || undefined}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              existingCategories={categories}
            />
          </div>
        )}
        <div className="flex flex-col gap-4">
          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏋️</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                No categories yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Create your first category to start tracking!
              </p>
            </div>
          )}
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border-0 bg-gradient-to-br from-white to-gray-50/70 dark:from-gray-700 dark:to-gray-800/70 shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderLeft: `6px solid ${category.color}`,
                minWidth: 0,
                wordBreak: "break-word",
              }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-5 h-5 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      Target: <span className="font-semibold text-gray-800 dark:text-white">{category.dailyTarget} {category.unit}</span>
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span className="truncate">Measured in {category.unit}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
