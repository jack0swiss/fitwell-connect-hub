
import React, { useState, useEffect } from 'react';
import { Dumbbell, Search } from 'lucide-react';
import { WorkoutPlanList } from '@/components/coach/WorkoutPlanList';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExerciseLibrary } from '@/components/coach/ExerciseLibrary';
import { toast } from '@/components/ui/use-toast';
import { CoachLayout } from '@/components/layouts/CoachLayout';
import { supabase } from '@/integrations/supabase/client';

const CoachWorkouts = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated and has the coach role
    const checkAuth = async () => {
      try {
        console.log("Checking authentication in CoachWorkouts");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found in CoachWorkouts");
          toast({
            title: 'Authentication Required',
            description: 'Please log in to access this page',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        console.log("User data in CoachWorkouts:", user);
        
        // Also log any profiles data to help debug
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          console.log('Available profiles:', profiles);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error in CoachWorkouts:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSelectExercise = () => {
    toast({
      title: "Exercise Selected",
      description: "Select 'Plans' tab to build workouts with this exercise.",
    });
  };

  if (isLoading) {
    return (
      <CoachLayout title="Workout Manager">
        <div className="flex justify-center items-center h-full py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout title="Workout Manager">
      <div className="p-4">
        <Tabs 
          defaultValue="plans" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          </TabsList>
          
          {activeTab === "exercises" && (
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search exercises..." className="pl-8" />
            </div>
          )}
        </Tabs>
      </div>
      
      <main className="p-4 max-w-2xl mx-auto">
        <Tabs 
          defaultValue="plans" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsContent value="plans" className="mt-0">
            <WorkoutPlanList />
          </TabsContent>
          
          <TabsContent value="exercises" className="mt-0">
            <ExerciseLibrary onSelectExercise={handleSelectExercise} />
          </TabsContent>
        </Tabs>
      </main>
    </CoachLayout>
  );
};

export default CoachWorkouts;
