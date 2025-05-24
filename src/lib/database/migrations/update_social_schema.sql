-- Update profiles table to handle non-UUID user IDs
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make sure profiles table can handle various ID formats
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Update friends table to use TEXT for user IDs
ALTER TABLE friends ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE friends ALTER COLUMN friend_id TYPE TEXT;

-- Update messages table to use TEXT for user IDs  
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;
ALTER TABLE messages ALTER COLUMN receiver_id TYPE TEXT;

-- Add foreign key constraints that reference profiles
ALTER TABLE friends ADD CONSTRAINT friends_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  
ALTER TABLE friends ADD CONSTRAINT friends_friend_id_fkey 
  FOREIGN KEY (friend_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
  
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies to work with TEXT IDs
DROP POLICY IF EXISTS "Users can view their friendships" ON friends;
DROP POLICY IF EXISTS "Users can create friend requests" ON friends;
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON friends;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;

-- Recreate policies with proper user identification
CREATE POLICY "Users can view their friendships" ON friends
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email') OR
    friend_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update friendships they're part of" ON friends
  FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email') OR
    friend_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email') OR
    receiver_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (
    receiver_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  );

-- Create or update profiles table with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (email = auth.jwt() ->> 'email');
