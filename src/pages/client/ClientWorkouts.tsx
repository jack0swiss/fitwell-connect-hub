
import React, { useState } from 'react';
import { Workout, WorkoutLog } from '@/types/workout';
import { WorkoutPlanView } from '@/components/client/WorkoutPlanView';
import { WorkoutView } from '@/components/client/WorkoutView';
import { WorkoutHistory } from '@/components/client/WorkoutHistory';
import { WorkoutLogDetail } from '@/components/client/WorkoutLogDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientLayout } from '@/components/layouts/ClientLayout';

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

  // Create a dynamic page title based on current view
  const getPageTitle = () => {
    if (selectedWorkout) return selectedWorkout.name;
    if (selectedLog) return 'Workout Log';
    return 'My Workouts';
  };

  return (
    <ClientLayout title={getPageTitle()}>
      <div className="p-4">
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
      </div>
      
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
    </ClientLayout>
  );
};

export default ClientWorkouts;
