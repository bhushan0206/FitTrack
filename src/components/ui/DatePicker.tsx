import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
}

const DatePicker = ({ 
  mode = "single", 
  selected, 
  onSelect, 
  initialFocus = false,
  className 
}: DatePickerProps) => {
  return (
    <Calendar
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
      className={cn("rounded-md border", className)}
    />
  );
};

export default DatePicker;
