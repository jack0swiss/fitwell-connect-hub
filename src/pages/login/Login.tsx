
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, UserCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'coach' | 'client'>('client');

  // In a real app, this would connect to Supabase Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login with:', { email, password, role });
    
    // Mock login - in real app, this would verify credentials with Supabase
    if (email && password) {
      // Navigate to appropriate dashboard based on role
      if (role === 'coach') {
        navigate('/coach');
      } else {
        navigate('/client');
      }
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
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
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
                />
              </div>
              
              <Button type="submit" className="w-full bg-fitwell-purple hover:bg-fitwell-purple/90">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Button variant="link" className="p-0 h-auto text-fitwell-purple">Register</Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
