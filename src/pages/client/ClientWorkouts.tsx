
import React, { useState } from 'react';
import TabBar from '@/components/TabBar';
import { Workout, WorkoutLog } from '@/types/workout';
import { WorkoutPlanView } from '@/components/client/WorkoutPlanView';
import { WorkoutView } from '@/components/client/WorkoutView';
import { WorkoutHistory } from '@/components/client/WorkoutHistory';
import { WorkoutLogDetail } from '@/components/client/WorkoutLogDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientWorkouts = () => {
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

  const handleSelectWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
  };

  const handleBackToWorkouts = () => {
    setSelectedWorkout(null);
  };

  const handleViewWorkoutLog = (log: WorkoutLog) => {
    setSelectedLog(log);
  };

  const handleBackToHistory = () => {
    setSelectedLog(null);
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <h1 className="text-xl font-bold mb-4">My Workouts</h1>
        
        {!selectedWorkout && !selectedLog && (
          <Tabs 
            defaultValue="plan" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plan">Current Plan</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        {selectedWorkout ? (
          <WorkoutView 
            workout={selectedWorkout} 
            onBack={handleBackToWorkouts} 
          />
        ) : selectedLog ? (
          <WorkoutLogDetail 
            workoutLog={selectedLog} 
            onBack={handleBackToHistory} 
          />
        ) : (
          <Tabs 
            defaultValue="plan" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="plan" className="mt-0">
              <WorkoutPlanView onSelectWorkout={handleSelectWorkout} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <WorkoutHistory onViewWorkoutLog={handleViewWorkoutLog} />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientWorkouts;
