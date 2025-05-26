import React, { useState } from "react";
import { TrackingCategory } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { deleteCategory } from "@/lib/supabaseStorage";
import { useToast } from "@/components/ui/use-toast";
import CategoryForm from "./CategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, Scale, Activity, Ruler, Check } from "lucide-react";

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<null | any>(null);
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

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      // Logic to create a category from the selected template
      // This will depend on how your templates and categories are structured
      console.log("Selected Template:", selectedTemplate);
      toast({
        title: "Template Selected",
        description: `You have selected the "${selectedTemplate.name}" template.`,
      });
    }
  };

  const handleCreateCustom = () => {
    setShowTemplates(false);
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  const templates: TrackingCategory[] = [
    {
      id: "water-intake",
      name: "Water Intake",
      unit: "glasses",
      dailyTarget: 8,
      color: "#3B82F6",
      exerciseType: "hydration",
    },
    {
      id: "steps",
      name: "Daily Steps",
      unit: "steps",
      dailyTarget: 10000,
      color: "#10B981",
      exerciseType: "cardio",
    },
    {
      id: "sleep",
      name: "Sleep Hours",
      unit: "hours",
      dailyTarget: 8,
      color: "#8B5CF6",
      exerciseType: "recovery",
    },
    {
      id: "meditation",
      name: "Meditation",
      unit: "minutes",
      dailyTarget: 15,
      color: "#F59E0B",
      exerciseType: "mindfulness",
    },
    {
      id: "push-ups",
      name: "Push-ups",
      unit: "reps",
      dailyTarget: 30,
      color: "#EF4444",
      exerciseType: "strength",
    },
    {
      id: "running",
      name: "Running",
      unit: "minutes",
      dailyTarget: 30,
      color: "#06B6D4",
      exerciseType: "cardio",
    },
    {
      id: "weight-lifting",
      name: "Weight Lifting",
      unit: "minutes",
      dailyTarget: 45,
      color: "#DC2626",
      exerciseType: "strength",
    },
    {
      id: "yoga",
      name: "Yoga",
      unit: "minutes",
      dailyTarget: 20,
      color: "#7C3AED",
      exerciseType: "flexibility",
    },
    // Swimming category templates
    {
      id: "swimming-laps",
      name: "Swimming Laps",
      unit: "laps",
      dailyTarget: 20,
      color: "#0EA5E9",
      exerciseType: "cardio",
    },
    {
      id: "swimming-distance",
      name: "Swimming Distance",
      unit: "meters",
      dailyTarget: 1000,
      color: "#0284C7",
      exerciseType: "cardio",
    },
    {
      id: "swimming-time",
      name: "Swimming Duration",
      unit: "minutes",
      dailyTarget: 30,
      color: "#0369A1",
      exerciseType: "cardio",
    },
    {
      id: "freestyle-laps",
      name: "Freestyle Laps",
      unit: "laps",
      dailyTarget: 15,
      color: "#38BDF8",
      exerciseType: "cardio",
    },
    {
      id: "backstroke-laps",
      name: "Backstroke Laps",
      unit: "laps",
      dailyTarget: 10,
      color: "#0891B2",
      exerciseType: "cardio",
    },
    {
      id: "breaststroke-laps",
      name: "Breaststroke Laps",
      unit: "laps",
      dailyTarget: 8,
      color: "#0E7490",
      exerciseType: "cardio",
    },
    {
      id: "water-treading",
      name: "Water Treading",
      unit: "minutes",
      dailyTarget: 10,
      color: "#155E75",
      exerciseType: "cardio",
    },
    {
      id: "pool-running",
      name: "Pool Running",
      unit: "minutes",
      dailyTarget: 20,
      color: "#164E63",
      exerciseType: "cardio",
    },
  ];

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

      {/* Category Template Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Choose a Category Template
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Select from our pre-built category templates or create your own
              custom category.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={handleCreateCustom}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Category
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTemplates(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>

            {/* Templates Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Popular Templates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Selection Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Template Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg shadow-sm border-2 border-white dark:border-gray-800 flex items-center justify-center"
                          style={{ backgroundColor: template.color }}
                        >
                          <div className="w-3 h-3 bg-white/30 rounded-full" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {template.name}
                        </h4>
                      </div>
                    </div>

                    {/* Template Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Target:{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {template.dailyTarget} {template.unit}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                        >
                          {template.exerciseType}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        >
                          {template.unit}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Daily Progress</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: template.color,
                            width: "75%",
                            opacity: selectedTemplate?.id === template.id ? 1 : 0.7,
                          }}
                        />
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedTemplate && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleSelectTemplate}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Use This Template
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {templates.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No templates available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Create a custom category instead
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoryList;
