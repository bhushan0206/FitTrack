import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderPlus, Users, Sparkles, Dumbbell } from 'lucide-react';
import { TabValue } from '@/components/Layout/TabNavigation';

interface QuickActionsProps {
  onAddLog: () => void;
  onAddCategory: () => void;
  onTabChange: (tab: TabValue) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddLog,
  onAddCategory,
  onTabChange,
}) => {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader className="px-2 py-2 sm:px-4 sm:py-2.5">
        <CardTitle className="text-gray-900 dark:text-white text-sm font-bold">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-2 sm:px-4 sm:py-2.5">
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          <Button
            onClick={onAddLog}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm text-xs"
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Add Log</span>
          </Button>
          <Button
            onClick={onAddCategory}
            variant="outline"
            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50 text-xs"
            size="sm"
          >
            <FolderPlus className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Category</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2">
          <Button
            onClick={() => onTabChange('exercises')}
            variant="outline"
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/50 text-xs"
            size="sm"
          >
            <Dumbbell className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Exercise</span>
          </Button>
          <Button
            onClick={() => onTabChange('social')}
            variant="outline"
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/50 text-xs"
            size="sm"
          >
            <Users className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Social</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 mt-1 sm:mt-2">
          <Button
            onClick={() => onTabChange('ai-assistant')}
            variant="outline"
            className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900/50 text-xs"
            size="sm"
          >
            <Sparkles className="w-3 h-3 mr-1 text-yellow-500 flex-shrink-0" />
            <span className="truncate">AI Assistant</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
