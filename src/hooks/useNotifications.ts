import { useState, useEffect } from 'react';
import { socialStorage } from '@/lib/socialStorage';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationState {
  unreadCount: number;
  hasNewMessage: boolean;
  lastMessageSender?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationState>({
    unreadCount: 0,
    hasNewMessage: false
  });

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/logo.png',
        badge: '/logo.png',
        tag: 'fittrack-message'
      });
    }
  };

  // Load initial unread count
  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await socialStorage.getUnreadMessageCount();
      setNotifications(prev => ({
        ...prev,
        unreadCount: count
      }));
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Mark notifications as seen
  const markNotificationsAsSeen = () => {
    setNotifications(prev => ({
      ...prev,
      hasNewMessage: false
    }));
  };

  useEffect(() => {
    if (user) {
      // Request permission on mount
      requestNotificationPermission();
      
      // Load initial unread count
      loadUnreadCount();

      // Subscribe to new messages
      const subscription = socialStorage.subscribeToMessages((message) => {
        // Only show notifications for messages received by current user
        if (message.receiver_id === user.id) {
          const senderName = message.sender_profile?.name || 'Someone';
          
          setNotifications(prev => ({
            unreadCount: prev.unreadCount + 1,
            hasNewMessage: true,
            lastMessageSender: senderName
          }));

          // Show browser notification
          showBrowserNotification(
            `New message from ${senderName}`,
            message.content,
            message.sender_profile?.avatar_url
          );
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    notifications,
    loadUnreadCount,
    markNotificationsAsSeen,
    requestNotificationPermission
  };
};
