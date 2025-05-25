import { TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Pure display component: just shows categories, no actions
interface CategoryListProps {
  categories: TrackingCategory[];
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6">
        <CardTitle className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏋️</span>
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {categories.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-5 rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-600/50 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                style={{
                  borderLeft: `5px solid ${category.color}`,
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                    {category.name}
                  </h3>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-50/50 to-purple-50/50 dark:from-gray-600/50 dark:to-purple-900/30 rounded-lg border border-gray-100/50 dark:border-gray-600/50 mb-2">
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
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-medium text-sm truncate">
                    Measured in {category.unit}
                  </span>
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
