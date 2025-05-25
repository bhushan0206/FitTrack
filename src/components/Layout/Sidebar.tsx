import React from "react";
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, Users } from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { totalUnread } = useNotifications(); // Fix: Remove 'notifications' reference

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white min-h-screen flex flex-col">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold">FitTrack</h2>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => onTabChange("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Dashboard</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onTabChange("logs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "logs"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Calendar size={20} />
              <span className="font-medium">Logs</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => onTabChange("social")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "social"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Social</span>
              {totalUnread > 0 && (
                <div className="ml-auto">
                  <div className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </div>
                </div>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;