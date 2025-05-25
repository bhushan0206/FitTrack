import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Check, X, MessageCircle } from 'lucide-react';
import { Friend } from '@/types/social';
import { socialStorage } from '@/lib/socialStorage';
import { useNotifications } from '@/hooks/useNotifications';

interface FriendsPanelProps {
  onOpenChat: (friendId: string, friendName: string) => void;
}

const FriendsPanel = ({ onOpenChat }: FriendsPanelProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { unreadByFriend, markMessagesAsRead } = useNotifications(); // Remove any reference to 'notifications'

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    const friendsList = await socialStorage.getFriends();
    setFriends(friendsList);
  };

  const loadPendingRequests = async () => {
    const requests = await socialStorage.getPendingRequests();
    setPendingRequests(requests);
  };

  const handleSendFriendRequest = async () => {
    if (!friendEmail.trim()) {
      setError('Please enter an email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await socialStorage.sendFriendRequest(friendEmail.trim().toLowerCase());
      
      if (result.success) {
        setFriendEmail('');
        setShowAddFriend(false);
        setSuccess('Friend request sent successfully!');
        loadFriends(); // Refresh friends list
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to send friend request.');
      }
    } catch (error) {
      console.error('Error in handleSendFriendRequest:', error);
      setError('An unexpected error occurred. Please try again.');
    }
    
    setLoading(false);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const result = await socialStorage.acceptFriendRequest(friendshipId);
      if (result.success) {
        // Refresh both lists to show the updated friendship status
        await Promise.all([loadFriends(), loadPendingRequests()]);
        setSuccess('Friend request accepted! You are now friends.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to accept friend request.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error in handleAcceptRequest:', error);
      setError('An unexpected error occurred. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // When opening chat, mark messages as read for that friend
  const handleOpenChatWithFriend = async (friendId: string, friendName: string) => {
    try {
      // Mark messages as read first
      await markMessagesAsRead(friendId);
      
      // Open the chat immediately - don't wait
      onOpenChat(friendId, friendName);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Still open chat even if marking as read fails
      onOpenChat(friendId, friendName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          Friends
        </h2>
        <Button onClick={() => setShowAddFriend(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Friend Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {request.friend_profile?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.friend_profile?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {request.friend_profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Friends ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No friends yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add friends to share your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.friend_profile?.name?.charAt(0) || '?'}
                      </div>
                      {unreadByFriend[friend.friend_id] > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {friend.friend_profile?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {friend.friend_profile?.email}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenChatWithFriend(friend.friend_id, friend.friend_profile?.name || 'Friend')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter friend's email"
                value={friendEmail}
                onChange={(e) => {
                  setFriendEmail(e.target.value);
                  if (error) setError(''); // Clear error when typing
                }}
                type="email"
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your friend must have a FitTrack account with this email.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleSendFriendRequest} 
                disabled={loading || !friendEmail.trim()}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddFriend(false);
                  setError('');
                  setFriendEmail('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendsPanel;
