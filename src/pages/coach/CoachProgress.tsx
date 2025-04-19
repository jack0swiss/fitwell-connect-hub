
import React, { useState } from 'react';
import ClientSelectionSidebar from '@/components/coach/progress/ClientSelectionSidebar';
import WorkoutCompletionChart from '@/components/coach/progress/WorkoutCompletionChart';
import NutritionOverview from '@/components/coach/progress/NutritionOverview';
import BodyMetricsChart from '@/components/coach/progress/BodyMetricsChart';
import { Card, CardContent } from '@/components/ui/card';
import { useCoachClientsData } from '@/hooks/useCoachClientsData';
import { useClientWorkoutData } from '@/hooks/useClientWorkoutData';
import { useClientNutritionData } from '@/hooks/useClientNutritionData';
import { useClientBodyMetrics } from '@/hooks/useClientBodyMetrics';

const CoachProgress = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: clients, isLoading: clientsLoading } = useCoachClientsData();
  const { data: workoutData, isLoading: workoutLoading } = useClientWorkoutData(selectedClient);
  const { data: nutritionData, isLoading: nutritionLoading } = useClientNutritionData(selectedClient);
  const { data: bodyMetrics, isLoading: bodyMetricsLoading } = useClientBodyMetrics(selectedClient);

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Client Progress</h1>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ClientSelectionSidebar
            clients={clients}
            selectedClient={selectedClient}
            searchQuery={searchQuery}
            isLoading={clientsLoading}
            onSearchChange={setSearchQuery}
            onClientSelect={setSelectedClient}
          />
          
          <div className="md:col-span-3 space-y-4">
            {!selectedClient ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Select a client to view their progress data</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <WorkoutCompletionChart data={workoutData} isLoading={workoutLoading} />
                <NutritionOverview data={nutritionData} isLoading={nutritionLoading} />
                <BodyMetricsChart data={bodyMetrics} isLoading={bodyMetricsLoading} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachProgress;
