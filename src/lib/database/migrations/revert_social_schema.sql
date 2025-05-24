-- Revert back to UUID format for user IDs

-- Drop existing foreign key constraints
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_user_id_fkey;
ALTER TABLE friends DROP CONSTRAINT IF EXISTS friends_friend_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Revert profiles table to use UUID
ALTER TABLE profiles ALTER COLUMN id TYPE UUID USING id::UUID;

-- Revert friends table to use UUID for user IDs
ALTER TABLE friends ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
ALTER TABLE friends ALTER COLUMN friend_id TYPE UUID USING friend_id::UUID;

-- Revert messages table to use UUID for user IDs  
ALTER TABLE messages ALTER COLUMN sender_id TYPE UUID USING sender_id::UUID;
ALTER TABLE messages ALTER COLUMN receiver_id TYPE UUID USING receiver_id::UUID;

-- Add back foreign key constraints with auth.users reference
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to work with proper auth
DROP POLICY IF EXISTS "Users can view their friendships" ON friends;
DROP POLICY IF EXISTS "Users can create friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friends;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate policies with proper auth.uid() usage
CREATE POLICY "Users can view their friendships" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of" ON friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Profile policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
