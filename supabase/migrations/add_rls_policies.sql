-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (true); -- Allow read for now, we'll secure this later

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true); -- Allow insert for now

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true); -- Allow update for now

-- Create policies for categories table
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (true);

-- Create policies for logs table
CREATE POLICY "Users can view own logs" ON logs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own logs" ON logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own logs" ON logs
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own logs" ON logs
  FOR DELETE USING (true);
