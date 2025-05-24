import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { TrackingCategory, UserProfile } from "@/types/fitness";
import { deleteCategory } from "@/lib/supabaseStorage";
import { useToast } from "@/components/ui/use-toast";
import CategoryForm from "./CategoryForm";

interface CategoryListProps {
  profile: UserProfile;
  onUpdate: () => void;
}

const CategoryList = ({ profile, onUpdate }: CategoryListProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<TrackingCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsDeleting(categoryId);
      await deleteCategory(categoryId); // Remove userId parameter
      onUpdate();
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
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={handleAddCategory} className="flex items-center gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {isAddingCategory && (
        <CategoryForm
          onClose={handleCategoryFormClose}
          onSave={handleCategorySaved}
          category={editingCategory}
        />
      )}

      {profile.categories && profile.categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.categories.map((category) => (
            <Card key={category.id} className="dark:bg-gray-800">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    ></span>
                    {category.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isDeleting === category.id}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Target: {category.dailyTarget} {category.unit} per day
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {category.exerciseType || "other"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No categories yet. Add your first category to start tracking!</p>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
