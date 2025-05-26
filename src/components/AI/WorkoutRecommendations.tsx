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
  Activity,
  RefreshCw,
  Flame
} from 'lucide-react';
import { workoutEngine } from "@/lib/ai/workoutEngine";
import { UserProfile, DailyLog, TrackingCategory } from "@/types/fitness";
import { WorkoutRecommendation } from "@/types/ai";

interface WorkoutRecommendationsProps {
  profile: UserProfile | null;
  categories: TrackingCategory[];
  logs: DailyLog[];
}

const WorkoutRecommendations: React.FC<WorkoutRecommendationsProps> = ({
  profile,
  categories,
  logs
}) => {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [profile, logs, categories]);

  const generateRecommendations = () => {
    console.log('WorkoutRecommendations: Starting generation...');
    setLoading(true);
    setRecommendations([]);
    
    setTimeout(() => {
      try {
        const context = { 
          userProfile: profile, 
          recentLogs: logs || [], 
          categories: categories || []
        };
        
        const recs = workoutEngine.generateRecommendations(context);
        console.log('WorkoutRecommendations: Generated recommendations:', recs);
        
        if (recs && recs.length > 0) {
          setRecommendations(recs);
        } else {
          // Set fallback recommendations
          setRecommendations([{
            id: 'fallback-1',
            type: 'exercise',
            title: 'Basic Bodyweight Exercise',
            description: 'Simple exercises you can do anywhere',
            confidence_score: 0.90,
            reasoning: 'These basic exercises are perfect for getting started with fitness.',
            priority: "medium",
            created_at: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error("Error generating workout recommendations:", error);
        setRecommendations([{
          id: 'error-fallback',
          type: 'exercise',
          title: 'Daily Movement',
          description: 'Start with basic daily movement',
          confidence_score: 0.90,
          reasoning: 'Any movement is better than no movement.',
          priority: "medium",
          created_at: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    }, 500);
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
    // onStartWorkout?.(workout);
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
      <Card className="h-full flex flex-col max-h-[600px]">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dumbbell className="w-5 h-5" />
            AI Workout Recommendations
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Personalized workout suggestions based on your goals and progress
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3 min-h-0 px-4 pb-4">
          {recommendations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No workout suggestions available</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Complete your profile to get personalized workout recommendations!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {recommendations.map((rec, idx) => (
                <Card key={rec.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1 text-xs">
                        <Dumbbell className="w-3 h-3" />
                        {rec.type === 'workout_plan' ? 'Workout Plan' : rec.type === 'exercise' ? 'Exercise' : 'Routine'}
                      </Badge>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {Math.round(rec.confidence_score * 100)}% Match
                      </Badge>
                    </div>

                    <h3 className="font-semibProperty 'type' does not exist on type 'WorkoutRecommendation'.ts(2339)old text-base mb-2">{rec.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{rec.description}</p>

                    {rec.workout_plan && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <div>
                            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                            <div className="text-sm font-bold">{rec.workout_plan.duration}</div>
                            <div className="text-xs text-gray-500">Minutes</div>
                          </div>
                          <div>
                            <Zap className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                            <div className="text-sm font-bold">{rec.workout_plan.estimated_calories} cal</div>
                            <div className="text-xs text-gray-500">Est. Burn</div>
                          </div>
                          <div className="text-center">
                            <Flame className="w-4 h-4 mx-auto mb-1 text-red-600" />
                            <div className="text-sm font-bold">{rec.workout_plan.estimated_calories}</div>
                            <div className="text-xs text-gray-500">Calories</div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Exercises ({rec.workout_plan.exercises.length}):
                          </div>
                          <div className="max-h-20 overflow-y-auto">
                            {rec.workout_plan.exercises.slice(0, 3).map((exercise, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 py-1">
                                • {exercise.name} - {exercise.sets}x{exercise.reps} {exercise.reps_unit}
                              </div>
                            ))}
                            {rec.workout_plan.exercises.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{rec.workout_plan.exercises.length - 3} more exercises
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <strong>Why this suggestion:</strong> {rec.reasoning}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex-shrink-0 pt-2">
            <Button
              variant="outline"
              onClick={generateRecommendations}
              disabled={loading}
              className="w-full flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Workout Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workout Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkout && getWorkoutTypeIcon(selectedWorkout.type)}
              {selectedWorkout?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={getDifficultyColor('beginner')}>
                  {'beginner'}
                </Badge>
                <Badge variant="outline">{selectedWorkout.type.toUpperCase()}</Badge>
                {selectedWorkout.workout_plan?.equipment_needed?.map((equipment) => (
                  <Badge key={equipment} variant="secondary">{equipment}</Badge>
                )) || []}
              </div>

              <p className="text-gray-600 dark:text-gray-300">
                {selectedWorkout.description}
              </p>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <div className="font-medium">{selectedWorkout.workout_plan?.duration || 30} minutes</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="font-medium">{selectedWorkout.workout_plan?.estimated_calories || 200} calories</div>
                  <div className="text-xs text-gray-500">Est. Burn</div>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="font-medium">{Math.round(selectedWorkout.confidence_score * 100)}%</div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exercises ({selectedWorkout.workout_plan?.exercises?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedWorkout.workout_plan?.exercises?.map((exercise, index) => (
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
                        {(exercise as any).rest_time && (
                          <span><strong>Rest:</strong> {(exercise as any).rest_time}s</span>
                        )}
                      </div>
                      {(exercise as any).modifications && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <strong>Modification:</strong> {(exercise as any).modifications}
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
