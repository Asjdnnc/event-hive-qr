
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { migrateDataToSupabase } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Try to sign in directly with email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error("Authentication error:", authError);
        setErrorMessage("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Get user data from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError || !userData) {
          console.error("User data fetch error:", userError);
          
          // Try to create a user profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username: email.split('@')[0],
              role: 'admin',
              password: password // Note: In production, you wouldn't store plaintext passwords
            });
            
          if (insertError) {
            setErrorMessage("Failed to create user profile. Please contact an administrator.");
            setLoading(false);
            return;
          }
          
          // Fetch the newly created user
          const { data: newUserData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          if (newUserData) {
            localStorage.setItem("currentUser", JSON.stringify({
              ...newUserData,
              role: newUserData.role as "admin" | "volunteer"
            }));
            
            toast({
              title: "Login Successful",
              description: `Welcome, ${newUserData.username}!`,
            });
            
            navigate("/dashboard");
          }
        } else {
          // Store current user in localStorage for app-wide access with proper type casting
          localStorage.setItem("currentUser", JSON.stringify({
            ...userData,
            role: userData.role as "admin" | "volunteer"
          }));
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.username}!`,
          });
          
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateData = async () => {
    setIsMigrating(true);
    try {
      const success = await migrateDataToSupabase();
      if (success) {
        toast({
          title: "Migration Successful",
          description: "Data has been migrated to the database. You can now log in with your credentials.",
        });
      } else {
        toast({
          title: "Migration Failed",
          description: "An error occurred during data migration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description: "An error occurred during data migration.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Hackzilla</h1>
          <p className="text-muted-foreground mt-1">
            Event registration and management system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleMigrateData}
                disabled={isMigrating}
              >
                {isMigrating ? "Migrating Data..." : "Migrate Local Data to Database"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>First time using the system with Supabase?</p>
          <p>Click the "Migrate Local Data to Database" button above to transfer your existing data.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
