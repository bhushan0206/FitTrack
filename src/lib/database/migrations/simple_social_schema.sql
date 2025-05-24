-- Drop existing triggers first (they reference tables)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table only if it doesn't exist (preserves existing data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add any missing columns to existing profiles table
DO $$
BEGIN
  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- Create friends table only if it doesn't exist (preserves existing data)
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Add foreign key constraints to friends table if they don't exist
DO $$
BEGIN
  -- Add foreign key constraint for user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_user_id_fkey' 
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE public.friends 
    ADD CONSTRAINT friends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key constraint for friend_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_friend_id_fkey' 
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE public.friends 
    ADD CONSTRAINT friends_friend_id_fkey 
    FOREIGN KEY (friend_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create messages table only if it doesn't exist (preserves existing data)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'workout_share', 'progress_share')) DEFAULT 'text',
  shared_data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key constraints to messages table if they don't exist
DO $$
BEGIN
  -- Add foreign key constraint for sender_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key constraint for receiver_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_receiver_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add requested_by column to track who initiated the friendship
DO $$
BEGIN
  -- Add requested_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'friends' AND column_name = 'requested_by') THEN
    ALTER TABLE public.friends ADD COLUMN requested_by UUID;
    
    -- Add foreign key constraint for requested_by
    ALTER TABLE public.friends 
    ADD CONSTRAINT friends_requested_by_fkey 
    FOREIGN KEY (requested_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Clean up any duplicate friendships that might exist and normalize the data
DO $$
BEGIN
  -- First, let's see what duplicates exist and fix them
  -- Remove exact duplicates first
  WITH exact_duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, friend_id ORDER BY created_at) as rn
    FROM friends
  )
  DELETE FROM friends WHERE id IN (
    SELECT id FROM exact_duplicates WHERE rn > 1
  );

  -- Now handle bidirectional duplicates - keep only one record per friendship pair
  -- Always keep the one where user_id < friend_id, if both exist
  WITH bidirectional_duplicates AS (
    SELECT 
      f1.id as keep_id,
      f2.id as remove_id
    FROM friends f1
    JOIN friends f2 ON (
      f1.user_id = f2.friend_id AND f1.friend_id = f2.user_id
      AND f1.user_id < f1.friend_id  -- f1 has correct ordering
      AND f2.user_id > f2.friend_id  -- f2 has incorrect ordering
    )
  )
  DELETE FROM friends WHERE id IN (
    SELECT remove_id FROM bidirectional_duplicates
  );

  -- Now normalize remaining records to ensure user_id < friend_id
  UPDATE friends 
  SET 
    user_id = friend_id,
    friend_id = user_id
  WHERE user_id > friend_id;
  
  RAISE LOG 'Cleaned up and normalized friendship records';
END $$;

-- Drop the existing unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_user_id_friend_id_key' 
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE public.friends DROP CONSTRAINT friends_user_id_friend_id_key;
  END IF;
END $$;

-- Add a proper constraint to ensure user_id < friend_id and no duplicates
ALTER TABLE public.friends 
ADD CONSTRAINT friends_ordered_pair_unique 
UNIQUE (user_id, friend_id);

-- Add a check constraint to ensure user_id < friend_id
ALTER TABLE public.friends 
ADD CONSTRAINT friends_user_id_less_than_friend_id 
CHECK (user_id < friend_id);

-- Create indexes for performance (using IF NOT EXISTS for all)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (to avoid conflicts)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "friends_select_policy" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_policy" ON public.friends;
DROP POLICY IF EXISTS "friends_update_policy" ON public.friends;
DROP POLICY IF EXISTS "friends_delete_policy" ON public.friends;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;

-- RLS Policies for profiles (permissive for friend discovery)
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for friends
CREATE POLICY "friends_select_policy" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Simplified insert policy - the database constraints will handle uniqueness
CREATE POLICY "friends_insert_policy" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "friends_update_policy" ON public.friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friends_delete_policy" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for messages
CREATE POLICY "messages_select_policy" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_policy" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_policy" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "messages_delete_policy" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Grant necessary permissions explicitly
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.friends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO authenticated;

-- Grant sequence permissions if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log the trigger execution
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  INSERT INTO public.profiles (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      public.profiles.name
    ),
    updated_at = now();
    
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Don't fail the auth process if profile creation fails
END;
$$;

-- Create triggers (after tables and functions are created)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure realtime is set up
DO $$
BEGIN
  -- Add tables to realtime publication if it exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Could not add tables to realtime publication: %', SQLERRM;
END $$;

-- Create some test data to verify the setup works
DO $$
BEGIN
  RAISE LOG 'Social schema setup completed successfully';
END $$;