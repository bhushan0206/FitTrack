import { useState, useEffect } from "react";
import { UserProfile } from "@/types/fitness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Scale, Ruler, Target } from "lucide-react";

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (profileData: Partial<UserProfile>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ProfileForm = ({ profile, onSave, onCancel, isLoading }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    age: profile.age?.toString() || "",
    gender: profile.gender || "",
    weight: profile.weight?.toString() || "",
    height: profile.height?.toString() || "",
    fitnessGoal: profile.fitnessGoal || "",
  });

  // Update form when profile changes
  useEffect(() => {
    setFormData({
      name: profile.name || "",
      age: profile.age?.toString() || "",
      gender: profile.gender || "",
      weight: profile.weight?.toString() || "",
      height: profile.height?.toString() || "",
      fitnessGoal: profile.fitnessGoal || "",
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      return;
    }
    
    const profileData: Partial<UserProfile> = {
      name: formData.name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender as UserProfile['gender'] || undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      fitnessGoal: formData.fitnessGoal as UserProfile['fitnessGoal'] || undefined,
    };

    console.log('Submitting profile data:', profileData); // Debug log
    onSave(profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-background to-background-secondary dark:from-gray-800 dark:to-gray-900 border border-border dark:border-gray-600 rounded-lg shadow-lg">
      <CardHeader className="pb-4 px-6 bg-gradient-to-r from-primary to-secondary dark:from-gray-700 dark:to-gray-800 text-white rounded-t-lg">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-primary dark:text-blue-400">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="name" className="text-sm font-medium text-text dark:text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-text">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Enter your age"
                  className="w-full rounded-lg"
                />
              </div>
              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-text">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="w-full rounded-lg">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-primary">
              Physical Measurements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium text-text">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  className="w-full rounded-lg"
                />
              </div>
              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium text-text">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="Enter height in cm"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-primary dark:text-blue-400">
              Fitness Goal
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal" className="text-sm font-medium text-text dark:text-gray-300">
                Primary Fitness Goal
              </Label>
              <Select value={formData.fitnessGoal} onValueChange={(value) => handleInputChange('fitnessGoal', value)}>
                <SelectTrigger className="w-full rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select your primary fitness goal" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_weight">Gain Weight</SelectItem>
                  <SelectItem value="build_muscle">Build Muscle</SelectItem>
                  <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                  <SelectItem value="maintain_health">Maintain Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 px-6 py-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto rounded-lg border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto rounded-lg bg-primary dark:bg-blue-600 text-white hover:bg-primary/90 dark:hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileForm;
