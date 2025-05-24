import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/types/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { socialStorage } from "@/lib/socialStorage";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from '@/hooks/useNotifications';

interface MessageInterfaceProps {
  conversation: any;
  onBack: () => void;
}

const MessageInterface = ({ conversation, onBack }: MessageInterfaceProps) => {
  const { loadUnreadCount } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const loadMessages = async () => {
    if (!conversation) return;
    
    setLoading(true);
    try {
      const result = await socialStorage.getMessages(conversation.participant_id);
      setMessages(result);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversation) {
      loadMessages();
      
      // Mark messages as read when entering conversation
      const markAsRead = async () => {
        try {
          await socialStorage.markMessagesAsRead(conversation.participant_id);
          // Reload unread count after marking as read
          loadUnreadCount();
        } catch (error) {
          console.warn('Failed to mark messages as read:', error);
        }
      };
      
      markAsRead();

      // Subscribe to real-time messages for incoming messages only
      let subscription: any = null;
      
      try {
        subscription = socialStorage.subscribeToMessages((message) => {
          // Only add incoming messages (not from current user)
          if (
            message.sender_id === conversation.participant_id && 
            message.receiver_id === user?.id
          ) {
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(m => m.id === message.id);
              if (exists) return prev;
              
              // Add the incoming message
              return [...prev, {
                ...message,
                sender_profile: conversation.participant_profile
              }].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
          }
        });
      } catch (error) {
        console.error('Failed to set up real-time subscription:', error);
      }

      return () => {
        if (subscription?.unsubscribe) {
          subscription.unsubscribe();
        }
      };
    }
  }, [conversation, user, loadUnreadCount]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation || !user) return;

    const messageContent = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Clear input immediately
    
    // Create the message that will be displayed immediately
    const immediateMessage: Message = {
      id: `optimistic-${Date.now()}-${Math.random()}`,
      sender_id: user.id,
      receiver_id: conversation.participant_id,
      content: messageContent,
      message_type: 'text',
      shared_data: null,
      read: false,
      created_at: new Date().toISOString(),
      sender_profile: {
        id: user.id,
        name: user.name || user.email?.split('@')[0] || 'Unknown',
        avatar_url: user.avatar
      }
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, immediateMessage]);
    
    try {
      const result = await socialStorage.sendMessage(conversation.participant_id, messageContent);
      
      if (!result.success) {
        // Remove the optimistic message on error and restore input
        setMessages(prev => prev.filter(m => m.id !== immediateMessage.id));
        setNewMessage(messageContent);
        console.error('Failed to send message:', result.error);
      }
      // If successful, keep the optimistic message (don't wait for real-time)
    } catch (error) {
      // Remove optimistic message on error and restore input
      setMessages(prev => prev.filter(m => m.id !== immediateMessage.id));
      setNewMessage(messageContent);
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border-0 shadow-lg">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {conversation.participant_profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {conversation.participant_profile?.name || "Unknown User"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">No messages yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender_id === user?.id 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-xs mt-2 ${
                    message.sender_id === user?.id 
                      ? "text-indigo-100" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {format(new Date(message.created_at), "h:mm a")}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white min-h-[44px] max-h-[120px]"
            rows={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInterface;