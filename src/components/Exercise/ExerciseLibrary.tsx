import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Play, Heart, Clock, Zap, Target, BookOpen, Video } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string;
  instructions: string[];
  tips: string[];
  variations: string[];
  caloriesBurnedPerMinute: number;
  duration: string;
  videoUrl?: string;
  image?: string;
}

interface ExerciseLibraryProps {
  onStartExercise?: (exercise: Exercise) => void;
  onViewExerciseDetails?: (exercise: Exercise) => void;
}

const EXERCISE_DATABASE: Exercise[] = [
  {
    id: 'push-ups',
    name: 'Push-ups',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your core tight throughout the movement'
    ],
    tips: [
      'Keep your body in a straight line',
      'Don\'t let your hips sag',
      'Control the movement both up and down'
    ],
    variations: [
      'Knee push-ups (easier)',
      'Diamond push-ups (harder)',
      'Incline push-ups (easier)',
      'Decline push-ups (harder)'
    ],
    caloriesBurnedPerMinute: 7,
    duration: '3 sets of 10-15 reps'
  },
  {
    id: 'squats',
    name: 'Squats',
    muscleGroups: ['legs', 'glutes', 'core'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Push through heels to return to starting position'
    ],
    tips: [
      'Keep your weight on your heels',
      'Don\'t let knees cave inward',
      'Go as low as your mobility allows'
    ],
    variations: [
      'Goblet squats (with weight)',
      'Jump squats (explosive)',
      'Single-leg squats (advanced)',
      'Wall squats (assisted)'
    ],
    caloriesBurnedPerMinute: 8,
    duration: '3 sets of 12-20 reps'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    muscleGroups: ['cardio', 'core', 'legs', 'shoulders'],
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    instructions: [
      'Start standing, then squat down and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up (optional)',
      'Jump feet back to squat position',
      'Jump up with arms overhead'
    ],
    tips: [
      'Land softly when jumping',
      'Keep core engaged throughout',
      'Modify by stepping instead of jumping'
    ],
    variations: [
      'Half burpees (no push-up)',
      'Burpee box jumps',
      'Single-arm burpees',
      'Burpee broad jumps'
    ],
    caloriesBurnedPerMinute: 12,
    duration: '3 sets of 5-10 reps'
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroups: ['core', 'shoulders', 'back'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    instructions: [
      'Start in push-up position',
      'Lower to forearms, keeping elbows under shoulders',
      'Keep body in straight line from head to heels',
      'Hold position while breathing normally'
    ],
    tips: [
      'Don\'t let hips sag or pike up',
      'Engage core and glutes',
      'Keep neck neutral'
    ],
    variations: [
      'Side planks',
      'Plank up-downs',
      'Mountain climber planks',
      'Plank with leg lifts'
    ],
    caloriesBurnedPerMinute: 3,
    duration: '3 sets of 30-60 seconds'
  },
  {
    id: 'freestyle-swimming',
    name: 'Freestyle Swimming',
    muscleGroups: ['cardio', 'shoulders', 'back', 'core'],
    difficulty: 'intermediate',
    equipment: 'pool',
    instructions: [
      'Start with your body horizontal in the water',
      'Alternate arm strokes, reaching forward and pulling through the water',
      'Keep your body rotating side to side with each stroke',
      'Breathe every 2-3 strokes by turning your head to the side',
      'Kick with straight legs from the hips'
    ],
    tips: [
      'Keep your head in neutral position when not breathing',
      'Reach forward fully before beginning the pull',
      'Rotate your entire body, not just your arms',
      'Exhale underwater, inhale quickly above water'
    ],
    variations: [
      'Slow freestyle for endurance',
      'Sprint freestyle intervals',
      'One-arm freestyle drill',
      'Catch-up freestyle drill'
    ],
    caloriesBurnedPerMinute: 11,
    duration: '20-45 minutes continuous or intervals'
  },
  {
    id: 'backstroke-swimming',
    name: 'Backstroke Swimming',
    muscleGroups: ['cardio', 'back', 'shoulders', 'core'],
    difficulty: 'intermediate',
    equipment: 'pool',
    instructions: [
      'Lie on your back with body horizontal in the water',
      'Alternate arm strokes, reaching back and pulling through',
      'Keep your head still and looking straight up',
      'Kick with straight legs from the hips',
      'Rotate your body slightly with each stroke'
    ],
    tips: [
      'Keep your hips up near the surface',
      'Don\'t lift your head - it will sink your hips',
      'Pinky finger enters water first on each stroke',
      'Keep a steady, continuous kick'
    ],
    variations: [
      'Single-arm backstroke drill',
      'Backstroke with flutter board',
      'Sprint backstroke intervals',
      'Long distance backstroke'
    ],
    caloriesBurnedPerMinute: 10,
    duration: '15-40 minutes continuous or intervals'
  },
  {
    id: 'breaststroke-swimming',
    name: 'Breaststroke Swimming',
    muscleGroups: ['cardio', 'chest', 'shoulders', 'legs'],
    difficulty: 'beginner',
    equipment: 'pool',
    instructions: [
      'Start with arms extended forward, body horizontal',
      'Pull arms out and around in a heart shape',
      'Breathe by lifting your head as arms complete the pull',
      'Bring arms back to starting position',
      'Kick with a frog-like motion, bringing heels to glutes then snapping out'
    ],
    tips: [
      'Timing is key - pull, breathe, kick, glide',
      'Keep your head down during the glide phase',
      'Don\'t pull too wide with your arms',
      'Get a good glide between each stroke'
    ],
    variations: [
      'Breaststroke pull with flutter board',
      'Breaststroke kick with kickboard',
      'Two-stroke breathing pattern',
      'Sprint breaststroke intervals'
    ],
    caloriesBurnedPerMinute: 9,
    duration: '20-45 minutes continuous or intervals'
  },
  {
    id: 'butterfly-swimming',
    name: 'Butterfly Swimming',
    muscleGroups: ['cardio', 'shoulders', 'core', 'back'],
    difficulty: 'advanced',
    equipment: 'pool',
    instructions: [
      'Start with both arms extended forward',
      'Pull both arms simultaneously in a powerful stroke',
      'Lift your head and shoulders to breathe',
      'Perform a dolphin kick with both legs together',
      'Keep your body undulating like a wave'
    ],
    tips: [
      'Use your core to create the wave motion',
      'Don\'t fight the water - flow with it',
      'Breathe every 2-3 strokes to start',
      'Keep your kicks small and fast'
    ],
    variations: [
      'Single-arm butterfly drill',
      'Butterfly with fins',
      '25m butterfly sprints',
      'Butterfly kick on back'
    ],
    caloriesBurnedPerMinute: 14,
    duration: '10-25 minutes in short intervals'
  },
  {
    id: 'water-treading',
    name: 'Water Treading',
    muscleGroups: ['cardio', 'legs', 'core', 'shoulders'],
    difficulty: 'intermediate',
    equipment: 'pool',
    instructions: [
      'Position yourself in deep water where you can\'t touch bottom',
      'Keep your body vertical with head above water',
      'Use a scissor kick or egg-beater kick to stay afloat',
      'Move arms in a sculling motion for stability',
      'Maintain relaxed breathing'
    ],
    tips: [
      'Stay relaxed - tension wastes energy',
      'Use minimal arm movement for efficiency',
      'Practice different kicking techniques',
      'Focus on staying vertical, not moving forward'
    ],
    variations: [
      'Treading with arms out of water',
      'Treading with weights',
      'One-handed treading',
      'Treading in different positions'
    ],
    caloriesBurnedPerMinute: 8,
    duration: '5-15 minutes intervals'
  },
  {
    id: 'pool-running',
    name: 'Pool Running (Aqua Jogging)',
    muscleGroups: ['cardio', 'legs', 'core'],
    difficulty: 'beginner',
    equipment: 'pool, flotation belt',
    instructions: [
      'Wear a flotation belt around your waist',
      'Position yourself in deep water',
      'Simulate running motion while staying in place',
      'Pump your arms as you would when running on land',
      'Maintain an upright posture'
    ],
    tips: [
      'Keep your core engaged throughout',
      'Land on the balls of your feet',
      'Maintain a steady rhythm',
      'Use the water\'s resistance for strength training'
    ],
    variations: [
      'High-knee aqua jogging',
      'Interval sprints in water',
      'Backward aqua jogging',
      'Cross-country skiing motion'
    ],
    caloriesBurnedPerMinute: 9,
    duration: '20-45 minutes continuous'
  },
  {
    id: 'swimming-laps-mixed',
    name: 'Mixed Swimming Laps',
    muscleGroups: ['cardio', 'full-body'],
    difficulty: 'intermediate',
    equipment: 'pool',
    instructions: [
      'Warm up with 5 minutes easy freestyle',
      'Swim 4 laps freestyle at moderate pace',
      'Swim 2 laps backstroke',
      'Swim 2 laps breaststroke',
      'Rest 1 minute between sets',
      'Repeat cycle 3-5 times'
    ],
    tips: [
      'Focus on technique over speed',
      'Breathe bilaterally in freestyle',
      'Use different strokes to work different muscles',
      'Cool down with easy swimming'
    ],
    variations: [
      'Add butterfly laps for advanced swimmers',
      'Increase distance per stroke',
      'Time each set for improvement tracking',
      'Add kick-only or pull-only sets'
    ],
    caloriesBurnedPerMinute: 12,
    duration: '30-60 minutes total workout'
  }
];

const muscleGroups = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'legs', 'glutes', 'core', 'cardio', 'full-body'
];

const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
  onStartExercise = () => {}, 
  onViewExerciseDetails = () => {} 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = EXERCISE_DATABASE.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscleGroups.some(group => group.includes(searchTerm.toLowerCase()));
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
                              exercise.muscleGroups.includes(selectedMuscleGroup);
    const matchesDifficulty = selectedDifficulty === 'all' || 
                             exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesMuscleGroup && matchesDifficulty;
  });

  const toggleFavorite = (exerciseId: string) => {
    setFavorites(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
      setSelectedExercise(exercise);
      onViewExerciseDetails(exercise);
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(exercise.id);
            }}
            className={favorites.includes(exercise.id) ? 'text-red-500' : ''}
          >
            <Heart className={`w-4 h-4 ${favorites.includes(exercise.id) ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {exercise.muscleGroups.map(group => (
            <Badge key={group} variant="secondary" className="text-xs">
              {group}
            </Badge>
          ))}
          <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div>
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
            <div className="text-sm font-medium">{exercise.duration}</div>
          </div>
          <div>
            <Zap className="w-4 h-4 mx-auto mb-1 text-orange-500" />
            <div className="text-xs text-gray-600 dark:text-gray-400">Equipment</div>
            <div className="text-sm font-medium capitalize">{exercise.equipment}</div>
          </div>
          <div>
            <Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-xs text-gray-600 dark:text-gray-400">Cal/min</div>
            <div className="text-sm font-medium">{exercise.caloriesBurnedPerMinute}</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStartExercise(exercise);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedExercise(exercise);
              onViewExerciseDetails(exercise);
            }}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h2>
          <p className="text-gray-600 dark:text-gray-300">Discover exercises for your workout routine</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search exercises..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {muscleGroups.map(group => (
              <option key={group} value={group} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {group === 'all' ? 'All Muscle Groups' : group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {filteredExercises.length} exercises found
        </p>
        {favorites.length > 0 && (
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            {favorites.length} Favorites
          </Button>
        )}
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(exercise => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No exercises found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              {selectedExercise?.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedExercise && toggleFavorite(selectedExercise.id)}
                className={favorites.includes(selectedExercise?.id || '') ? 'text-red-500' : ''}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedExercise?.id || '') ? 'fill-current' : ''}`} />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Detailed exercise information including instructions, tips, and variations.
            </DialogDescription>
            <div className="flex flex-wrap gap-2">
              {selectedExercise?.muscleGroups.map(group => (
                <Badge key={group} variant="secondary">
                  {group}
                </Badge>
              ))}
              <Badge className={getDifficultyColor(selectedExercise?.difficulty || 'beginner')}>
                {selectedExercise?.difficulty}
              </Badge>
            </div>
          </DialogHeader>

          {selectedExercise && (
            <>
              <Tabs defaultValue="instructions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                  <TabsTrigger value="variations">Variations</TabsTrigger>
                </TabsList>

                <TabsContent value="instructions" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm font-medium">{selectedExercise.duration}</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <div className="text-sm font-medium capitalize">{selectedExercise.equipment}</div>
                      <div className="text-xs text-gray-600">Equipment</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <div className="text-sm font-medium">{selectedExercise.caloriesBurnedPerMinute} cal/min</div>
                      <div className="text-xs text-gray-600">Calories</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">How to perform:</h4>
                    <ol className="space-y-2">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-4">
                  <h4 className="font-medium">Pro Tips:</h4>
                  <ul className="space-y-2">
                    {selectedExercise.tips.map((tip, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-yellow-500">💡</span>
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="variations" className="space-y-4">
                  <h4 className="font-medium">Exercise Variations:</h4>
                  <ul className="space-y-2">
                    {selectedExercise.variations.map((variation, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-purple-500">🔄</span>
                        <span className="text-sm">{variation}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    onStartExercise(selectedExercise);
                    setSelectedExercise(null);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
                {selectedExercise.videoUrl && (
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibrary;
