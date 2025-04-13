
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, UserCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'coach' | 'client'>('client');
  const [isLoading, setIsLoading] = useState(false);

  // Connect to Supabase for authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Successfully authenticated
      toast({
        title: "Logged in",
        description: "You have been successfully logged in.",
      });
      
      // Navigate to appropriate dashboard based on role
      if (role === 'coach') {
        navigate('/coach');
      } else {
        navigate('/client');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If the error indicates the user doesn't exist, offer to sign up
      if (error.message?.includes('email not confirmed') || 
          error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Login failed",
          description: "Would you like to register?",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              onClick={() => handleSignUp()}
              className="bg-white text-black hover:bg-gray-100"
            >
              Register
            </Button>
          ),
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up new users with Supabase
  const handleSignUp = async () => {
    setIsLoading(true);
    
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role, // Store the role in the user metadata
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email for the confirmation link.",
      });
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-fitwell-dark">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">FitWell Connect</h1>
          <p className="text-muted-foreground">Your personalized fitness coaching platform</p>
        </div>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Tabs defaultValue="client" onValueChange={(value) => setRole(value as 'coach' | 'client')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="client" className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    <span>Client</span>
                  </TabsTrigger>
                  <TabsTrigger value="coach" className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>Coach</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-fitwell-purple hover:bg-fitwell-purple/90"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Button variant="link" className="p-0 h-auto text-fitwell-purple" onClick={handleSignUp}>Register</Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
