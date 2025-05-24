import React from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, Target, PlayCircle, User, Dumbbell } from 'lucide-react';
import { exerciseCategories } from '@/data/exercises';

interface ExerciseDetailsProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onClose: () => void;
}

const ExerciseDetails = ({ exercise, onStart, onClose }: ExerciseDetailsProps) => {
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${category?.color}20, ${category?.color}10)` }}>
        <CardHeader>
          <div className="flex items-start justify-between">
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
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="secondary" 
                    className={getDifficultyColor(exercise.difficulty)}
                  >
                    {exercise.difficulty}
                  </Badge>
                  <Badge 
                    variant="outline"
                    style={{ borderColor: category?.color, color: category?.color }}
                  >
                    {category?.name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {exercise.duration}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">minutes</p>
          </CardContent>
        </Card>

        {exercise.caloriesPerMinute && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.caloriesPerMinute * exercise.duration!}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">calories</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {exercise.difficulty}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">level</p>
          </CardContent>
        </Card>

        {exercise.equipment && exercise.equipment.length > 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Dumbbell className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {exercise.equipment.length === 0 ? 'None' : exercise.equipment.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">equipment</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {exercise.description}
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Muscle Groups */}
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Target Muscles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroups.map((muscle) => (
                  <Badge 
                    key={muscle} 
                    variant="outline"
                    className="bg-white dark:bg-gray-700"
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Equipment Needed</CardTitle>
            </CardHeader>
            <CardContent>
              {exercise.equipment.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No equipment required</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.map((equipment) => (
                    <Badge 
                      key={equipment} 
                      variant="outline"
                      className="bg-white dark:bg-gray-700"
                    >
                      {equipment}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => onStart(exercise)}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          Start Exercise
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-6 py-3"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default ExerciseDetails;
