import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseLog } from '@/types/exercise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Flame, Target, CheckCircle } from 'lucide-react';
import { exerciseCategories } from '@/data/exercises';
import { exerciseStorage } from '@/lib/exerciseStorage';
import { generateId } from '@/lib/supabaseStorage';

interface ExerciseTrackerProps {
  exercise: Exercise;
  onComplete: (exerciseLog: ExerciseLog) => void;
  onCancel: () => void;
  selectedDate: string;
}

const ExerciseTracker = ({ exercise, onComplete, onCancel, selectedDate }: ExerciseTrackerProps) => {
  const [duration, setDuration] = useState(exercise.duration?.toString() || '');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [intensity, setIntensity] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [notes, setNotes] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const category = exerciseCategories.find(cat => cat.id === exercise.category);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!isActive && timeRemaining !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const startTimer = () => {
    const durationInSeconds = parseInt(duration) * 60;
    setTimeRemaining(durationInSeconds);
    setIsActive(true);
    setIsStarted(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(parseInt(duration) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateCalories = () => {
    const durationMinutes = parseInt(duration) || 0;
    const baseCalories = (exercise.caloriesPerMinute || 5) * durationMinutes;
    
    const intensityMultiplier = {
      'Low': 0.8,
      'Moderate': 1.0,
      'High': 1.2
    };
    
    return Math.round(baseCalories * intensityMultiplier[intensity]);
  };

  const handleComplete = async () => {
    const exerciseLog: ExerciseLog = {
      id: generateId(),
      exerciseId: exercise.id, // Use exercise.id instead of exercise.name
      date: selectedDate,
      duration: parseInt(duration) || 0,
      sets: sets ? parseInt(sets) : undefined,
      reps: reps ? parseInt(reps) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
      calories: calculateCalories(),
      notes: notes || undefined,
      intensity,
    };

    console.log('Creating exercise log with exercise ID:', exercise.id);

    // Save to database
    const savedLog = await exerciseStorage.createExerciseLog(exerciseLog);
    if (savedLog) {
      onComplete(savedLog);
    } else {
      console.error('Failed to save exercise log');
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <Card 
        className="border-0 shadow-lg" 
        style={{ background: `linear-gradient(135deg, ${category?.color}20, ${category?.color}10)` }}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${category?.color}30` }}
            >
              {category?.icon}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.name}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {exercise.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timer Section */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-gray-900 dark:text-white">
              {formatTime(timeRemaining)}
            </div>
            <div className="flex justify-center gap-3">
              {!isStarted ? (
                <Button
                  onClick={startTimer}
                  disabled={!duration}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
                >
                  Start Exercise
                </Button>
              ) : (
                <>
                  <Button
                    onClick={isActive ? pauseTimer : () => setIsActive(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6"
                  >
                    {isActive ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    className="px-6"
                  >
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Tracking Form */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Exercise Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity</Label>
              <Select value={intensity} onValueChange={(value: any) => setIntensity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exercise.category === 'strength' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder="3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </>
            )}

            {exercise.category === 'cardio' && (
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5.0"
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the exercise feel? Any observations..."
                rows={3}
              />
            </div>
          </div>

          {/* Calculated Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {duration || 0} min
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {calculateCalories()} cal
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {intensity}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleComplete}
          disabled={!duration}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Exercise
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-3"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ExerciseTracker;
