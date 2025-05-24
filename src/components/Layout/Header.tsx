import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { UserProfile } from "@/types/fitness";
import ProfileForm from "@/components/Profile/ProfileForm";

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datePickerOpen: boolean;
  onDatePickerToggle: (open: boolean) => void;
  profile: UserProfile | null;
  onProfileUpdate: (profileData: Partial<UserProfile>) => Promise<boolean>;
  isLoading: boolean;
  children?: React.ReactNode;
}

const Header = ({
  selectedDate,
  onDateChange,
  datePickerOpen,
  onDatePickerToggle,
  profile,
  onProfileUpdate,
  isLoading,
  children,
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleProfileSave = async (profileData: Partial<UserProfile>) => {
    const success = await onProfileUpdate(profileData);
    if (success) {
      setProfileDialogOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogoClick = () => {
    // Reset to main dashboard view by reloading the page
    window.location.href = '/';
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FitTrack
            </h1>
          </button>

          {/* Center Section - Date Picker */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xs">
            <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-white/90 dark:bg-gray-700/90 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-900 dark:text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl" align="center">
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
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Date Picker */}
            <div className="md:hidden">
              <Popover open={datePickerOpen} onOpenChange={onDatePickerToggle}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 dark:bg-gray-700/90 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white px-2"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl" align="end">
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
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg px-3 py-2"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex-shrink-0"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-semibold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 sm:w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-xl" 
                align="end" 
                forceMount
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {profile?.name || user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-gray-600 dark:text-gray-300 truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-600/50" />
                
                <DropdownMenuItem asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 cursor-pointer rounded-lg mx-1 my-1">
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-2xl rounded-2xl shadow-2xl">
                      <ProfileForm
                        profile={profile}
                        onSave={onProfileUpdate}
                        isLoading={isLoading}
                      />
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-600/50" />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:bg-red-50 dark:focus:bg-red-900/30 cursor-pointer rounded-lg mx-1 my-1 px-4 py-2"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Date Display */}
        <div className="md:hidden pb-3 pt-1">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Profile dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 max-w-4xl rounded-2xl shadow-2xl">
          {children && 
            React.cloneElement(children as React.ReactElement, {
              profile,
              onSave: handleProfileSave,
              onCancel: () => setProfileDialogOpen(false),
              isLoading,
            })
          }
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
