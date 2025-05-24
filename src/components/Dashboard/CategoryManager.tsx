import React from "react";
import { TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

interface CategoryManagerProps {
  categories: TrackingCategory[];
  onCategoryUpdate: () => void;
  onEdit?: (category: TrackingCategory) => void;
  onDelete?: (categoryId: string) => void;
  onAdd?: () => void;
}

const CategoryManager = ({ 
  categories, 
  onCategoryUpdate, 
  onEdit,
  onDelete,
  onAdd
}: CategoryManagerProps) => {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏷️</span>
          Categories
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
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No categories yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create your first category to start tracking
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-100 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Target: {category.dailyTarget} {category.unit}/day
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
