import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  onAuthSuccess?: () => void;
  initialTab?: "login" | "register";
}

const AuthForm = ({ onAuthSuccess, initialTab = "login" }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        // Handle login logic
      } else {
        // Handle registration logic
      }

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background border-border">
      <CardHeader>
        <CardTitle className="text-center text-text">Fitness Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/register"
          redirectUrl="/"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-background",
              headerTitle: "text-text",
              headerSubtitle: "text-text-secondary",
              socialButtonsBlockButton:
                "bg-background-secondary text-text border-border hover:bg-background-secondary/80",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
              formFieldInput: "bg-background-secondary text-text border-border",
              formFieldLabel: "text-text",
              footer: "text-text-secondary",
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default AuthForm;
