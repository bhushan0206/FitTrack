import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, User, LogOut, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/fitness";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProfileForm from "@/components/Profile/ProfileForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const { theme, toggleTheme } = useTheme();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleProfileSave = async (profileData: Partial<UserProfile>) => {
    const success = await onProfileUpdate(profileData);
    if (success) {
      setProfileDialogOpen(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple sign out attempts

    setIsSigningOut(true);
    try {
      console.log('Signing out user...');
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Don't set isSigningOut to false here - let the auth state change handle the redirect
      // setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => (window.location.href = '/')}
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
              size="sm"
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:inline text-gray-700 dark:text-gray-200 font-medium">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-gray-200/50 dark:border-gray-600/50 rounded-xl shadow-lg"
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg mx-1 my-1">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg mx-1 my-1 focus:bg-red-50 dark:focus:bg-red-900/30"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
