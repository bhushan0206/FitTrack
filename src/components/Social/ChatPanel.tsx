import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Share, Calendar, TrendingUp } from 'lucide-react';
import { Message, WorkoutShare, ProgressShare } from '@/types/social';
import { socialStorage } from '@/lib/socialStorage';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChatPanelProps {
  friendId: string;
  friendName: string;
  onBack: () => void;
}

const ChatPanel = ({ friendId, friendName, onBack }: ChatPanelProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();

    // Subscribe to real-time messages
    const subscription = socialStorage.subscribeToMessages((message) => {
      if (
        (message.sender_id === friendId && message.receiver_id === user?.id) ||
        (message.sender_id === user?.id && message.receiver_id === friendId)
      ) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [friendId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const messagesList = await socialStorage.getMessages(friendId);
    setMessages(messagesList);
  };

  const markMessagesAsRead = async () => {
    await socialStorage.markMessagesAsRead(friendId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    const success = await socialStorage.sendMessage(friendId, newMessage.trim());
    if (success) {
      setNewMessage('');
    }
    setLoading(false);
  };

  const renderSharedContent = (message: Message) => {
    if (message.message_type === 'workout_share' && message.shared_data) {
      const workout = message.shared_data as WorkoutShare;
      return (
        <Card className="mt-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Workout - {format(new Date(workout.workout_date), 'MMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{workout.total_duration}</div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{workout.total_calories}</div>
                <div className="text-xs text-gray-600">Calories</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {workout.exercise_logs.length} exercises completed
            </div>
            {workout.notes && (
              <p className="text-sm text-gray-700 mt-2 italic">"{workout.notes}"</p>
            )}
          </CardContent>
        </Card>
      );
    }

    if (message.message_type === 'progress_share' && message.shared_data) {
      const progress = message.shared_data as ProgressShare;
      return (
        <Card className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress - {format(new Date(progress.date), 'MMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{progress.completed_categories}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{Math.round(progress.overall_completion)}%</div>
                <div className="text-xs text-gray-600">Overall</div>
              </div>
            </div>
            <div className="space-y-1">
              {progress.categories.slice(0, 3).map((category, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                  <span>{Math.round(category.percentage)}%</span>
                </div>
              ))}
              {progress.categories.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{progress.categories.length - 3} more categories
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
            {friendName.charAt(0)}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{friendName}</h3>
        </div>
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No messages yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.message_type !== 'text' && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {message.message_type === 'workout_share' ? '🏋️ Workout' : '📊 Progress'}
                  </Badge>
                )}
                <p className="text-sm">{message.content}</p>
                {renderSharedContent(message)}
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
