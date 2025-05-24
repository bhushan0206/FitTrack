import React, { useEffect, useState } from "react";
import { Conversation } from "@/types/social";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { socialStorage } from "@/lib/socialStorage";

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const loadedConversations = await socialStorage.getConversations();
      setConversations(loadedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    // Subscribe to real-time message updates to refresh conversation list
    const subscription = socialStorage.subscribeToMessages((message) => {
      // Refresh conversations when new messages arrive
      loadConversations();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-gray-900 dark:text-white text-lg font-bold">
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {loading ? (
          <div className="text-center py-4">
            <span className="loader"></span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No conversations yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start a conversation with someone!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xl">
                        {conversation.participant_profile?.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {conversation.participant_profile?.name || "Unknown User"}
                      </span>
                      {conversation.last_message && (
                        <span className="text-gray-600 dark:text-gray-300 text-sm truncate max-w-[200px]">
                          {conversation.last_message.content}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {conversation.updated_at
                      ? formatDistanceToNow(new Date(conversation.updated_at), {
                          addSuffix: true,
                        })
                      : "Just now"}
                  </div>
                </div>
                {conversation.unread_count > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
                      <span className="text-indigo-500 text-xs font-medium">
                        {conversation.unread_count} new message
                        {conversation.unread_count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationList;