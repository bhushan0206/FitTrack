import { UserProfile } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scale, Ruler, Target, Edit } from "lucide-react";
import { format } from "date-fns";

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

const ProfileView = ({ profile, onEdit }: ProfileViewProps) => {
  const getFitnessGoalDisplay = (goal?: string) => {
    switch (goal) {
      case 'lose_weight': return 'Lose Weight';
      case 'gain_weight': return 'Gain Weight';
      case 'build_muscle': return 'Build Muscle';
      case 'improve_endurance': return 'Improve Endurance';
      case 'maintain_health': return 'Maintain Health';
      case 'other': return 'Other';
      default: return 'Not set';
    }
  };

  const getGenderDisplay = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      case 'prefer_not_to_say': return 'Prefer not to say';
      default: return 'Not specified';
    }
  };

  const calculateBMI = () => {
    if (profile.weight && profile.height) {
      return (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-background border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-text flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-medium text-text">Basic Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-text-secondary">Name</span>
                  <p className="text-text font-medium">{profile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Age</span>
                  <p className="text-text">{profile.age ? `${profile.age} years` : 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Gender</span>
                  <p className="text-text">{getGenderDisplay(profile.gender)}</p>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="space-y-3">
              <h3 className="font-medium text-text flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Measurements
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-text-secondary">Weight</span>
                  <p className="text-text">{profile.weight ? `${profile.weight} kg` : 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Height</span>
                  <p className="text-text">{profile.height ? `${profile.height} cm` : 'Not set'}</p>
                </div>
                {calculateBMI() && (
                  <div>
                    <span className="text-sm text-text-secondary">BMI</span>
                    <p className="text-text font-medium">{calculateBMI()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fitness Goal */}
            <div className="space-y-3">
              <h3 className="font-medium text-text flex items-center gap-2">
                <Target className="h-4 w-4" />
                Fitness Goal
              </h3>
              <div>
                <span className="text-sm text-text-secondary">Primary Goal</span>
                <p className="text-text">{getFitnessGoalDisplay(profile.fitnessGoal)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-text">{profile.categories.length}</div>
            <p className="text-text-secondary">Categories</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-text">{profile.logs.length}</div>
            <p className="text-text-secondary">Total Logs</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-text">
              {profile.createdAt ? Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <p className="text-text-secondary">Days Active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;
