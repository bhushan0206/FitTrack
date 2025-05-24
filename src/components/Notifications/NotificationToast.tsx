import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationToast = () => {
  const { notifications, markNotificationsAsSeen } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notifications.hasNewMessage) {
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        markNotificationsAsSeen();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications.hasNewMessage, markNotificationsAsSeen]);

  const handleClose = () => {
    setIsVisible(false);
    markNotificationsAsSeen();
  };

  if (!isVisible || !notifications.hasNewMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            New Message
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {notifications.lastMessageSender && `From ${notifications.lastMessageSender}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {notifications.unreadCount} unread message{notifications.unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
