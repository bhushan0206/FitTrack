import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Monitor } from "lucide-react";
import { UserProfile } from "@/types/fitness";
import { updateTheme } from "@/lib/supabaseStorage";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/clerk-react";

interface ThemeSettingsProps {
  profile: UserProfile;
  onUpdate: () => void;
}

const ThemeSettings = ({ profile, onUpdate }: ThemeSettingsProps) => {
  const { userId } = useAuth(); // Get the userId from Clerk
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const theme = profile.theme || "light"; // Fallback to "light"
  const accentColor = profile.accentColor || "#3b82f6"; // Fallback to default color

  const handleThemeChange = async (
    theme: "light" | "dark" | "system",
    accentColor?: string,
  ) => {
    try {
      setIsUpdating(true);
      await updateTheme(userId!, theme, accentColor!); // Pass userId
      onUpdate();
      toast({
        title: "Success",
        description: `Theme settings updated`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update theme: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Theme</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => handleThemeChange("light", accentColor)}
            disabled={isUpdating}
          >
            <Sun size={16} />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => handleThemeChange("dark", accentColor)}
            disabled={isUpdating}
          >
            <Moon size={16} />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => handleThemeChange("system", accentColor)}
            disabled={isUpdating}
          >
            <Monitor size={16} />
            System
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Accent Color</h3>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={accentColor}
              onChange={(e) =>
                handleThemeChange(theme, e.target.value)
              }
              className="w-12 h-10 p-1"
              disabled={isUpdating}
            />
            <Input
              type="text"
              value={accentColor}
              onChange={(e) =>
                handleThemeChange(theme, e.target.value)
              }
              className="flex-1 dark:bg-gray-700"
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
