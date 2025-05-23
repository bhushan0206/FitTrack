import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datePickerOpen: boolean;
  onDatePickerToggle: (open: boolean) => void;
}

export default function DashboardHeader({
  selectedDate,
  onDateChange,
  datePickerOpen,
  onDatePickerToggle,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-text">Fitness Tracker</h1>

      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background-secondary text-text"
            >
              <CalendarIcon size={16} />
              {format(selectedDate, "MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-background border-border"
            align="end"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date);
                  onDatePickerToggle(false);
                }
              }}
              initialFocus
              className="bg-background text-text"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}