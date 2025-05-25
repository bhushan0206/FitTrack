import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, User, LogOut, Moon, Sun, Bell, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/fitness";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from '@/hooks/useNotifications';
import { socialStorage } from '@/lib/socialStorage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProfileForm from "@/components/Profile/ProfileForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datePickerOpen: boolean;
  onDatePickerToggle: (open: boolean) => void;
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
  profile,
  onProfileUpdate,
  isLoading,
  children,
  onAIChatClick,
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalUnread, refreshCounts } = useNotifications();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Make it clickable */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FT</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              FitTrack
            </h1>
          </div>

          {/* Center Section - Date Picker */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate(-1)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ←
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {formatDate(selectedDate)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate(1)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              →
            </Button>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* AI Chat Quick Access Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onAIChatClick}
              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50 font-semibold"
              title="Open AI Assistant"
            >
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                )}
              </Button>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-white"
                  style={{
                    color: theme === 'dark' ? '#f3f4f6' : '#111827',
                    backgroundColor: 'transparent'
                  }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span
                    className="text-sm font-medium hidden sm:block"
                    style={{
                      color: theme === 'dark' ? '#f3f4f6' : '#111827'
                    }}
                  >
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 border-0 shadow-xl"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  color: theme === 'dark' ? '#f9fafb' : '#111827',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '8px'
                }}
              >
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
