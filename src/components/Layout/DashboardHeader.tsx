import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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

const DashboardHeader = ({
  selectedDate,
  onDateChange,
  datePickerOpen,
  onDatePickerToggle,
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-1">
          Dashboard
        </h2>
        <p className="text-text-secondary text-sm sm:text-base">
          Track your fitness journey and achieve your goals
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 min-w-[200px] justify-start"
            >
              <Calendar className="h-4 w-4" />
              <span className="flex-1 text-left">
                {format(selectedDate, "MMMM d, yyyy")}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateChange(date);
                  onDatePickerToggle(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DashboardHeader;