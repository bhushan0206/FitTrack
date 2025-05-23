import { TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementsProps {
  categories: TrackingCategory[];
}

const Achievements = ({ categories }: AchievementsProps) => {
  // Sample achievements logic
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Create your first category",
      icon: "🎯",
      unlocked: categories.length > 0,
    },
    {
      id: 2,
      title: "Category Master",
      description: "Create 5 different categories",
      icon: "🏆",
      unlocked: categories.length >= 5,
    },
    {
      id: 3,
      title: "Consistent Tracker",
      description: "Log entries for 7 consecutive days",
      icon: "📈",
      unlocked: false, // This would need actual log data
    },
    {
      id: 4,
      title: "Goal Crusher",
      description: "Achieve 100% completion on any category",
      icon: "🎉",
      unlocked: false, // This would need actual log data
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-800 dark:to-yellow-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="px-6 py-6">
        <CardTitle className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Achievements & Milestones
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
          Track your progress and celebrate your wins!
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-800/30 dark:to-orange-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">No achievements yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Keep tracking to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-5 rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-l-4 border-yellow-400' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-l-4 border-gray-300 dark:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${achievement.unlocked ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-2 ${
                      achievement.unlocked ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      achievement.unlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                      achievement.unlocked 
                        ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {achievement.unlocked ? '🎉 Unlocked!' : '🔒 Locked'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-100/50 dark:border-yellow-800/50 shadow-sm">
          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Progress Statistics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 dark:bg-gray-700/60 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Achievements Unlocked
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-gray-700/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Categories Tracked
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-gray-700/60 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Completion Rate
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;
