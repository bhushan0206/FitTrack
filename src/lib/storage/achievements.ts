import { supabaseAdmin } from '../supabaseAdmin';
import { Achievement, BadgeType, DailyLog } from "@/types/fitness";
import { generateId } from './utils';
import { subDays, isWithinInterval, parseISO } from 'date-fns';

export const getAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      // Remove sensitive achievement data
      console.error('Error fetching achievements');
    }
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      badgeType: item.badge_type as BadgeType,
      categoryId: item.category_id,
      earnedAt: item.earned_at,
      description: item.description
    }));
  } catch (error) {
    console.error('Error in getAchievements:', error);
    return [];
  }
};

export const createAchievement = async (
  userId: string,
  badgeType: BadgeType, 
  description: string,
  categoryId?: string
): Promise<Achievement | null> => {
  try {
    // Check if achievement already exists to prevent duplicates
    const { data: existing } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_type', badgeType)
      .eq('category_id', categoryId || '');
    
    if (existing && existing.length > 0) {
      return null; // Already has this achievement
    }
    
    const achievementId = generateId();
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('achievements')
      .insert({
        id: achievementId,
        user_id: userId,
        badge_type: badgeType,
        category_id: categoryId || null,
        earned_at: now,
        description,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      badgeType: data.badge_type as BadgeType,
      categoryId: data.category_id,
      earnedAt: data.earned_at,
      description: data.description
    };
  } catch (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
};

// Check logs for streaks and award achievements
export const checkAndAwardAchievements = async (
  userId: string, 
  logs: DailyLog[]
): Promise<Achievement[]> => {
  const newAchievements: Achievement[] = [];
  const today = new Date();
  
  try {
    // Get existing achievements to avoid duplicates
    const existingAchievements = await getAchievements(userId);
    
    // Group logs by category
    const categoriesWithLogs = logs.reduce((acc, log) => {
      if (!acc[log.categoryId]) {
        acc[log.categoryId] = [];
      }
      acc[log.categoryId].push(log);
      return acc;
    }, {} as Record<string, DailyLog[]>);
    
    // Check for streaks in each category
    for (const [categoryId, categoryLogs] of Object.entries(categoriesWithLogs)) {
      // Sort logs by date
      const sortedLogs = categoryLogs
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
      
      // Check for consecutive days
      const streaks = calculateStreaks(sortedLogs);
      
      // Award streak achievements
      if (streaks >= 30 && !existingAchievements.some(a => a.badgeType === 'streak_30' && a.categoryId === categoryId)) {
        const achievement = await createAchievement(
          userId,
          'streak_30',
          '30 consecutive days of meeting your goal!',
          categoryId
        );
        if (achievement) newAchievements.push(achievement);
      } 
      else if (streaks >= 7 && !existingAchievements.some(a => a.badgeType === 'streak_7' && a.categoryId === categoryId)) {
        const achievement = await createAchievement(
          userId,
          'streak_7',
          '7 consecutive days of meeting your goal!',
          categoryId
        );
        if (achievement) newAchievements.push(achievement);
      }
      else if (streaks >= 3 && !existingAchievements.some(a => a.badgeType === 'streak_3' && a.categoryId === categoryId)) {
        const achievement = await createAchievement(
          userId,
          'streak_3',
          '3 consecutive days of meeting your goal!',
          categoryId
        );
        if (achievement) newAchievements.push(achievement);
      }
      
      // Check for overachiever (exceeding goal by 150% for 7+ days)
      if (categoryLogs.filter(log => log.value / 100 >= 1.5).length >= 7 && 
          !existingAchievements.some(a => a.badgeType === 'overachiever' && a.categoryId === categoryId)) {
        const achievement = await createAchievement(
          userId,
          'overachiever',
          'Exceeded your goal by 50% or more for at least 7 days!',
          categoryId
        );
        if (achievement) newAchievements.push(achievement);
      }
    }
    
    // Check for perfect week (all categories met for 7 consecutive days)
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));
    
    // Check if there are consecutive days where all categories have logs
    const perfectWeek = Object.keys(categoriesWithLogs).every(categoryId => {
      return last7Days.every(day => {
        const formattedDate = day.toISOString().split('T')[0];
        return categoriesWithLogs[categoryId].some(log => 
          log.date === formattedDate && log.value >= 100); // Assuming 100% is the goal
      });
    });
    
    if (perfectWeek && !existingAchievements.some(a => a.badgeType === 'perfect_week')) {
      const achievement = await createAchievement(
        userId,
        'perfect_week',
        'Met all your goals every day for an entire week!',
      );
      if (achievement) newAchievements.push(achievement);
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Helper to calculate longest streak
function calculateStreaks(logs: DailyLog[]): number {
  if (!logs.length) return 0;
  
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < logs.length; i++) {
    const currentDate = parseISO(logs[i].date);
    const prevDate = parseISO(logs[i-1].date);
    
    // Check if dates are consecutive
    const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
}
