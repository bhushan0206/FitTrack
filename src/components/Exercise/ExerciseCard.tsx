import React from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Target, PlayCircle } from 'lucide-react';
import { exerciseCategories } from '@/data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onViewDetails: (exercise: Exercise) => void;
}

const ExerciseCard = ({ exercise, onStart, onViewDetails }: ExerciseCardProps) => {
  const category = exerciseCategories.find(cat => cat.id === exercise.category);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${category?.color}20` }}
            >
              {category?.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {exercise.name}
              </CardTitle>
              <Badge 
                variant="secondary" 
                className={`mt-1 ${getDifficultyColor(exercise.difficulty)}`}
              >
                {exercise.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {exercise.description}
        </p>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              {exercise.duration}min
            </p>
          </div>
          
          {exercise.caloriesPerMinute && (
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {exercise.caloriesPerMinute * exercise.duration!} cal
              </p>
            </div>
          )}
          
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Target className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-xs font-medium text-gray-900 dark:text-white capitalize">
              {exercise.category}
            </p>
          </div>
        </div>
        
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Target Muscles:
            </p>
            <div className="flex flex-wrap gap-1">
              {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                <Badge 
                  key={muscle} 
                  variant="outline" 
                  className="text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                >
                  {muscle}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                >
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onStart(exercise)}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button
            variant="outline"
            onClick={() => onViewDetails(exercise)}
            className="flex-1"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
