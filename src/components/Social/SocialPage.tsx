import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { socialStorage } from "@/lib/socialStorage";
import { useAuth } from "@/contexts/AuthContext";
import MessageInterface from "./MessageInterface";
import { Friend } from "@/types/social";
import { useNotifications } from '@/hooks/useNotifications';

const SocialPage = () => {
  const { user } = useAuth();
  const { totalUnread, markNotificationsAsSeen } = useNotifications(); // Fix: destructure directly
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"friends" | "messages">("friends");

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      
      try {
        const friendsList = await socialStorage.getFriends();
        setFriends(friendsList);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching friends:', error);
        }
      }
    };

    fetchFriends();
  }, [user]);

  const handleStartConversation = (friend: Friend) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Starting conversation with:', friend);
    }
    
    const conversation = {
      id: `conversation-${friend.friend_id}`,
      participant_id: friend.friend_id,
      participant_profile: friend.friend_profile,
      last_message: null,
      updated_at: new Date().toISOString(),
      unread_count: 0
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Created conversation object:', conversation);
    }
    setSelectedConversation(conversation);
    setCurrentView('messages');
  };

  // Mark notifications as seen when entering social page
  useEffect(() => {
    if (totalUnread > 0) { // Fix: use totalUnread directly
      markNotificationsAsSeen();
    }
  }, [totalUnread, markNotificationsAsSeen]); // Fix: use totalUnread

  return (
    <div className="flex flex-col h-full">
      {/* Header with notification indicator */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Social
          </h1>
          {totalUnread > 0 && ( // Fix: use totalUnread directly
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {totalUnread} new message{totalUnread !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentView === "friends" ? (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                  No friends yet
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Add friends to start chatting!
                </p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.friend_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-lg">
                        {friend.friend_profile?.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {friend.friend_profile?.name || "Unknown User"}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        Click to start chatting
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartConversation(friend)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-lg px-4 py-2"
                  >
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : (
          <MessageInterface conversation={selectedConversation} onBack={() => setCurrentView('friends')} />
        )}
      </div>
    </div>
  );
};

export default SocialPage;