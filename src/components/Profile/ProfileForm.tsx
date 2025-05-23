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

    onSave(profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background border-border">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle className="text-text flex items-center gap-2 text-lg sm:text-xl" role="heading" aria-level={2}>
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-text flex items-center gap-2" role="heading" aria-level={3}>
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="name" className="text-text text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-text text-sm">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter your age"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-text text-sm">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="w-full">
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
            <h3 className="text-base sm:text-lg font-medium text-text flex items-center gap-2" role="heading" aria-level={3}>
              <Scale className="h-4 w-4" />
              Physical Measurements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-text text-sm flex items-center gap-2">
                  <Scale className="h-3 w-3" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Enter weight in kg"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-text text-sm flex items-center gap-2">
                  <Ruler className="h-3 w-3" />
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Enter height in cm"
                  className="w-full"
                />
              </div>
            </div>

            {/* BMI Display */}
            {formData.weight && formData.height && (
              <div className="p-3 sm:p-4 bg-background-secondary rounded-lg border border-border">
                <div className="text-sm text-text-secondary">Body Mass Index (BMI)</div>
                <div className="text-lg sm:text-xl font-medium text-text">
                  {((parseFloat(formData.weight) / Math.pow(parseInt(formData.height) / 100, 2))).toFixed(1)}
                </div>
              </div>
            )}
          </div>

          {/* Fitness Goal */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-text flex items-center gap-2" role="heading" aria-level={3}>
              <Target className="h-4 w-4" />
              Fitness Goal
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="fitnessGoal" className="text-text text-sm">
                Primary Fitness Goal
              </Label>
              <Select value={formData.fitnessGoal} onValueChange={(value) => handleInputChange('fitnessGoal', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your primary fitness goal" />
                </SelectTrigger>
                <SelectContent>
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

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 pt-6 px-4 sm:px-6">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileForm;
