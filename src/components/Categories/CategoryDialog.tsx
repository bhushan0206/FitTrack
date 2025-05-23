import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrackingCategory } from "@/types/fitness";
import CategoryForm from "@/components/Dashboard/CategoryForm";

interface CategoryDialogProps {
  isOpen: boolean;
  category?: TrackingCategory;
  onSave: (category: TrackingCategory) => void;
  onClose: () => void;
}

export default function CategoryDialog({
  isOpen,
  category,
  onSave,
  onClose,
}: CategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-lg overflow-hidden">
        <CategoryForm
          onSave={onSave}
          category={category}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
