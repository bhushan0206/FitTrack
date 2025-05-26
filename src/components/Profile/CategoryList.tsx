import React, { useState } from "react";
import { TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { deleteCategory } from "@/lib/supabaseStorage";
import { useToast } from "@/components/ui/use-toast";
import CategoryForm from "./CategoryForm";

interface CategoryListProps {
  categories: TrackingCategory[];
  onEdit: (category: TrackingCategory) => void;
  onDelete: (categoryId: string) => Promise<boolean>;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<TrackingCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeleting(categoryId);
      const success = await deleteCategory(categoryId); // Remove userId parameter
      onDelete(categoryId); // Notify parent component about the deletion
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete category: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditCategory = (category: TrackingCategory) => {
    setEditingCategory(category);
    setIsAddingCategory(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  const handleCategoryFormClose = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleCategorySaved = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
    // Add any necessary logic here or remove this function call
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <Button onClick={handleAddCategory} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {categories && categories.length > 0 ? (
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
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={isDeleting === category.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No categories yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your first category to start tracking!
            </p>
          </div>
        )}
      </CardContent>
      {isAddingCategory && (
        <CategoryForm
          onClose={handleCategoryFormClose}
          onSave={handleCategorySaved}
          category={editingCategory}
        />
      )}
    </Card>
  );
};

export default CategoryList;
