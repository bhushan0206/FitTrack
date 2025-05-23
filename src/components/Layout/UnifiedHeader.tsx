import { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClerk } from "@clerk/clerk-react";
import ProfileForm from "@/components/Profile/ProfileForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-xl border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="6" y="14" width="20" height="4" rx="2" fill="#4F46E5" />
                  <rect x="2" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
                  <rect x="22" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                FitTrack
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Your Personal Fitness Journey
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-3 min-w-[220px] justify-start bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="flex-1 text-left font-medium">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-50 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-2xl"
                align="end"
                sideOffset={12}
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
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white transition-all duration-200 px-4 py-2 rounded-xl"
              onClick={() => setProfileDialogOpen(true)}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Profile</span>
            </Button>

            <Button
              className="bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-2"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-200/50 max-w-4xl rounded-2xl shadow-2xl">
          <ProfileForm
            profile={{
              id: "user-id", // Replace with actual user ID
              name: "John Doe", // Replace with actual user name
              age: 30,
              gender: "male",
              weight: 70,
              height: 175,
              fitnessGoal: "maintain_health",
              categories: [],
              logs: [],
            }}
            onSave={(profileData) => {
              console.log("Profile saved:", profileData);
              setProfileDialogOpen(false);
            }}
            onCancel={() => setProfileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default UnifiedHeader;
