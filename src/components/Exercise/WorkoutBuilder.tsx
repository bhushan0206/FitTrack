import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Play, Pause, RotateCcw, Timer, Clock, Zap, Target } from 'lucide-react';

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration: number; // seconds
  restBetweenSets: number; // seconds
  caloriesPerMinute: number;
}

interface WorkoutBuilderProps {
  onStartExercise?: (exercise: any) => void;
  onViewExerciseDetails?: (exercise: any) => void;
}

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ 
  onStartExercise = () => {}, 
  onViewExerciseDetails = () => {} 
}) => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [restTime, setRestTime] = useState(30);
  const [isResting, setIsResting] = useState(false);
  const [isRestingBetweenSets, setIsRestingBetweenSets] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample exercises to add
  const availableExercises = [
    { id: 'push-ups', name: 'Push-ups', caloriesPerMinute: 7 },
    { id: 'squats', name: 'Squats', caloriesPerMinute: 8 },
    { id: 'burpees', name: 'Burpees', caloriesPerMinute: 12 },
    { id: 'plank', name: 'Plank', caloriesPerMinute: 3 },
    { id: 'lunges', name: 'Lunges', caloriesPerMinute: 6 },
    { id: 'mountain-climbers', name: 'Mountain Climbers', caloriesPerMinute: 10 }
  ];

  // Timer logic
  useEffect(() => {
    if (isTimerActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, isPaused, timeRemaining]);

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isTimerActive && !isPaused) {
      handleTimerComplete();
    }
  }, [timeRemaining, isTimerActive, isPaused]);

  const handleTimerComplete = () => {
    const currentExercise = exercises[currentExerciseIndex];
    
    if (isResting) {
      // Rest between exercises is complete
      setIsResting(false);
      moveToNextExercise();
    } else if (isRestingBetweenSets) {
      // Rest between sets is complete
      setIsRestingBetweenSets(false);
      setTimeRemaining(currentExercise.duration);
    } else {
      // Exercise is complete
      if (currentSet < currentExercise.sets) {
        // More sets to do
        setCurrentSet(prev => prev + 1);
        setIsRestingBetweenSets(true);
        setTimeRemaining(currentExercise.restBetweenSets);
      } else {
        // Exercise completely done
        if (currentExerciseIndex < exercises.length - 1) {
          // More exercises to do
          setIsResting(true);
          setTimeRemaining(restTime);
        } else {
          // Workout complete!
          completeWorkout();
        }
      }
    }
  };

  const moveToNextExercise = () => {
    const nextIndex = currentExerciseIndex + 1;
    setCurrentExerciseIndex(nextIndex);
    setCurrentSet(1);
    setTimeRemaining(exercises[nextIndex].duration);
  };

  const completeWorkout = () => {
    setIsTimerActive(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeRemaining(0);
    setIsResting(false);
    setIsRestingBetweenSets(false);
    setIsPaused(false);
    alert('Workout Complete! 🎉');
  };

  const addExercise = (availableExercise: any) => {
    const newExercise: WorkoutExercise = {
      id: `${availableExercise.id}-${Date.now()}`,
      name: availableExercise.name,
      sets: 3,
      reps: 10,
      duration: 60,
      restBetweenSets: 30,
      caloriesPerMinute: availableExercise.caloriesPerMinute
    };
    setExercises(prev => [...prev, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    setExercises(prev => prev.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    ));
  };

  const startWorkout = () => {
    if (exercises.length > 0) {
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setTimeRemaining(exercises[0].duration);
      setIsTimerActive(true);
      setIsResting(false);
      setIsRestingBetweenSets(false);
      setIsPaused(false);
      setWorkoutStartTime(new Date());
    }
  };

  const pauseWorkout = () => {
    setIsPaused(true);
  };

  const resumeWorkout = () => {
    setIsPaused(false);
  };

  const resetWorkout = () => {
    setIsTimerActive(false);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeRemaining(exercises.length > 0 ? exercises[0].duration : 0);
    setIsResting(false);
    setIsRestingBetweenSets(false);
    setIsPaused(false);
    setWorkoutStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalWorkoutTime = () => {
    return exercises.reduce((total, ex) => 
      total + (ex.duration * ex.sets) + (ex.restBetweenSets * (ex.sets - 1)), 0
    ) + (exercises.length - 1) * restTime;
  };

  const getEstimatedCalories = () => {
    return exercises.reduce((total, ex) => 
      total + (ex.caloriesPerMinute * (ex.duration * ex.sets / 60)), 0
    );
  };

  const getCurrentStatus = () => {
    if (!isTimerActive) return 'Ready to start';
    if (isPaused) return 'Paused';
    if (isResting) return 'Rest between exercises';
    if (isRestingBetweenSets) return 'Rest between sets';
    return 'Exercise in progress';
  };

  const getProgressPercentage = () => {
    if (!isTimerActive) return 0;
    const totalExercises = exercises.length;
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedSets = exercises.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.sets, 0) + (currentSet - 1);
    return (completedSets / totalSets) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-6 h-6" />
            Workout Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Workout name..."
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{exercises.length}</div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{formatTime(getTotalWorkoutTime())}</div>
                <div className="text-sm text-gray-600">Est. Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {exercises.reduce((total, ex) => total + ex.sets, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Sets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{Math.round(getEstimatedCalories())}</div>
                <div className="text-sm text-gray-600">Est. Calories</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Display (when workout is active) */}
      {isTimerActive && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-6xl font-bold mb-2">{formatTime(timeRemaining)}</div>
            <div className="text-xl mb-2">
              {isResting 
                ? 'Rest Time' 
                : isRestingBetweenSets 
                ? `Rest - Set ${currentSet}/${exercises[currentExerciseIndex]?.sets}`
                : `${exercises[currentExerciseIndex]?.name} - Set ${currentSet}/${exercises[currentExerciseIndex]?.sets}`
              }
            </div>
            <div className="text-sm opacity-80 mb-2">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
            <div className="text-sm opacity-80 mb-4">
              {getCurrentStatus()}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            <div className="flex gap-2 justify-center">
              {isPaused ? (
                <Button onClick={resumeWorkout} variant="secondary">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseWorkout} variant="secondary">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={resetWorkout} variant="secondary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exercises</h3>
          <Button onClick={() => setShowExerciseSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        {exercises.map((exercise, index) => (
          <Card 
            key={exercise.id} 
            className={`${currentExerciseIndex === index && isTimerActive ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{exercise.name}</h3>
                    {currentExerciseIndex === index && isTimerActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active - Set {currentSet}/{exercise.sets}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(index)}
                  className="text-red-500"
                  disabled={isTimerActive}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Sets</label>
                  <Input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                    className="h-8"
                    disabled={isTimerActive}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Reps</label>
                  <Input
                    type="number"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                    className="h-8"
                    disabled={isTimerActive}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Duration (s)</label>
                  <Input
                    type="number"
                    value={exercise.duration}
                    onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value) || 30)}
                    className="h-8"
                    disabled={isTimerActive}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Rest (s)</label>
                  <Input
                    type="number"
                    value={exercise.restBetweenSets}
                    onChange={(e) => updateExercise(index, 'restBetweenSets', parseInt(e.target.value) || 30)}
                    className="h-8"
                    disabled={isTimerActive}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-2 text-xs text-gray-600">
                <span>🔥 {Math.round(exercise.caloriesPerMinute * (exercise.duration * exercise.sets / 60))} cal</span>
                <span>⏱️ {formatTime(exercise.duration * exercise.sets + exercise.restBetweenSets * (exercise.sets - 1))}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {exercises.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No exercises added yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add exercises to build your workout</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rest Time Setting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rest between exercises (seconds):</label>
            <Input
              type="number"
              value={restTime}
              onChange={(e) => setRestTime(parseInt(e.target.value) || 30)}
              className="w-20 h-8"
              disabled={isTimerActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isTimerActive ? (
          <Button 
            onClick={startWorkout} 
            disabled={exercises.length === 0} 
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        ) : (
          <Button 
            onClick={resetWorkout} 
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Stop Workout
          </Button>
        )}
      </div>

      {/* Exercise Selector Dialog */}
      <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>
              Select an exercise to add to your workout routine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {availableExercises.map(exercise => (
              <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addExercise(exercise)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-sm text-gray-600">{exercise.caloriesPerMinute} cal/min</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutBuilder;
