import { TrackingCategory } from "@/types/fitness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";

interface AchievementsProps {
  categories: TrackingCategory[];
}

export default function Achievements({ categories }: AchievementsProps) {
  return (
    <Card className="w-full bg-background border-border">
      <CardHeader>
        <CardTitle className="text-text flex items-center gap-2">
          <Medal className="h-5 w-5" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-text-secondary">
          <p className="mb-4">Achievement system coming soon!</p>
          <p>Complete your goals consistently to earn achievement badges.</p>
        </div>
      </CardContent>
    </Card>
  );
}
