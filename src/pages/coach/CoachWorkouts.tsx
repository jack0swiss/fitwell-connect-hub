
import React, { useState } from 'react';
import { Dumbbell, Search } from 'lucide-react';
import TabBar from '@/components/TabBar';
import { WorkoutPlanList } from '@/components/coach/WorkoutPlanList';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExerciseLibrary } from '@/components/coach/ExerciseLibrary';
import { toast } from '@/components/ui/use-toast';
import { SettingsDropdown } from '@/components/SettingsDropdown';

const CoachWorkouts = () => {
  const [activeTab, setActiveTab] = useState('plans');
  
  const handleSelectExercise = () => {
    toast({
      title: "Exercise Selected",
      description: "Select 'Plans' tab to build workouts with this exercise.",
    });
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Workout Manager</h1>
        <SettingsDropdown />
      </header>
      
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
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachWorkouts;
