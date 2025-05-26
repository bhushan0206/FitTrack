import { supabase } from './supabase';
import { Friend, Message, WorkoutShare, ProgressShare, Conversation } from '@/types/social';
import { ExerciseLog } from '@/types/exercise';
import { DailyLog, TrackingCategory } from '@/types/fitness';

export const socialStorage = {
  // Helper function to ensure user profile exists (with fallback)
  async ensureProfile(user: any) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Ensuring profile exists for user');
      }
      
      // First check if profile exists
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it manually
        console.log('Creating profile manually for user:', user.id);
        
        const profileData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.user_metadata?.display_name ||
                user.email?.split('@')[0] || 
                'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile manually:', createError);
          throw createError;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Profile created successfully');
        }
        return newProfile;
      } else if (error) {
        console.error('Error checking profile:', error);
        throw error;
      }

      console.log('Profile already exists:', existingProfile);
      return existingProfile;
    } catch (error) {
      console.error('Error in ensureProfile');
      throw error;
    }
  },

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

      // Ensure current user has a profile
      try {
        await this.ensureProfile(user);
      } catch (profileError) {
        console.error('Error ensuring user profile:', profileError);
        return { success: false, error: 'Unable to access user profiles. Please try again later.' };
      }

      // Test basic database connectivity first
      try {
        const { data: testQuery, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('Database connectivity test failed:', testError);
          return { success: false, error: `Database error: ${testError.message}. Please contact support.` };
        }
      } catch (error) {
        console.error('Database connection error:', error);
        return { success: false, error: 'Cannot connect to database. Please try again later.' };
      }

      // Find user by email in profiles table with better error handling
      if (process.env.NODE_ENV === 'development') {
        console.log('Searching for user with email');
      }
      
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('email', friendEmail.toLowerCase().trim())
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (profileError) {
        console.error('Error searching for friend profile:', profileError);
        return { success: false, error: `Search error: ${profileError.message}. Please try again.` };
      }

      if (!friendProfile) {
        return { success: false, error: 'User with this email not found. Make sure they have signed up for FitTrack.' };
      }

      if (friendProfile.id === user.id) {
        return { success: false, error: 'Cannot add yourself as friend.' };
      }

      console.log('Found friend profile:', friendProfile);
      return await this.createFriendRequest(user.id, friendProfile.id);
    } catch (error) {
      console.error('Error sending friend request');
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  },

  async createFriendRequest(userId: string, friendId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if friendship already exists in either direction
      const { data: existing } = await supabase
        .from('friends')
        .select('id, status, user_id, friend_id, requested_by')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (existing && existing.length > 0) {
        const friendship = existing[0];
        if (friendship.status === 'accepted') {
          return { success: false, error: 'You are already friends with this user.' };
        } else if (friendship.status === 'pending') {
          return { success: false, error: 'Friend request already sent or received.' };
        }
      }

      // ALWAYS enforce the constraint: smaller UUID first
      const [firstId, secondId] = [userId, friendId].sort();

      console.log('Creating friendship with constraint', { 
        user_id: firstId, 
        friend_id: secondId, 
        requested_by: userId,
        constraint_check: firstId < secondId 
      });

      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: firstId,      // Always smaller UUID (enforced by CHECK constraint)
          friend_id: secondId,   // Always larger UUID (enforced by CHECK constraint)
          status: 'pending',
          requested_by: userId   // Track actual requester
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        
        // Handle constraint violation errors
        if (error.code === '23505') { // unique_violation
          return { success: false, error: 'Friend request already exists.' };
        } else if (error.code === '23514') { // check_violation
          return { success: false, error: 'Invalid friendship data.' };
        }
        
        return { success: false, error: 'Failed to send friend request. Please try again.' };
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Friendship created successfully');
      }
      return { success: true };
    } catch (error) {
      console.error('Error creating friend request');
      return { success: false, error: 'Failed to send friend request. Please try again.' };
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

      // Get friendships where current user is involved and status is accepted
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching friendships:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Get friend IDs (the other person in each friendship)
      const friendIds = friendships.map(friendship => 
        friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
      );

      // Fetch friend profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', friendIds);

      if (profileError) {
        console.error('Error fetching friend profiles:', profileError);
        return friendships.map(friendship => ({
          ...friendship,
          friend_id: friendship.user_id === user.id ? friendship.friend_id : friendship.user_id,
          friend_profile: null
        }));
      }

      // Combine friendships with profiles
      return friendships.map(friendship => {
        const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
        const friendProfile = profiles?.find(p => p.id === friendId) || null;
        
        return {
          ...friendship,
          friend_id: friendId,
          friend_profile: friendProfile
        };
      });
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

      // Get pending requests where current user is the recipient
      // This means the request was NOT initiated by the current user
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'pending')
        .neq('requested_by', user.id); // Only requests FROM others TO current user

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Get requester IDs
      const requesterIds = friendships.map(f => f.requested_by);
      
      // Fetch requester profiles
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
        friend_profile: profiles?.find(p => p.id === friendship.requested_by) || null
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

      // Update the friend request to accepted
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`); // Ensure user is part of this friendship

      if (updateError) {
        console.error('Error accepting friend request:', updateError);
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
        console.error('Auth error in sendMessage:', authError);
        return { success: false, error: 'Please sign in to send messages.' };
      }

      console.log('Sending message:', { 
        sender_id: user.id, 
        receiver_id: receiverId, 
        content, 
        message_type: messageType,
        shared_data: sharedData 
      });

      // Verify friendship exists - check both directions since we only store one record
      const { data: friendships, error: friendshipError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${user.id})`)
        .eq('status', 'accepted');

      if (friendshipError) {
        console.error('Friendship verification failed:', friendshipError);
        return { success: false, error: 'Unable to verify friendship status. Please try again.' };
      }

      // Check if friendship exists
      if (!friendships || friendships.length === 0) {
        console.error('No friendship found between users');
        return { success: false, error: 'You can only send messages to friends.' };
      }

      console.log('Friendship verified successfully');

      // Insert the message
      const messageData = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        message_type: messageType,
        shared_data: sharedData || null,
        read: false,
        created_at: new Date().toISOString()
      };

      const { data: messageResult, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        return { success: false, error: 'Failed to send message. Please try again.' };
      }
      
      console.log('Message sent successfully:', messageResult);
      return { success: true };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, returning empty conversations');
        return [];
      }

      // Get all messages involving the current user (without foreign key joins)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      if (!messages || messages.length === 0) {
        return [];
      }

      // Get unique user IDs for profile lookup
      const userIds = new Set<string>();
      messages.forEach(message => {
        userIds.add(message.sender_id);
        userIds.add(message.receiver_id);
      });

      // Fetch all relevant profiles manually
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', Array.from(userIds));

      if (profileError) {
        console.error('Error fetching profiles for conversations:', profileError);
        return [];
      }

      // Create a profile lookup map
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();

      messages.forEach(message => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const partnerProfile = profileMap.get(partnerId);

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: `conversation_${user.id}_${partnerId}`,
            participant_id: partnerId,
            participant_profile: partnerProfile || null,
            last_message: {
              ...message,
              sender_profile: profileMap.get(message.sender_id) || null
            },
            unread_count: 0,
            updated_at: message.created_at
          });
        }

        // Count unread messages (messages sent to current user that are unread)
        if (message.receiver_id === user.id && !message.read) {
          const conversation = conversationMap.get(partnerId)!;
          conversation.unread_count += 1;
        }

        // Update last message if this message is newer
        const conversation = conversationMap.get(partnerId)!;
        if (new Date(message.created_at) > new Date(conversation.last_message.created_at)) {
          conversation.last_message = {
            ...message,
            sender_profile: profileMap.get(message.sender_id) || null
          };
          conversation.updated_at = message.created_at;
        }
      });

      return Array.from(conversationMap.values()).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getMessages(friendId: string): Promise<Message[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, returning empty messages');
        return [];
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id(id, name, avatar_url),
          receiver_profile:receiver_id(id, name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Real-time subscriptions
  subscribeToMessages(callback: (message: Message) => void) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up message subscription...');
    }
    
    return supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        },
        async (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Real-time message received');
          }
          const message = payload.new as Message;
          
          // Fetch sender profile for the new message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', message.sender_id)
            .single();
          
          // Ensure message has an ID
          const messageWithProfile = {
            ...message,
            id: message.id || `msg-${Date.now()}-${Math.random()}`,
            sender_profile: senderProfile
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Calling callback with message');
          }
          callback(messageWithProfile);
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Message subscription status:', status);
        }
      });
  },

  subscribeToFriendRequests(callback: (friend: Friend) => void) {
    return supabase
      .channel('friends')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friends' },
        (payload) => callback(payload.new as Friend)
      )
      .subscribe();
  },

  async markMessagesAsRead(friendId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'Please sign in to mark messages as read.' };
      }

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', friendId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: 'Failed to mark messages as read.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async shareWorkout(friendId: string, exerciseLogs: any[], date: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const totalDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0);
      const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

      const workoutShare = {
        workout_date: date,
        total_duration: totalDuration,
        total_calories: totalCalories,
        exercise_logs: exerciseLogs,
        notes: notes || ''
      };

      const message = notes 
        ? `${notes}\n\nShared my workout: ${totalDuration} minutes, ${totalCalories} calories burned!`
        : `Just completed my workout: ${totalDuration} minutes, ${totalCalories} calories burned! 💪`;

      return await this.sendMessage(friendId, message, 'workout_share', workoutShare);
    } catch (error) {
      console.error('Error sharing workout:', error);
      return { success: false, error: 'Failed to share workout. Please try again.' };
    }
  },

  async shareProgress(friendId: string, dailyLogs: any[], categories: any[], date: string): Promise<{ success: boolean; error?: string }> {
    try {
      const completedCategories = categories.filter(category => {
        const categoryLogs = dailyLogs.filter(log => log.categoryId === category.id);
        const value = categoryLogs.reduce((sum, log) => sum + log.value, 0);
        return value >= category.dailyTarget;
      }).length;

      const overallCompletion = categories.length > 0 ? (completedCategories / categories.length) * 100 : 0;

      const progressCategories = categories.map(category => {
        const categoryLogs = dailyLogs.filter(log => log.categoryId === category.id);
        const value = categoryLogs.reduce((sum, log) => sum + log.value, 0);
        const percentage = category.dailyTarget > 0 ? (value / category.dailyTarget) * 100 : 0;

        return {
          name: category.name,
          color: category.color,
          percentage: Math.min(percentage, 100)
        };
      });

      const progressShare = {
        date,
        completed_categories: completedCategories,
        overall_completion: overallCompletion,
        categories: progressCategories
      };

      const message = `My daily progress update: ${completedCategories}/${categories.length} goals completed (${Math.round(overallCompletion)}% overall) 📊`;

      return await this.sendMessage(friendId, message, 'progress_share', progressShare);
    } catch (error) {
      console.error('Error sharing progress:', error);
      return { success: false, error: 'Failed to share progress. Please try again.' };
    }
  },

  async getUnreadMessageCount(): Promise<number> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};
