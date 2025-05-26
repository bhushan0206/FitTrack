import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, TrendingUp, Target, Award, Lightbulb } from "lucide-react";
import { TrackingCategory } from "@/types/fitness";

interface CategoryManagerProps {
  categories: TrackingCategory[];
  onEdit: (category: TrackingCategory) => void;
  onDelete: (categoryId: string) => Promise<boolean>;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onEdit, onDelete }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TrackingCategory | null>(
    null
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    unit: "",
    dailyTarget: 0,
    color: "#3b82f6",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!showAddDialog && !editingCategory) {
      setNewCategory({
        name: "",
        unit: "",
        dailyTarget: 0,
        color: "#3b82f6",
      });
    }
  }, [showAddDialog, editingCategory]);

  // Category templates
  const CATEGORY_TEMPLATES = [
    { 
      name: 'Cardio', 
      unit: 'minutes', 
      target: 30, 
      color: '#ef4444', 
      icon: '🏃',
      description: 'Track your cardiovascular exercise'
    },
    { 
      name: 'Strength Training', 
      unit: 'sets', 
      target: 3, 
      color: '#8b5cf6', 
      icon: '💪',
      description: 'Monitor your strength training sessions'
    },
    { 
      name: 'Water Intake', 
      unit: 'glasses', 
      target: 8, 
      color: '#06b6d4', 
      icon: '💧',
      description: 'Stay hydrated throughout the day'
    },
    { 
      name: 'Steps', 
      unit: 'steps', 
      target: 10000, 
      color: '#10b981', 
      icon: '👟',
      description: 'Track your daily walking activity'
    },
    { 
      name: 'Sleep', 
      unit: 'hours', 
      target: 8, 
      color: '#6366f1', 
      icon: '😴',
      description: 'Monitor your sleep duration'
    },
    { 
      name: 'Meditation', 
      unit: 'minutes', 
      target: 15, 
      color: '#f59e0b', 
      icon: '🧘',
      description: 'Track your mindfulness practice'
    }
  ];

  const handleAddFromTemplate = (template: any) => {
    const categoryData: TrackingCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      name: template.name,
      unit: template.unit,
      dailyTarget: template.target,
      color: template.color
    };
    
    onEdit(categoryData);
    setShowTemplates(false);
  };

  const handleSaveCategory = () => {
    if (!newCategory.name || !newCategory.unit || newCategory.dailyTarget <= 0) return;

    if (editingCategory) {
      onEdit({
        ...editingCategory,
        ...newCategory
      });
      setEditingCategory(null);
    } else {
      const categoryId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      onEdit({
        id: categoryId,
        ...newCategory
      });
      setShowAddDialog(false);
    }

    // Reset form
    setNewCategory({
      name: "",
      unit: "",
      dailyTarget: 0,
      color: "#3b82f6",
    });
  };

  const handleEditCategory = (category: TrackingCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      unit: category.unit,
      dailyTarget: category.dailyTarget,
      color: category.color
    });
    setShowAddDialog(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await onDelete(categoryId);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your fitness tracking categories</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={() => setShowTemplates(true)} variant="outline" className="flex items-center gap-2 justify-center">
            <Target className="w-4 h-4" />
            Templates
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2 justify-center">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg font-semibold truncate">{category.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                Target: <span className="font-medium">{category.dailyTarget} {category.unit}/day</span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="text-center py-16">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-3">No categories yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Create your first category to start tracking your fitness goals and monitor your progress</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setShowTemplates(true)} variant="outline" className="min-w-[140px]">
                Browse Templates
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="min-w-[140px]">
                Create Category
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={showAddDialog || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingCategory(null);
          setNewCategory({
            name: '',
            unit: '',
            dailyTarget: 0,
            color: '#3b82f6'
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update your category details below.' : 'Create a new category to track your fitness goals.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name
              </label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Water Intake"
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <Input
                  value={newCategory.unit}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., glasses, minutes"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Target
                </label>
                <Input
                  type="number"
                  value={newCategory.dailyTarget}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, dailyTarget: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 8"
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <Input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="h-11 w-full"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveCategory} className="flex-1 h-11">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCategory(null);
                  setNewCategory({
                    name: '',
                    unit: '',
                    dailyTarget: 0,
                    color: '#3b82f6'
                  });
                }}
                className="min-w-[80px] h-11"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Category Templates</DialogTitle>
            <DialogDescription>
              Choose from our pre-made templates to quickly add common fitness tracking categories.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {CATEGORY_TEMPLATES.map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]" onClick={() => handleAddFromTemplate(template)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{template.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.target} {template.unit}/day
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFromTemplate(template);
                    }}
                    className="w-full h-9"
                  >
                    Add Category
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
