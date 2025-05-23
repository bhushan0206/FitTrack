import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
        <VisuallyHidden>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </VisuallyHidden>
        <CategoryForm
          onSave={onSave}
          category={category}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
