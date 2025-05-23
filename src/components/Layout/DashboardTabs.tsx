import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackingCategory, DailyLog } from "@/types/fitness";
import CategoryList from "@/components/Dashboard/CategoryList";
import DailyLogList from "@/components/Dashboard/DailyLogList";
import ProgressChart from "@/components/Dashboard/ProgressChart";
import SummaryCards from "@/components/Dashboard/SummaryCards";
import Achievements from "@/components/Dashboard/Achievements";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  categories: TrackingCategory[];
  logs: DailyLog[];
  selectedDate: Date;
  selectedDateLogs: DailyLog[];
  onEditCategory: (category: TrackingCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditLog: (log: DailyLog) => void;
  onDeleteLog: (logId: string) => void;
  onAddLog: () => void;
}

export default function DashboardTabs({
  activeTab,
  onTabChange,
  categories,
  logs,
  selectedDate,
  selectedDateLogs,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onEditLog,
  onDeleteLog,
  onAddLog,
}: DashboardTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6 bg-background-secondary">
        <TabsTrigger value="dashboard" className="text-text data-[state=active]:bg-background">
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="logs" className="text-text data-[state=active]:bg-background">
          Daily Logs
        </TabsTrigger>
        <TabsTrigger value="categories" className="text-text data-[state=active]:bg-background">
          Categories
        </TabsTrigger>
        <TabsTrigger value="achievements" className="text-text data-[state=active]:bg-background">
          Achievements
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <SummaryCards
          logs={logs}
          categories={categories}
          selectedDate={selectedDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart logs={logs} categories={categories} />
          <DailyLogList
            logs={selectedDateLogs}
            categories={categories}
            onEdit={onEditLog}
            onDelete={onDeleteLog}
            onAdd={onAddLog}
            selectedDate={selectedDate}
          />
        </div>
      </TabsContent>

      <TabsContent value="logs">
        <DailyLogList
          logs={selectedDateLogs}
          categories={categories}
          onEdit={onEditLog}
          onDelete={onDeleteLog}
          onAdd={onAddLog}
          selectedDate={selectedDate}
        />
      </TabsContent>

      <TabsContent value="categories">
        <CategoryList
          categories={categories}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
          onAdd={onAddCategory}
        />
      </TabsContent>

      <TabsContent value="achievements">
        <Achievements categories={categories} />
      </TabsContent>
    </Tabs>
  );
}
