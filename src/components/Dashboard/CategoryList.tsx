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
    <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
        <CardTitle className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏷️</span>
          Categories
        </CardTitle>
        <Button
          onClick={onAdd}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 hover:from-purple-600 hover:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800 text-white font-medium px-6 py-2 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Category
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No categories yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create your first category to start tracking!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-5 rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-600/50 shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  borderLeft: `5px solid ${category.color}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {category.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="h-9 w-9 p-0 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-gray-50/50 to-purple-50/50 dark:from-gray-600/50 dark:to-purple-900/30 rounded-lg border border-gray-100/50 dark:border-gray-600/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                        Daily Target
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {category.dailyTarget} {category.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                      Measured in {category.unit}
                    </span>
                  </div>
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
