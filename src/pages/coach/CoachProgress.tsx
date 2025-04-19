
import React, { useState } from 'react';
import { CoachLayout } from '@/components/layouts/CoachLayout';
import ClientSelectionSidebar from '@/components/coach/progress/ClientSelectionSidebar';
import WorkoutCompletionChart from '@/components/coach/progress/WorkoutCompletionChart';
import NutritionOverview from '@/components/coach/progress/NutritionOverview';
import BodyMetricsChart from '@/components/coach/progress/BodyMetricsChart';
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
    <CoachLayout title="Client Progress">
      <div className="p-4 max-w-6xl mx-auto">
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
            {selectedClient ? (
              <>
                <WorkoutCompletionChart data={workoutData} isLoading={workoutLoading} />
                <NutritionOverview data={nutritionData} isLoading={nutritionLoading} />
                <BodyMetricsChart data={bodyMetrics} isLoading={bodyMetricsLoading} />
              </>
            ) : (
              <div className="text-center p-8 text-muted-foreground bg-card rounded-lg">
                Select a client to view their progress data
              </div>
            )}
          </div>
        </div>
      </div>
    </CoachLayout>
  );
};

export default CoachProgress;
