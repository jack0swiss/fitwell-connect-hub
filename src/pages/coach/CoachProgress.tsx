
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ClientSelectionSidebar from '@/components/coach/progress/ClientSelectionSidebar';
import WorkoutCompletionChart from '@/components/coach/progress/WorkoutCompletionChart';
import NutritionOverview from '@/components/coach/progress/NutritionOverview';
import BodyMetricsChart from '@/components/coach/progress/BodyMetricsChart';
import { Card, CardContent } from '@/components/ui/card';

const CoachProgress = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      return profiles.map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || `User ${profile.id.slice(0, 6)}`,
        email: profile.email || ''
      }));
    }
  });

  // Fetch workout logs for selected client
  const { data: workoutData, isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutData', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select('id, date, completed, workout:workouts(name)')
        .eq('client_id', selectedClient)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const processedData = data.reduce((acc: Record<string, any>, item) => {
        const date = new Date(item.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, completed: 0, total: 0 };
        }
        acc[date].total += 1;
        if (item.completed) {
          acc[date].completed += 1;
        }
        return acc;
      }, {});

      return Object.values(processedData);
    },
    enabled: !!selectedClient
  });

  // Fetch nutrition logs for selected client
  const { data: nutritionData, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutritionData', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return null;
      
      const { data: totals, error } = await supabase.rpc(
        'get_daily_nutrition_totals',
        {
          user_id: selectedClient,
          log_date: new Date().toISOString().split('T')[0]
        }
      );

      if (error) throw error;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      
      const { data: logs, error: logsError } = await supabase
        .from('nutrition_logs')
        .select('date, calories')
        .eq('client_id', selectedClient)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (logsError) throw logsError;

      const dailyCalories: Record<string, { date: string; calories: number }> = {};
      logs?.forEach(log => {
        const date = log.date;
        if (!dailyCalories[date]) {
          dailyCalories[date] = { date, calories: 0 };
        }
        dailyCalories[date].calories += log.calories;
      });

      return {
        totals: totals?.[0] || { 
          total_calories: 0, 
          total_protein: 0, 
          total_carbs: 0, 
          total_fat: 0,
          total_water_ml: 0
        },
        dailyCalories: Object.values(dailyCalories)
      };
    },
    enabled: !!selectedClient
  });

  // Fetch body metrics for selected client
  const { data: bodyMetrics, isLoading: bodyMetricsLoading } = useQuery({
    queryKey: ['bodyMetrics', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data, error } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('client_id', selectedClient)
        .order('date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return data.map(metric => ({
        date: new Date(metric.date).toLocaleDateString(),
        weight: metric.weight_kg,
        bodyFat: metric.body_fat_percent
      }));
    },
    enabled: !!selectedClient
  });

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Client Progress</h1>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Client Selection Sidebar */}
          <ClientSelectionSidebar
            clients={clients}
            selectedClient={selectedClient}
            searchQuery={searchQuery}
            isLoading={clientsLoading}
            onSearchChange={setSearchQuery}
            onClientSelect={setSelectedClient}
          />
          
          {/* Progress Data Area */}
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
