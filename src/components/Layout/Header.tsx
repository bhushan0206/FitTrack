import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, User, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/types/fitness";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProfileForm from "@/components/Profile/ProfileForm";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useNotifications } from '@/hooks/useNotifications';
import { socialStorage } from '@/lib/socialStorage';
import { LogOut as LogOutIcon, Sun, Moon, Bell, Activity } from 'lucide-react';

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datePickerOpen: boolean;
  onDatePickerToggle: (open: boolean) => void;
  onQuickDateSelect: (date: Date) => void; // New prop for quick date selection
  showDatePicker: boolean; // New prop to control date picker visibility
  profile: UserProfile | null;
  onProfileUpdate: (profileData: Partial<UserProfile>) => Promise<boolean>;
  isLoading: boolean;
  children?: React.ReactNode;
  onAIChatClick?: () => void; // Add this prop for quick AI access
}

const Header = ({ 
  selectedDate,
  onDateChange,
  datePickerOpen,
  onDatePickerToggle,
  onQuickDateSelect,
  showDatePicker = true,
  profile,
  onProfileUpdate,
  isLoading = false,
  onAIChatClick,
  children
}: HeaderProps) => {
  const { theme } = useTheme();
  const { signOut } = useAuth(); // Add this line to access signOut function
  const navigate = useNavigate();
  const { totalUnread, refreshCounts } = useNotifications();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Add real-time subscription to refresh notification counts
  useEffect(() => {
    // Subscribe to message updates to refresh notification counts
    const subscription = socialStorage.subscribeToMessages(() => {
      // Refresh notification counts when any message is received
      refreshCounts();
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [refreshCounts]);

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
      navigate('/auth/signin'); // Navigate to sign-in page after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Don't set isSigningOut to false here - let the auth state change handle the redirect
      // setIsSigningOut(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    onDateChange(newDate);
  };

  const userInitials = profile?.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  const handleDateSelection = (date: Date) => {
    onDateChange(date);
    if (onQuickDateSelect) {
      onQuickDateSelect(date);
    } else {
      onDatePickerToggle(false);
    }
  };

  // Move to the previous day
  const handlePreviousDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    changeDate(-1);
  };
  
  // Move to the next day
  const handleNextDay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    changeDate(1);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title - Make clickable */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                FitTrack
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Your Fitness Journey
              </p>
            </div>
          </div>

          {/* Mobile Optimized Date Picker */}
          {showDatePicker && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousDay}
                className="h-7 w-7 rounded-full p-0 flex-shrink-0"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDatePickerToggle(!datePickerOpen)}
                className="px-1 sm:px-3 h-7 text-[10px] sm:text-xs border-gray-200 dark:border-gray-700 mx-0.5 sm:mx-1"
              >
                <Calendar className="mr-1 h-3 w-3" />
                <span className="hidden xs:inline">{format(selectedDate, 'MMM d')}</span>
                <span className="xs:hidden">{format(selectedDate, 'MM/dd')}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextDay}
                className="h-7 w-7 rounded-full p-0 flex-shrink-0"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              {datePickerOpen && (
                <div className="absolute top-12 sm:top-14 left-0 right-0 mx-auto w-[calc(100%-8px)] xs:w-[calc(100%-16px)] sm:w-auto sm:left-1/2 sm:-translate-x-1/2 z-50">
                  <Card className="shadow-xl bg-white dark:bg-gray-800 border-0">
                    <CardContent className="p-0">
                      <div className="p-2">
                        {/* Simplified mobile date picker */}
                        <div className="calendar-wrapper max-w-full">
                          <DatePicker
                            date={selectedDate}
                            onDateChange={handleDateSelection}
                          />
                        </div>
                      </div>
                      <div className="flex border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => handleDateSelection(new Date())}
                          className="flex-1 rounded-none rounded-bl-lg text-xs h-8"
                          variant="ghost"
                        >
                          Today
                        </Button>
                        <Button
                          onClick={() => onDatePickerToggle(false)}
                          className="flex-1 rounded-none rounded-br-lg text-xs h-8" 
                          variant="ghost"
                        >
                          Close
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          
          {/* Right Side Actions - Minimalist on Mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {userInitials}
                  </div>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
                <DropdownMenuItem 
                  onClick={() => setProfileDialogOpen(true)}
                  className="rounded-lg cursor-pointer focus:outline-none"
                  style={{
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                    backgroundColor: 'transparent',
                    padding: '12px 16px',
                    margin: '2px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <User className="w-4 h-4 mr-3" style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }} />
                  <span style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>Profile</span>
                </DropdownMenuItem>
                
                <div 
                  style={{
                    height: '1px',
                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    margin: '8px 0'
                  }}
                />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="rounded-lg cursor-pointer focus:outline-none"
                  style={{
                    color: '#dc2626',
                    backgroundColor: 'transparent',
                    padding: '12px 16px',
                    margin: '2px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#7f1d1d' : '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" style={{ color: '#dc2626' }} />
                  <span style={{ color: '#dc2626' }}>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
