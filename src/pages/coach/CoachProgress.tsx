import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CoachProgress = () => {
  const workoutData = useQuery({
    queryKey: ['workoutData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('date')
        .range(0, 6);

      if (error) {
        console.error('Error fetching workout data:', error);
        return [];
      }

      // Process data to count workouts per day
      const workoutCounts = data.reduce((acc: { [key: string]: number }, item) => {
        const date = item.date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Convert counts to array of { date, count }
      const workoutData = Object.entries(workoutCounts).map(([date, count]) => ({
        date,
        count,
      }));

      return workoutData;
    }
  });

  // Add null check for workoutData.data
  const chartData = workoutData.data?.map((entry) => ({
    name: entry.date,
    value: entry.count
  })) || [];

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Progress</h1>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <div className="bg-card p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Weekly Workout Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default CoachProgress;
