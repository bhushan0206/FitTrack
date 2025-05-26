-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE profiles ADD COLUMN name TEXT;
  END IF;

  -- Add email column if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;

  -- Add age column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'age') THEN
    ALTER TABLE profiles ADD COLUMN age INTEGER;
  END IF;

  -- Add gender column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE profiles ADD COLUMN gender TEXT;
  END IF;

  -- Add weight column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'weight') THEN
    ALTER TABLE profiles ADD COLUMN weight DECIMAL(5,2);
  END IF;

  -- Add height column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'height') THEN
    ALTER TABLE profiles ADD COLUMN height INTEGER;
  END IF;

  -- Add fitness_goal column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'fitness_goal') THEN
    ALTER TABLE profiles ADD COLUMN fitness_goal TEXT;
  END IF;

  -- Add theme column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'theme') THEN
    ALTER TABLE profiles ADD COLUMN theme TEXT DEFAULT 'light';
  END IF;

  -- Add accentColor column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'accentColor') THEN
    ALTER TABLE profiles ADD COLUMN accentColor TEXT;
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add constraints for data validation
DO $$
BEGIN
  -- Add check constraint for age (reasonable range)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'age_range') THEN
    ALTER TABLE profiles ADD CONSTRAINT age_range CHECK (age IS NULL OR (age >= 13 AND age <= 120));
  END IF;

  -- Add check constraint for weight (reasonable range)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'weight_range') THEN
    ALTER TABLE profiles ADD CONSTRAINT weight_range CHECK (weight IS NULL OR (weight >= 20 AND weight <= 500));
  END IF;

  -- Add check constraint for height (reasonable range)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'height_range') THEN
    ALTER TABLE profiles ADD CONSTRAINT height_range CHECK (height IS NULL OR (height >= 100 AND height <= 250));
  END IF;

  -- Add check constraint for gender (valid options)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'valid_gender') THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_gender CHECK (
      gender IS NULL OR 
      gender IN ('male', 'female', 'other', 'prefer_not_to_say')
    );
  END IF;

  -- Add check constraint for fitness_goal (valid options)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'valid_fitness_goal') THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_fitness_goal CHECK (
      fitness_goal IS NULL OR 
      fitness_goal IN ('lose_weight', 'gain_weight', 'build_muscle', 'improve_endurance', 'maintain_health', 'other')
    );
  END IF;

  -- Add check constraint for theme (valid options)
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'profiles' AND constraint_name = 'valid_theme') THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_theme CHECK (
      theme IS NULL OR 
      theme IN ('light', 'dark')
    );
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Update existing profiles to have default values where needed
UPDATE profiles 
SET 
  name = COALESCE(name, 'User'),
  theme = COALESCE(theme, 'light'),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE name IS NULL OR theme IS NULL OR created_at IS NULL OR updated_at IS NULL;
