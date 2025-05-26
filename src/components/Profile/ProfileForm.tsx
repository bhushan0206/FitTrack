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
import { User, Scale, Ruler, Target, CheckCircle } from "lucide-react";
import { updateUserProfile } from "@/lib/supabaseStorage";

interface ProfileFormProps {
  profile?: UserProfile | null;
  onSave?: (profileData: UserProfile) => void;
  onCancel?: () => void;
  standalone?: boolean;
}

const ProfileForm = ({ 
  profile = null, 
  onSave,
  onCancel,
  standalone = false
}: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    fitnessGoal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        weight: profile.weight?.toString() || "",
        height: profile.height?.toString() || "",
        fitnessGoal: profile.fitnessGoal || "",
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Name is required");
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

    if (standalone) {
      // Handle save internally
      setIsLoading(true);
      setError("");
      
      try {
        const result = await updateUserProfile(profileData);
        if (result) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          if (onSave) onSave(result);
        } else {
          setError("Failed to update profile. Please try again.");
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setError("An error occurred while updating your profile.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Pass to parent
      if (onSave) {
        onSave(profileData as UserProfile);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full bg-gradient-to-b from-background to-background-secondary dark:from-gray-800 dark:to-gray-900 border border-border dark:border-gray-600 rounded-lg shadow-lg">
        <CardHeader className="pb-6 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-primary to-secondary dark:from-gray-700 dark:to-gray-800 text-white rounded-t-lg">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <User className="h-6 w-6 md:h-7 md:w-7" />
            Profile Settings
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8 py-6 max-h-[70vh] overflow-y-auto">
            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Profile updated successfully!</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Name - Takes 2 columns on larger screens */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-sm md:text-base font-medium text-text dark:text-gray-300">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm md:text-base font-medium text-text dark:text-gray-300">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Age"
                    className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm md:text-base font-medium text-text dark:text-gray-300">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
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
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                Physical Measurements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm md:text-base font-medium text-text dark:text-gray-300 flex items-center gap-2">
                    <Scale className="w-4 h-4 md:w-5 md:h-5" />
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
                    placeholder="Weight in kg"
                    className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm md:text-base font-medium text-text dark:text-gray-300 flex items-center gap-2">
                    <Ruler className="w-4 h-4 md:w-5 md:h-5" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="Height in cm"
                    className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Goal */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg md:text-xl font-semibold text-primary dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                Fitness Goal
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="fitnessGoal" className="text-sm md:text-base font-medium text-text dark:text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4 md:w-5 md:h-5" />
                  Primary Fitness Goal
                </Label>
                <Select value={formData.fitnessGoal} onValueChange={(value) => handleInputChange('fitnessGoal', value)}>
                  <SelectTrigger className="w-full h-10 md:h-12 rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
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

          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 px-4 md:px-6 lg:px-8 py-4 md:py-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto min-w-[100px] h-10 md:h-12 rounded-lg border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="w-full sm:w-auto min-w-[120px] h-10 md:h-12 rounded-lg bg-primary dark:bg-blue-600 text-white hover:bg-primary/90 dark:hover:bg-blue-700 font-medium"
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileForm;