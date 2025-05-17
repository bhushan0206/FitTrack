import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
  initializeUserProfile,
  getUserProfile,
  addCategory,
  updateCategory,
  deleteCategory,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
  getLogsByDate,
  generateId,
} from "@/lib/supabaseStorage";

const StatisticsPanel = () => {
  const [categories, setCategories] = useState<TrackingCategory[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    TrackingCategory | undefined
  >();
  const [editingLog, setEditingLog] = useState<DailyLog | undefined>();

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Initialize data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const profile = await initializeUserProfile();
        if (profile) {
          setCategories(profile.categories);
          setLogs(profile.logs);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load user data: " + error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [toast]);

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

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const updatedProfile = await deleteCategory(categoryId);
      if (updatedProfile) {
        setCategories(updatedProfile.categories);
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete category: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async (category: TrackingCategory) => {
    try {
      const updatedProfile = editingCategory
        ? await updateCategory(category)
        : await addCategory(category);

      if (updatedProfile) {
        setCategories(updatedProfile.categories);
        setCategoryDialogOpen(false);
        toast({
          title: "Success",
          description: `Category ${editingCategory ? "updated" : "added"} successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          `Failed to ${editingCategory ? "update" : "add"} category: ` +
          error.message,
        variant: "destructive",
      });
    }
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

  const handleDeleteLog = async (logId: string) => {
    try {
      const updatedProfile = await deleteLogEntry(logId);
      if (updatedProfile) {
        setLogs(updatedProfile.logs);
        toast({
          title: "Success",
          description: "Log entry deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete log entry: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveLog = async (log: DailyLog) => {
    try {
      const updatedProfile = editingLog
        ? await updateLogEntry(log)
        : await addLogEntry(log);

      if (updatedProfile) {
        setLogs(updatedProfile.logs);
        setLogDialogOpen(false);
        toast({
          title: "Success",
          description: `Log entry ${editingLog ? "updated" : "added"} successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          `Failed to ${editingLog ? "update" : "add"} log entry: ` +
          error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
