import React from 'react';
import { TrackingCategory } from '@/types/fitness';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryTemplateProps {
  category: TrackingCategory;
  onSelect: (category: TrackingCategory) => void;
  isSelected?: boolean;
}

const CategoryTemplate = ({ category, onSelect, isSelected = false }: CategoryTemplateProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => onSelect(category)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
          <div 
            className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
            style={{ backgroundColor: category.color }}
          />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {category.unit}
          </Badge>
          <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            {category.exerciseType}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Target: <span className="font-medium text-gray-900 dark:text-white">{category.dailyTarget} {category.unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTemplate;
