import React, { useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationToast = () => {
  const { newMessageToast, closeToast } = useNotifications();

  // Debug log to see if toast data is received
  useEffect(() => {
    if (newMessageToast?.show) {
      console.log('NotificationToast: Rendering toast:', newMessageToast);
    }
  }, [newMessageToast]);

  if (!newMessageToast?.show) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm animate-slide-in-right">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              New Message
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              From {newMessageToast.senderName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {newMessageToast.content}
            </p>
          </div>
          <button
            onClick={() => {
              console.log('NotificationToast: Close button clicked');
              closeToast();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
