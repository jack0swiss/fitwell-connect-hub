
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutData {
  date: string;
  completed: number;
  total: number;
}

export const useClientWorkoutData = (clientId: string | null) => {
  return useQuery({
    queryKey: ['workoutData', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('workout_logs')
        .select('id, date, completed, workout:workouts(name)')
        .eq('client_id', clientId)
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

      return Object.values(processedData) as WorkoutData[];
    },
    enabled: !!clientId
  });
};
