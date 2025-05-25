import { useState, useEffect, useCallback } from 'react';
import { socialStorage } from '@/lib/socialStorage';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationState {
  totalUnread: number;
  unreadByFriend: Record<string, number>;
  newMessageToast: {
    show: boolean;
    senderName: string;
    content: string;
    id: string;
  } | null;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationState>({
    totalUnread: 0,
    unreadByFriend: {},
    newMessageToast: null,
  });

  // Load unread counts from database
  const loadUnreadCounts = useCallback(async () => {
    if (!user) {
      setNotifications({
        totalUnread: 0,
        unreadByFriend: {},
        newMessageToast: null,
      });
      return;
    }

    try {
      const totalCount = await socialStorage.getUnreadMessageCount();
      
      // Get unread counts by friend
      const friends = await socialStorage.getFriends();
      const unreadByFriend: Record<string, number> = {};
      
      for (const friend of friends) {
        const messages = await socialStorage.getMessages(friend.friend_id);
        const unreadCount = messages.filter(
          msg => msg.receiver_id === user.id && !msg.read
        ).length;
        if (unreadCount > 0) {
          unreadByFriend[friend.friend_id] = unreadCount;
        }
      }

      setNotifications(prev => ({
        ...prev,
        totalUnread: totalCount,
        unreadByFriend,
      }));
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Load initial counts
    loadUnreadCounts();

    // Subscribe to new messages
    const subscription = socialStorage.subscribeToMessages((message) => {
      console.log('useNotifications: Received real-time message:', message);
      
      // Only show notifications for messages TO the current user
      if (message.receiver_id === user.id) {
        const senderName = message.sender_profile?.name || 'Someone';
        const messageId = message.id || `msg-${Date.now()}`;
        
        console.log('useNotifications: Creating notification for message from:', senderName);
        
        // Update unread counts
        setNotifications(prev => {
          const newUnreadByFriend = { ...prev.unreadByFriend };
          newUnreadByFriend[message.sender_id] = (newUnreadByFriend[message.sender_id] || 0) + 1;
          
          const newTotalUnread = prev.totalUnread + 1;
          
          return {
            ...prev,
            totalUnread: newTotalUnread,
            unreadByFriend: newUnreadByFriend,
            newMessageToast: {
              show: true,
              senderName,
              content: message.content,
              id: messageId,
            },
          };
        });

        // Auto-close toast after 5 seconds - store the messageId in closure
        setTimeout(() => {
          setNotifications(prev => {
            // Only close if it's the same message
            if (prev.newMessageToast?.id === messageId) {
              console.log('useNotifications: Auto-closing toast for message:', messageId);
              return {
                ...prev,
                newMessageToast: null,
              };
            }
            return prev;
          });
        }, 5000);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [user, loadUnreadCounts]);

  // Mark messages as read for a specific friend
  const markMessagesAsRead = useCallback(async (friendId: string) => {
    if (!user) return;

    try {
      // Update local state immediately BEFORE the database call
      setNotifications(prev => {
        const newUnreadByFriend = { ...prev.unreadByFriend };
        const wasUnread = newUnreadByFriend[friendId] || 0;
        delete newUnreadByFriend[friendId];
        
        const newTotalUnread = Math.max(0, prev.totalUnread - wasUnread);
        
        console.log('markMessagesAsRead: Updating local state:', {
          friendId,
          wasUnread,
          newTotalUnread,
          newUnreadByFriend
        });
        
        return {
          ...prev,
          totalUnread: newTotalUnread,
          unreadByFriend: newUnreadByFriend,
        };
      });

      // Then update the database
      await socialStorage.markMessagesAsRead(friendId);
      
      console.log('markMessagesAsRead: Database updated for friend:', friendId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // On error, reload the counts to restore correct state
      loadUnreadCounts();
    }
  }, [user, loadUnreadCounts]);

  const closeToast = useCallback(() => {
    setNotifications(prev => ({
      ...prev,
      newMessageToast: null,
    }));
  }, []);

  const refreshCounts = useCallback(async () => {
    await loadUnreadCounts();
  }, [loadUnreadCounts]);

  return {
    totalUnread: notifications.totalUnread,
    unreadByFriend: notifications.unreadByFriend,
    newMessageToast: notifications.newMessageToast,
    markMessagesAsRead,
    closeToast,
    refreshCounts,
    markNotificationsAsSeen: closeToast,
  };
};
