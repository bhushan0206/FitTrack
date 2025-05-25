import React, { useState } from "react";
import { TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";

interface CategoryManagerProps {
  categories: TrackingCategory[];
  onEdit: (category: TrackingCategory) => void;
  onDelete: (categoryId: string) => Promise<boolean>;
  onAdd?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEdit = (category: TrackingCategory) => {
    onEdit(category);
  };

  const handleDelete = async (categoryId: string) => {
    setDeleting(categoryId);
    try {
      const success = await onDelete(categoryId);
      if (!success) {
        console.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Manage Categories
        </CardTitle>
        {onAdd && (
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No categories yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your first category to start tracking!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Target: {category.dailyTarget} {category.unit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                  >
                    {deleting === category.id ? (
                      <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
