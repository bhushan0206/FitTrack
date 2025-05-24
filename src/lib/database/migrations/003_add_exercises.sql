-- Create exercises table for storing predefined and custom exercises
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('cardio', 'strength', 'yoga', 'hiit')),
    description TEXT,
    instructions JSONB, -- Array of instruction steps
    muscle_groups JSONB, -- Array of target muscle groups
    equipment JSONB, -- Array of required equipment
    duration INTEGER, -- Default duration in minutes
    calories_per_minute DECIMAL(5,2),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    image_url TEXT,
    is_custom BOOLEAN DEFAULT false, -- True for user-created exercises
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for predefined exercises
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercise_logs table for tracking exercise sessions
CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration INTEGER NOT NULL, -- Actual duration in minutes
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(6,2), -- in kg or lbs
    distance DECIMAL(8,2), -- in km or miles
    calories INTEGER,
    notes TEXT,
    intensity VARCHAR(20) CHECK (intensity IN ('Low', 'Moderate', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_sessions table for grouping exercises into workouts
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_duration INTEGER NOT NULL DEFAULT 0,
    total_calories INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_log_id UUID NOT NULL REFERENCES exercise_logs(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_id ON exercise_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);

-- Enable RLS (Row Level Security)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
CREATE POLICY "Users can view all predefined exercises and their own custom exercises" ON exercises
    FOR SELECT USING (is_custom = false OR user_id = auth.uid());

CREATE POLICY "Users can create custom exercises" ON exercises
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom exercises" ON exercises
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own custom exercises" ON exercises
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for exercise_logs
CREATE POLICY "Users can view their own exercise logs" ON exercise_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own exercise logs" ON exercise_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exercise logs" ON exercise_logs
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own exercise logs" ON exercise_logs
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" ON workout_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own workout sessions" ON workout_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workout sessions" ON workout_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workout sessions" ON workout_sessions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view workout exercises for their own workouts" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_sessions 
            WHERE workout_sessions.id = workout_exercises.workout_session_id 
            AND workout_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage workout exercises for their own workouts" ON workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workout_sessions 
            WHERE workout_sessions.id = workout_exercises.workout_session_id 
            AND workout_sessions.user_id = auth.uid()
        )
    );

-- Insert predefined exercises
INSERT INTO exercises (name, category, description, instructions, muscle_groups, equipment, duration, calories_per_minute, difficulty, is_custom, user_id) VALUES
-- Cardio Exercises
('Running', 'cardio', 'Outdoor or treadmill running', 
 '["Start with a 5-minute warm-up walk", "Gradually increase pace to comfortable running speed", "Maintain steady breathing rhythm", "Cool down with 5-minute walk"]',
 '[]', '["Running shoes"]', 30, 10.0, 'Intermediate', false, NULL),

('Cycling', 'cardio', 'Indoor or outdoor cycling',
 '["Adjust bike seat to proper height", "Start with easy pace for 5 minutes", "Increase intensity gradually", "Maintain proper posture"]',
 '[]', '["Bicycle", "Helmet"]', 45, 8.0, 'Beginner', false, NULL),

('Jumping Jacks', 'cardio', 'Full-body cardio exercise',
 '["Stand with feet together, arms at sides", "Jump while spreading legs shoulder-width apart", "Simultaneously raise arms overhead", "Jump back to starting position"]',
 '[]', '[]', 15, 7.0, 'Beginner', false, NULL),

-- Strength Exercises
('Push-ups', 'strength', 'Upper body strength exercise',
 '["Start in plank position with hands shoulder-width apart", "Lower body until chest nearly touches floor", "Push back up to starting position", "Keep core engaged throughout"]',
 '["Chest", "Triceps", "Shoulders"]', '[]', 15, 5.0, 'Intermediate', false, NULL),

('Squats', 'strength', 'Lower body strength exercise',
 '["Stand with feet shoulder-width apart", "Lower hips back and down as if sitting in chair", "Keep knees behind toes", "Return to standing position"]',
 '["Quadriceps", "Glutes", "Hamstrings"]', '[]', 15, 6.0, 'Beginner', false, NULL),

('Deadlifts', 'strength', 'Full body strength exercise',
 '["Stand with feet hip-width apart, barbell over mid-foot", "Hinge at hips, keep back straight", "Grip bar with hands shoulder-width apart", "Drive through heels to stand up"]',
 '["Hamstrings", "Glutes", "Back", "Core"]', '["Barbell", "Weights"]', 20, 7.0, 'Advanced', false, NULL),

-- Yoga Exercises
('Sun Salutation', 'yoga', 'Traditional yoga sequence',
 '["Start in mountain pose", "Raise arms overhead (upward salute)", "Fold forward (standing forward bend)", "Step back to downward dog", "Flow through vinyasa sequence"]',
 '[]', '["Yoga mat"]', 20, 3.0, 'Intermediate', false, NULL),

('Warrior Pose', 'yoga', 'Standing yoga pose for strength and balance',
 '["Step left foot back 3-4 feet", "Turn left foot out 90 degrees", "Bend right knee over ankle", "Raise arms overhead", "Hold and breathe deeply"]',
 '[]', '["Yoga mat"]', 10, 2.0, 'Beginner', false, NULL),

('Child''s Pose', 'yoga', 'Restorative yoga pose',
 '["Kneel on floor with big toes touching", "Sit back on heels", "Fold forward, extending arms in front", "Rest forehead on mat", "Breathe deeply and relax"]',
 '[]', '["Yoga mat"]', 5, 1.0, 'Beginner', false, NULL),

-- HIIT Exercises
('Burpees', 'hiit', 'Full-body high-intensity exercise',
 '["Start in standing position", "Drop into squat, place hands on floor", "Jump feet back to plank position", "Do push-up, jump feet back to squat", "Jump up with arms overhead"]',
 '[]', '[]', 10, 12.0, 'Advanced', false, NULL),

('Mountain Climbers', 'hiit', 'High-intensity cardio exercise',
 '["Start in plank position", "Bring right knee toward chest", "Quickly switch legs", "Continue alternating at fast pace", "Keep core engaged"]',
 '[]', '[]', 15, 10.0, 'Intermediate', false, NULL),

('High Knees', 'hiit', 'High-intensity cardio movement',
 '["Stand with feet hip-width apart", "Run in place lifting knees high", "Aim to bring knees to waist level", "Pump arms naturally", "Maintain fast pace"]',
 '[]', '[]', 12, 9.0, 'Beginner', false, NULL);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_logs_updated_at BEFORE UPDATE ON exercise_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
