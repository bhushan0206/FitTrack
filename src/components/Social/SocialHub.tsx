import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Share } from 'lucide-react';
import FriendsPanel from './FriendsPanel';
import ChatPanel from './ChatPanel';
import SharePanel from './SharePanel'

const SocialHub = () => {
  const [activeView, setActiveView] = useState<'hub' | 'chat'>('hub');
  const [selectedFriend, setSelectedFriend] = useState<{ id: string; name: string } | null>(null);

  const handleOpenChat = (friendId: string, friendName: string) => {
    setSelectedFriend({ id: friendId, name: friendName });
    setActiveView('chat');
  };

  const handleBackToHub = () => {
    setActiveView('hub');
    setSelectedFriend(null);
  };

  if (activeView === 'chat' && selectedFriend) {
    return (
      <div className="h-[calc(100vh-200px)]">
        <ChatPanel
          friendId={selectedFriend.id}
          friendName={selectedFriend.name}
          onBack={handleBackToHub}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-purple-600" />
          Social Hub
        </h1>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsPanel onOpenChat={handleOpenChat} />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No conversations yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add friends and start chatting!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <SharePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHub;
