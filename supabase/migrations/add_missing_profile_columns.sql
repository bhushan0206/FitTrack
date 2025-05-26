-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS fitness_goal TEXT;

-- Add check constraint for height (reasonable range)
ALTER TABLE profiles 
ADD CONSTRAINT height_range CHECK (height IS NULL OR (height >= 100 AND height <= 250));

-- Add check constraint for fitness_goal (valid options)
ALTER TABLE profiles 
ADD CONSTRAINT valid_fitness_goal CHECK (
  fitness_goal IS NULL OR 
  fitness_goal IN ('lose_weight', 'gain_weight', 'build_muscle', 'improve_endurance', 'maintain_health', 'other')
);
