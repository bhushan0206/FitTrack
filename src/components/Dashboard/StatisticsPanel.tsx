import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import DailyLogList from "./DailyLogList";
import LogEntryForm from "./LogEntryForm";
import ProgressChart from "./ProgressChart";
import SummaryCards from "./SummaryCards";

import { TrackingCategory, DailyLog } from "@/types/fitness";

import {
  initializeStorage,
  getUserProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
  getLogsByDate,
} from "@/lib/storage";

const StatisticsPanel = () => {
  const [categories, setCategories] = useState<TrackingCategory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    TrackingCategory | undefined
  >();
  const [editingLog, setEditingLog] = useState<DailyLog | undefined>();

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Initialize data from storage
  useEffect(() => {
    const profile = initializeStorage();
    setCategories(profile.categories);
    setLogs(profile.logs);
  }, []);

  // Format selected date as string
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  // Filter logs for selected date
  const selectedDateLogs = logs.filter(
    (log) => log.date === selectedDateString,
  );

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: TrackingCategory) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedProfile = deleteCategory(categoryId);
    setCategories(updatedProfile.categories);
    setLogs(updatedProfile.logs);
  };

  const handleSaveCategory = (category: TrackingCategory) => {
    const updatedProfile = editingCategory
      ? updateCategory(category)
      : addCategory(category);

    setCategories(updatedProfile.categories);
    setCategoryDialogOpen(false);
  };

  // Log entry handlers
  const handleAddLog = () => {
    setEditingLog(undefined);
    setLogDialogOpen(true);
  };

  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setLogDialogOpen(true);
  };

  const handleDeleteLog = (logId: string) => {
    const updatedProfile = deleteLogEntry(logId);
    setLogs(updatedProfile.logs);
  };

  const handleSaveLog = (log: DailyLog) => {
    const updatedProfile = editingLog ? updateLogEntry(log) : addLogEntry(log);

    setLogs(updatedProfile.logs);
    setLogDialogOpen(false);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Fitness Tracker</h1>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  {format(selectedDate, "MMMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="logs">Daily Logs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
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
                onEdit={handleEditLog}
                onDelete={handleDeleteLog}
                onAdd={handleAddLog}
                selectedDate={selectedDate}
              />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <DailyLogList
              logs={selectedDateLogs}
              categories={categories}
              onEdit={handleEditLog}
              onDelete={handleDeleteLog}
              onAdd={handleAddLog}
              selectedDate={selectedDate}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAdd={handleAddCategory}
            />
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <CategoryForm
              onSave={handleSaveCategory}
              category={editingCategory}
              onCancel={() => setCategoryDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Log Entry Dialog */}
        <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
          <DialogContent>
            <LogEntryForm
              categories={categories}
              onSave={handleSaveLog}
              log={editingLog}
              onCancel={() => setLogDialogOpen(false)}
              selectedDate={selectedDateString}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StatisticsPanel;
