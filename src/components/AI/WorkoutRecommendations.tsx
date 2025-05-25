import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, 
  Clock, 
  Zap, 
  Target, 
  Star,
  Play,
  ChevronRight,
  Award,
  Activity
} from 'lucide-react';
import { WorkoutRecommendation } from '@/types/ai';
import { workoutRecommendationEngine } from '@/lib/ai/workoutRecommendations';
import { UserProfile, DailyLog, TrackingCategory } from '@/types/fitness';

interface WorkoutRecommendationsProps {
  userProfile?: UserProfile;
  recentLogs?: DailyLog[];
  categories?: TrackingCategory[];
  onStartWorkout?: (workout: WorkoutRecommendation) => void;
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  userProfile,
  recentLogs,
  categories,
  onStartWorkout
}) => {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile, recentLogs, categories]);

  const generateRecommendations = () => {
    setLoading(true);
    try {
      const context = {
        userProfile,
        recentLogs,
        categories
      };

      const newRecommendations = workoutRecommendationEngine.generateRecommendations(context);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating workout recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Activity className="w-4 h-4" />;
      case 'hiit': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (workout: WorkoutRecommendation) => {
    setSelectedWorkout(workout);
    setShowDetails(true);
  };

  const handleStartWorkout = (workout: WorkoutRecommendation) => {
    setShowDetails(false);
    onStartWorkout?.(workout);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Generating Workout Recommendations...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            AI Workout Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Personalized workouts based on your goals and activity history
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No recommendations available</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Complete your profile and log some activities to get personalized recommendations!
              </p>
            </div>
          ) : (
            recommendations.map((workout, index) => (
              <Card key={workout.id} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getWorkoutTypeIcon(workout.workout_type)}
                        {workout.workout_type.toUpperCase()}
                      </Badge>
                      <Badge className={getDifficultyColor(workout.difficulty)}>
                        {workout.difficulty}
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          Top Pick
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {Math.round(workout.confidence_score * 100)}% Match
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{workout.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {workout.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">{workout.duration} min</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                      <div className="text-sm font-medium">{workout.calories_estimate} cal</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">{workout.exercises.length} exercises</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Why this workout:</div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{workout.reasoning}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(workout)}
                      className="flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartWorkout(workout)}
                      className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      <Play className="w-3 h-3" />
                      Start Workout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Button
            variant="outline"
            onClick={generateRecommendations}
            className="w-full"
          >
            Refresh Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Workout Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkout && getWorkoutTypeIcon(selectedWorkout.workout_type)}
              {selectedWorkout?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                  {selectedWorkout.difficulty}
                </Badge>
                <Badge variant="outline">{selectedWorkout.workout_type.toUpperCase()}</Badge>
                {selectedWorkout.equipment_needed.map((equipment) => (
                  <Badge key={equipment} variant="secondary">{equipment}</Badge>
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300">
                {selectedWorkout.description}
              </p>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium">{selectedWorkout.duration} minutes</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="font-medium">{selectedWorkout.calories_estimate} calories</div>
                  <div className="text-xs text-gray-500">Est. Burn</div>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">{Math.round(selectedWorkout.confidence_score * 100)}%</div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exercises ({selectedWorkout.exercises.length})</h4>
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">{exercise.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {exercise.instructions}
                      </div>
                      <div className="flex gap-4 text-xs">
                        {exercise.sets && (
                          <span><strong>Sets:</strong> {exercise.sets}</span>
                        )}
                        {exercise.reps && (
                          <span><strong>Reps:</strong> {exercise.reps}</span>
                        )}
                        {exercise.duration && (
                          <span><strong>Duration:</strong> {exercise.duration}s</span>
                        )}
                        {exercise.rest_time && (
                          <span><strong>Rest:</strong> {exercise.rest_time}s</span>
                        )}
                      </div>
                      {exercise.modifications && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <strong>Modification:</strong> {exercise.modifications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleStartWorkout(selectedWorkout)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start This Workout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkoutRecommendations;
