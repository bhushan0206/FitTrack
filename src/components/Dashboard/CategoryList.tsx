import { TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";

interface CategoryListProps {
  categories: TrackingCategory[];
  onEdit: (category: TrackingCategory) => void;
  onDelete: (categoryId: string) => void;
  onAdd: () => void;
}

const CategoryList = ({
  categories,
  onEdit,
  onDelete,
  onAdd,
}: CategoryListProps) => {
  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tracking Categories</CardTitle>
        <Button onClick={onAdd} size="sm" className="flex items-center gap-1">
          <Plus size={16} />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories yet. Add your first tracking category.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-md border"
                style={{
                  borderLeftColor: category.color,
                  borderLeftWidth: "4px",
                }}
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Target: {category.dailyTarget} {category.unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(category.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
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

export default CategoryList;
