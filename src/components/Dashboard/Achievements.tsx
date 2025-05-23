import { TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementsProps {
  categories: TrackingCategory[];
}

const Achievements = ({ categories }: AchievementsProps) => {
  const achievements = []; // This should be replaced with the actual logic to get achievements

  return (
    <Card className="bg-gradient-to-br from-white to-yellow-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
      <CardHeader className="px-6 py-6">
        <CardTitle className="text-gray-900 text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Achievements & Milestones
        </CardTitle>
        <p className="text-gray-600 text-sm font-medium">
          Track your progress and celebrate your wins!
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">No achievements yet</p>
            <p className="text-gray-500 text-sm">Keep tracking to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-400' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${achievement.unlocked ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-2 ${
                      achievement.unlocked ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      achievement.unlocked ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                      achievement.unlocked 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'bg-gray-200 text-gray-600'
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
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-xl border border-yellow-100/50 shadow-sm">
          <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Progress Statistics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Achievements Unlocked
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Categories Tracked
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600 font-medium">
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
