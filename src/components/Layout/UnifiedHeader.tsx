import { format } from "date-fns";
import { Calendar, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClerk } from "@clerk/clerk-react";

interface UnifiedHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datePickerOpen: boolean;
  onDatePickerToggle: (open: boolean) => void;
}

const UnifiedHeader = ({
  selectedDate,
  onDateChange,
  datePickerOpen,
  onDatePickerToggle,
}: UnifiedHeaderProps) => {
  const { signOut } = useClerk();

  return (
    <header className="w-full bg-gradient-to-r from-primary to-secondary shadow-md py-4">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Logo and title */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="6" y="14" width="20" height="4" rx="2" fill="#4F46E5" />
                <rect x="2" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
                <rect x="22" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold">FitTrack</h1>
          </div>
          <p className="text-white text-sm sm:text-base mt-1">
            Track your fitness journey and achieve your goals
          </p>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-4">
          <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 min-w-[200px] justify-start bg-white text-primary"
              >
                <Calendar className="h-4 w-4" />
                <span className="flex-1 text-left">
                  {format(selectedDate, "MMMM d, yyyy")}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-50 bg-background border border-border rounded-lg shadow-lg"
              align="end"
              sideOffset={8}
            >
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
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>

          {/* Sign-out button */}
          <Button
            className="bg-white text-primary font-medium py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-all flex items-center gap-2"
            onClick={() => signOut()}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
