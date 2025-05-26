import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Dumbbell, 
  Users, 
  Bot 
} from 'lucide-react';

export type TabValue = 'overview' | 'progress' | 'categories' | 'logs' | 'exercises' | 'social' | 'ai-assistant';

interface TabConfig {
  id: TabValue;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Home', icon: BarChart3 },
  { id: 'categories', label: 'Categories', shortLabel: 'Goals', icon: Target },
  { id: 'exercises', label: 'Exercises', shortLabel: 'Fit', icon: Dumbbell },
  { id: 'social', label: 'Social', shortLabel: 'Social', icon: Users },
  { id: 'ai-assistant', label: 'AI Assistant', shortLabel: 'AI', icon: Bot }
];

const TabNavigation = () => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar -mx-2 sm:mx-0">
      <TabsList className="flex h-auto w-max min-w-full p-1 bg-gray-100/70 dark:bg-gray-800/50 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col xs:flex-row items-center justify-center
                         gap-0.5 sm:gap-2 h-10 px-3
                         data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700
                         data-[state=active]:shadow
                         rounded-md transition-all flex-shrink-0"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs whitespace-nowrap">
                {tab.shortLabel}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};

export default TabNavigation;
export { tabs };
