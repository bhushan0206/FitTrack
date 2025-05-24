import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { Friend } from '@/types/social';
import { ExerciseLog } from '@/types/exercise';
import { DailyLog, TrackingCategory } from '@/types/fitness';
import { socialStorage } from '@/lib/socialStorage';
import { useFitnessData } from '@/hooks/useFitnessData';
import { exerciseStorage } from '@/lib/exerciseStorage';
import { format } from 'date-fns';

const SharePanel = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [shareType, setShareType] = useState<'workout' | 'progress'>('workout');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Get real data from the fitness app
  const { logs, categories } = useFitnessData();
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  useEffect(() => {
    loadFriends();
    loadTodayExercises();
  }, []);

  const loadFriends = async () => {
    const friendsList = await socialStorage.getFriends();
    setFriends(friendsList);
  };

  const loadTodayExercises = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayExercises = await exerciseStorage.getExerciseLogs(today);
      setExerciseLogs(todayExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedFriend) return;

    setLoading(true);
    setSuccess(false);
    setError('');
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      let result;
      if (shareType === 'workout') {
        result = await socialStorage.shareWorkout(selectedFriend, exerciseLogs, today, notes);
      } else {
        const todayLogs = logs.filter(log => log.date === today);
        result = await socialStorage.shareProgress(selectedFriend, todayLogs, categories, today);
      }
      
      if (result.success) {
        setSuccess(true);
        setNotes('');
        setSelectedFriend('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to share. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setError('Network error. Please check your connection and try again.');
    }
    
    setLoading(false);
  };

  // Get today's stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(log => log.date === today);
  const completedCategories = categories.filter(category => {
    const categoryLogs = todayLogs.filter(log => log.categoryId === category.id);
    const value = categoryLogs.reduce((sum, log) => sum + log.value, 0);
    return value >= category.dailyTarget;
  }).length;

  const totalWorkoutMinutes = exerciseLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalCalories = exerciseLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Select Friend
            </label>
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a friend to share with" />
              </SelectTrigger>
              <SelectContent>
                {friends.map((friend) => (
                  <SelectItem key={friend.id} value={friend.friend_id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {friend.friend_profile?.name?.charAt(0) || '?'}
                      </div>
                      {friend.friend_profile?.name || 'Unknown'}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Share Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={shareType === 'workout' ? 'default' : 'outline'}
                onClick={() => setShareType('workout')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Today's Workout</div>
                  <div className="text-xs text-gray-500">
                    {exerciseLogs.length} exercises, {totalWorkoutMinutes}min
                  </div>
                </div>
              </Button>
              <Button
                variant={shareType === 'progress' ? 'default' : 'outline'}
                onClick={() => setShareType('progress')}
                className="flex items-center gap-2 h-auto p-4"
              >
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Progress Update</div>
                  <div className="text-xs text-gray-500">
                    {completedCategories}/{categories.length} goals completed
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
            {shareType === 'workout' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Workout - {format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-600">{totalWorkoutMinutes}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{totalCalories}</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {exerciseLogs.length} exercises completed
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Progress - {format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{completedCategories}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-600">
                      {categories.length > 0 ? Math.round((completedCategories / categories.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-600">Overall</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Add a message (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Successfully shared your {shareType}!</span>
            </div>
          )}

          <Button 
            onClick={handleShare}
            disabled={!selectedFriend || loading || (shareType === 'workout' && exerciseLogs.length === 0)}
            className="w-full"
          >
            {loading ? 'Sharing...' : `Share ${shareType === 'workout' ? 'Workout' : 'Progress'}`}
          </Button>
        </CardContent>
      </Card>

      {friends.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Share className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No friends to share with</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add friends first to share your progress!</p>
          </CardContent>
        </Card>
      )}

      {shareType === 'workout' && exerciseLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No workouts logged today</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete some exercises to share your workout!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharePanel;
