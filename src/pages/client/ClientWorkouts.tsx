
import React from 'react';
import TabBar from '@/components/TabBar';

const ClientWorkouts = () => {
  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <h1 className="text-xl font-bold">My Workouts</h1>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h2 className="text-xl font-medium text-fitwell-purple mb-2">Your Workout Schedule</h2>
          <p className="text-muted-foreground">View and track your assigned workouts here.</p>
        </div>
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientWorkouts;
