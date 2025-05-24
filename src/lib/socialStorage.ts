import { supabase } from './supabase';
import { Friend, Message, WorkoutShare, ProgressShare, Conversation } from '@/types/social';
import { ExerciseLog } from '@/types/exercise';
import { DailyLog, TrackingCategory } from '@/types/fitness';

export const socialStorage = {
  // Friend Management
  async sendFriendRequest(friendEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return { success: false, error: 'Authentication failed. Please sign in again.' };
      }
      
      if (!user) {
        return { success: false, error: 'Please sign in to send friend requests.' };
      }

      // First, ensure the current user has a profile
      await this.ensureProfile(user);

      // Find user by email - first check if they have a profile
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', friendEmail.toLowerCase().trim())
        .single();

      if (profileError || !friendProfile) {
        return { success: false, error: 'User with this email not found. Make sure they have signed up for FitTrack.' };
      }

      if (friendProfile.id === user.id) {
        return { success: false, error: 'Cannot add yourself as friend.' };
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${user.id})`);

      if (existing && existing.length > 0) {
        const friendship = existing[0];
        if (friendship.status === 'accepted') {
          return { success: false, error: 'You are already friends with this user.' };
        } else if (friendship.status === 'pending') {
          return { success: false, error: 'Friend request already sent or received.' };
        }
      }

      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendProfile.id,
          status: 'pending'
        });

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: 'Failed to send friend request. Please try again.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  },

  // Helper function to ensure user profile exists
  async ensureProfile(user: any) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error ensuring profile:', error);
    }
  },

  async getFriends(): Promise<Friend[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, returning empty friends list');
        return [];
      }

      // Ensure user profile exists
      await this.ensureProfile(user);

      // Get friends with manual join
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching friendships:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Manually fetch friend profiles
      const friendIds = friendships.map(f => f.friend_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', friendIds);

      if (profileError) {
        console.error('Error fetching friend profiles:', profileError);
        return friendships.map(friendship => ({
          ...friendship,
          friend_profile: null
        }));
      }

      // Combine friendships with profiles
      return friendships.map(friendship => ({
        ...friendship,
        friend_profile: profiles?.find(p => p.id === friendship.friend_id) || null
      }));
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  },

  async getPendingRequests(): Promise<Friend[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, returning empty pending requests');
        return [];
      }

      // Ensure user profile exists
      await this.ensureProfile(user);

      // Get pending requests with manual join
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Manually fetch requester profiles
      const requesterIds = friendships.map(f => f.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', requesterIds);

      if (profileError) {
        console.error('Error fetching requester profiles:', profileError);
        return friendships.map(friendship => ({
          ...friendship,
          friend_profile: null
        }));
      }

      // Combine friendships with profiles
      return friendships.map(friendship => ({
        ...friendship,
        friend_profile: profiles?.find(p => p.id === friendship.user_id) || null
      }));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  async acceptFriendRequest(friendshipId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Please sign in to accept friend requests.' };
      }

      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .eq('friend_id', user.id);

      if (error) {
        console.error('Error accepting friend request:', error);
        return { success: false, error: 'Failed to accept friend request. Please try again.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Messaging
  async sendMessage(receiverId: string, content: string, messageType: 'text' | 'workout_share' | 'progress_share' = 'text', sharedData?: WorkoutShare | ProgressShare): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Please sign in to send messages.' };
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: messageType,
          shared_data: sharedData
        });

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: 'Failed to send message. Please try again.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations_view')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getMessages(conversationPartnerId: string): Promise<Message[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get messages with manual join
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationPartnerId}),and(sender_id.eq.${conversationPartnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      if (!messages || messages.length === 0) {
        return [];
      }

      // Get sender profiles
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', senderIds);

      // Combine messages with profiles
      return messages.map(message => ({
        ...message,
        sender_profile: profiles?.find(p => p.id === message.sender_id) || null
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async markMessagesAsRead(senderId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Workout Sharing
  async shareWorkout(friendId: string, exerciseLogs: ExerciseLog[], workoutDate: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const workoutShare: WorkoutShare = {
        exercise_logs: exerciseLogs.map(log => ({
          exercise_name: `Exercise ${Math.random().toString(36).substr(2, 9)}`,
          duration: log.duration,
          calories: log.calories,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          intensity: log.intensity
        })),
        total_duration: exerciseLogs.reduce((sum, log) => sum + log.duration, 0),
        total_calories: exerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
        workout_date: workoutDate,
        notes
      };

      const message = `🏋️ Shared a workout from ${workoutDate}`;
      return this.sendMessage(friendId, message, 'workout_share', workoutShare);
    } catch (error) {
      console.error('Error sharing workout:', error);
      return { success: false, error: 'Failed to share workout. Please try again.' };
    }
  },

  // Progress Sharing
  async shareProgress(friendId: string, logs: DailyLog[], categories: TrackingCategory[], date: string): Promise<{ success: boolean; error?: string }> {
    try {
      const categoryStats = categories.map(category => {
        const categoryLogs = logs.filter(log => log.categoryId === category.id);
        const currentValue = categoryLogs.reduce((sum, log) => sum + log.value, 0);
        const percentage = (currentValue / category.dailyTarget) * 100;

        return {
          name: category.name,
          current_value: currentValue,
          target_value: category.dailyTarget,
          unit: category.unit,
          percentage,
          color: category.color
        };
      });

      const completedCategories = categoryStats.filter(stat => stat.percentage >= 100).length;

      const progressShare: ProgressShare = {
        categories: categoryStats,
        date,
        overall_completion: categories.length > 0 ? (completedCategories / categories.length) * 100 : 0,
        total_categories: categories.length,
        completed_categories: completedCategories
      };

      const message = `📊 Shared progress from ${date}`;
      return this.sendMessage(friendId, message, 'progress_share', progressShare);
    } catch (error) {
      console.error('Error sharing progress:', error);
      return { success: false, error: 'Failed to share progress. Please try again.' };
    }
  },

  // Real-time subscriptions
  subscribeToMessages(callback: (message: Message) => void) {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },

  subscribeToFriendRequests(callback: (friend: Friend) => void) {
    return supabase
      .channel('friends')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friends' },
        (payload) => callback(payload.new as Friend)
      )
      .subscribe();
  }
};
