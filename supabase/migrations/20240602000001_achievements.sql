-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_badge_type_idx ON achievements(badge_type);

-- Enable row level security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON achievements;
CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Service can manage achievements" ON achievements;
CREATE POLICY "Service can manage achievements"
  ON achievements FOR ALL
  TO service_role
  USING (true);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE achievements;
