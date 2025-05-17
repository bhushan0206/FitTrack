import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
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
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        await signIn(email, password);
        toast({
          title: "Success",
          description: "You have been logged in successfully",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "Success",
          description: "Account created! Check your email for confirmation.",
        });
      }

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-center">Fitness Tracker</CardTitle>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <CardContent className="pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : activeTab === "login"
                  ? "Login"
                  : "Register"}
            </Button>
          </form>
        </CardContent>
      </Tabs>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {activeTab === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
        <Button
          variant="link"
          onClick={() =>
            setActiveTab(activeTab === "login" ? "register" : "login")
          }
          className="px-2"
        >
          {activeTab === "login" ? "Register" : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
