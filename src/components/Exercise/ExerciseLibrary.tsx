import React, { useState } from 'react';
import { Exercise, ExerciseCategory } from '@/types/exercise';
import { predefinedExercises, exerciseCategories } from '@/data/exercises';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import ExerciseCard from './ExerciseCard';

interface ExerciseLibraryProps {
  onStartExercise: (exercise: Exercise) => void;
  onViewExerciseDetails: (exercise: Exercise) => void;
}

const ExerciseLibrary = ({ onStartExercise, onViewExerciseDetails }: ExerciseLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredExercises = predefinedExercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🏋️‍♀️</span>
            Exercise Library
          </CardTitle>
          <p className="text-indigo-100">
            Discover and start your fitness journey with our curated exercise collection
          </p>
        </CardHeader>
      </Card>

      {/* Category Filters */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exercise Type:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  All Exercises
                </Button>
                {exerciseCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id 
                        ? 'text-white' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined,
                      borderColor: category.color
                    }}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty Level:
              </span>
              <div className="flex flex-wrap gap-2">
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={selectedDifficulty === difficulty ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  >
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
        </p>
        {(selectedCategory !== 'all' || searchTerm || selectedDifficulty !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setSelectedDifficulty('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onStart={onStartExercise}
            onViewDetails={onViewExerciseDetails}
          />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No exercises found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseLibrary;
