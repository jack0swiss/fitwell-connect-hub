
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientMetrics {
  workoutCompletionRate: number;
  workoutsCompleted: number;
  workoutsTotal: number;
  calorieAdherence: number;
  caloriesConsumed: number;
  caloriesTarget: number;
  goalsAchieved: number;
  goalsTotal: number;
}

export const useClientDashboardMetrics = (clientId: string) => {
  return useQuery({
    queryKey: ['clientMetrics', clientId],
    queryFn: async (): Promise<ClientMetrics> => {
      try {
        // Get workout adherence 
        const { data: workoutData } = await supabase.rpc('get_workout_adherence', {
          user_id: clientId,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end_date: new Date()
        });
        
        // Get nutrition adherence
        const { data: nutritionData } = await supabase.rpc('get_nutrition_adherence', {
          user_id: clientId,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end_date: new Date()
        });
        
        // Get goals
        const { data: goals, error: goalsError } = await supabase
          .from('fitness_goals')
          .select('*')
          .eq('client_id', clientId);
          
        if (goalsError) throw goalsError;
        
        const goalsTotal = goals ? goals.length : 0;
        const goalsAchieved = goals ? goals.filter(goal => goal.is_achieved).length : 0;
        
        return {
          workoutCompletionRate: workoutData?.[0]?.adherence_percentage || 0,
          workoutsCompleted: workoutData?.[0]?.completed_workouts || 0,
          workoutsTotal: workoutData?.[0]?.planned_workouts || 0,
          calorieAdherence: nutritionData?.[0]?.calorie_adherence_percentage || 0,
          caloriesConsumed: Math.round(nutritionData?.[0]?.avg_daily_calories || 0),
          caloriesTarget: nutritionData?.[0]?.target_calories || 0,
          goalsAchieved,
          goalsTotal
        };
      } catch (error) {
        console.error('Error fetching client metrics:', error);
        return {
          workoutCompletionRate: 0,
          workoutsCompleted: 0,
          workoutsTotal: 0,
          calorieAdherence: 0,
          caloriesConsumed: 0,
          caloriesTarget: 0,
          goalsAchieved: 0,
          goalsTotal: 0
        };
      }
    },
    enabled: !!clientId,
  });
};
