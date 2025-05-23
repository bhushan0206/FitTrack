import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrackingCategory, DailyLog } from "@/types/fitness";
import CategoryForm from "./CategoryForm";
import LogEntryForm from "./LogEntryForm";

interface DashboardDialogsProps {
  categoryDialogOpen: boolean;
  logDialogOpen: boolean;
  editingCategory?: TrackingCategory;
  editingLog?: DailyLog;
  categories: TrackingCategory[];
  selectedDateString: string;
  onSaveCategory: (category: TrackingCategory) => void;
  onSaveLog: (log: DailyLog) => void;
  onCloseCategoryDialog: () => void;
  onCloseLogDialog: () => void;
}

export default function DashboardDialogs({
  categoryDialogOpen,
  logDialogOpen,
  editingCategory,
  editingLog,
  categories,
  selectedDateString,
  onSaveCategory,
  onSaveLog,
  onCloseCategoryDialog,
  onCloseLogDialog,
}: DashboardDialogsProps) {
  return (
    <>
      <Dialog open={categoryDialogOpen} onOpenChange={onCloseCategoryDialog}>
        <DialogContent className="bg-background border-border max-w-lg overflow-hidden">
          <CategoryForm
            onSave={onSaveCategory}
            category={editingCategory}
            onCancel={onCloseCategoryDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={logDialogOpen} onOpenChange={onCloseLogDialog}>
        <DialogContent className="bg-background border-border max-w-lg overflow-hidden">
          <LogEntryForm
            categories={categories}
            onSave={onSaveLog}
            log={editingLog}
            onCancel={onCloseLogDialog}
            selectedDate={selectedDateString}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
