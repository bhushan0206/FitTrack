import { Exercise, ExerciseCategoryInfo } from '@/types/exercise';

export const exerciseCategories: ExerciseCategoryInfo[] = [
  {
    id: 'cardio',
    name: 'Cardio',
    color: '#ef4444',
    icon: '🏃‍♂️',
    description: 'Cardiovascular exercises to improve heart health and endurance',
    benefits: ['Improves heart health', 'Burns calories', 'Increases endurance', 'Boosts mood']
  },
  {
    id: 'strength',
    name: 'Strength',
    color: '#3b82f6',
    icon: '💪',
    description: 'Resistance training to build muscle and increase strength',
    benefits: ['Builds muscle mass', 'Increases strength', 'Improves bone density', 'Boosts metabolism']
  },
  {
    id: 'yoga',
    name: 'Yoga',
    color: '#10b981',
    icon: '🧘‍♀️',
    description: 'Mind-body practice combining physical poses, breathing, and meditation',
    benefits: ['Improves flexibility', 'Reduces stress', 'Enhances balance', 'Promotes mindfulness']
  },
  {
    id: 'hiit',
    name: 'HIIT',
    color: '#f59e0b',
    icon: '⚡',
    description: 'High-Intensity Interval Training for maximum calorie burn',
    benefits: ['Burns calories fast', 'Improves metabolism', 'Time efficient', 'Increases fitness']
  }
];

export const predefinedExercises: Exercise[] = [
  // Cardio Exercises
  {
    id: 'running',
    name: 'Running',
    category: 'cardio',
    description: 'Outdoor or treadmill running',
    duration: 30,
    caloriesPerMinute: 10,
    difficulty: 'Intermediate',
    equipment: ['Running shoes'],
    instructions: [
      'Start with a 5-minute warm-up walk',
      'Gradually increase pace to comfortable running speed',
      'Maintain steady breathing rhythm',
      'Cool down with 5-minute walk'
    ]
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: 'cardio',
    description: 'Indoor or outdoor cycling',
    duration: 45,
    caloriesPerMinute: 8,
    difficulty: 'Beginner',
    equipment: ['Bicycle', 'Helmet'],
    instructions: [
      'Adjust bike seat to proper height',
      'Start with easy pace for 5 minutes',
      'Increase intensity gradually',
      'Maintain proper posture'
    ]
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    description: 'Full-body cardio exercise',
    duration: 15,
    caloriesPerMinute: 7,
    difficulty: 'Beginner',
    equipment: [],
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump while spreading legs shoulder-width apart',
      'Simultaneously raise arms overhead',
      'Jump back to starting position'
    ]
  },

  // Strength Exercises
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'strength',
    description: 'Upper body strength exercise',
    duration: 15,
    caloriesPerMinute: 5,
    difficulty: 'Intermediate',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: [],
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core engaged throughout'
    ]
  },
  {
    id: 'squats',
    name: 'Squats',
    category: 'strength',
    description: 'Lower body strength exercise',
    duration: 15,
    caloriesPerMinute: 6,
    difficulty: 'Beginner',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: [],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower hips back and down as if sitting in chair',
      'Keep knees behind toes',
      'Return to standing position'
    ]
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    category: 'strength',
    description: 'Full body strength exercise',
    duration: 20,
    caloriesPerMinute: 7,
    difficulty: 'Advanced',
    muscleGroups: ['Hamstrings', 'Glutes', 'Back', 'Core'],
    equipment: ['Barbell', 'Weights'],
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot',
      'Hinge at hips, keep back straight',
      'Grip bar with hands shoulder-width apart',
      'Drive through heels to stand up'
    ]
  },

  // Yoga Exercises
  {
    id: 'sun-salutation',
    name: 'Sun Salutation',
    category: 'yoga',
    description: 'Traditional yoga sequence',
    duration: 20,
    caloriesPerMinute: 3,
    difficulty: 'Intermediate',
    equipment: ['Yoga mat'],
    instructions: [
      'Start in mountain pose',
      'Raise arms overhead (upward salute)',
      'Fold forward (standing forward bend)',
      'Step back to downward dog',
      'Flow through vinyasa sequence'
    ]
  },
  {
    id: 'warrior-pose',
    name: 'Warrior Pose',
    category: 'yoga',
    description: 'Standing yoga pose for strength and balance',
    duration: 10,
    caloriesPerMinute: 2,
    difficulty: 'Beginner',
    equipment: ['Yoga mat'],
    instructions: [
      'Step left foot back 3-4 feet',
      'Turn left foot out 90 degrees',
      'Bend right knee over ankle',
      'Raise arms overhead',
      'Hold and breathe deeply'
    ]
  },
  {
    id: 'child-pose',
    name: 'Child\'s Pose',
    category: 'yoga',
    description: 'Restorative yoga pose',
    duration: 5,
    caloriesPerMinute: 1,
    difficulty: 'Beginner',
    equipment: ['Yoga mat'],
    instructions: [
      'Kneel on floor with big toes touching',
      'Sit back on heels',
      'Fold forward, extending arms in front',
      'Rest forehead on mat',
      'Breathe deeply and relax'
    ]
  },

  // HIIT Exercises
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'hiit',
    description: 'Full-body high-intensity exercise',
    duration: 10,
    caloriesPerMinute: 12,
    difficulty: 'Advanced',
    equipment: [],
    instructions: [
      'Start in standing position',
      'Drop into squat, place hands on floor',
      'Jump feet back to plank position',
      'Do push-up, jump feet back to squat',
      'Jump up with arms overhead'
    ]
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'hiit',
    description: 'High-intensity cardio exercise',
    duration: 15,
    caloriesPerMinute: 10,
    difficulty: 'Intermediate',
    equipment: [],
    instructions: [
      'Start in plank position',
      'Bring right knee toward chest',
      'Quickly switch legs',
      'Continue alternating at fast pace',
      'Keep core engaged'
    ]
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'hiit',
    description: 'High-intensity cardio movement',
    duration: 12,
    caloriesPerMinute: 9,
    difficulty: 'Beginner',
    equipment: [],
    instructions: [
      'Stand with feet hip-width apart',
      'Run in place lifting knees high',
      'Aim to bring knees to waist level',
      'Pump arms naturally',
      'Maintain fast pace'
    ]
  }
];
