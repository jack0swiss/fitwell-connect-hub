
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

// Define types for the database function responses
interface WorkoutAdherenceData {
  adherence_percentage: number;
  completed_workouts: number;
  planned_workouts: number;
}

interface NutritionAdherenceData {
  avg_daily_calories: number;
  target_calories: number;
  calorie_adherence_percentage: number;
}

export const useClientDashboardMetrics = (clientId: string) => {
  return useQuery({
    queryKey: ['clientMetrics', clientId],
    queryFn: async (): Promise<ClientMetrics> => {
      try {
        // Get workout adherence - convert Date objects to ISO strings
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const endDate = new Date();
        
        const { data: workoutData, error: workoutError } = await supabase.rpc('get_workout_adherence', {
          user_id: clientId,
          start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          end_date: endDate.toISOString().split('T')[0]
        });
        
        if (workoutError) throw workoutError;
        
        // Get nutrition adherence
        const { data: nutritionData, error: nutritionError } = await supabase.rpc('get_nutrition_adherence', {
          user_id: clientId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });
        
        if (nutritionError) throw nutritionError;
        
        // Get goals
        const { data: goals, error: goalsError } = await supabase
          .from('fitness_goals')
          .select('*')
          .eq('client_id', clientId);
          
        if (goalsError) throw goalsError;
        
        const goalsTotal = goals ? goals.length : 0;
        const goalsAchieved = goals ? goals.filter(goal => goal.is_achieved).length : 0;
        
        // Type assertion to help TypeScript understand the structure
        const typedWorkoutData = workoutData as WorkoutAdherenceData[];
        const typedNutritionData = nutritionData as NutritionAdherenceData[];
        
        // Use a safer approach to handle potentially null or undefined data
        const adherencePercentage = typedWorkoutData && typedWorkoutData[0] ? typedWorkoutData[0].adherence_percentage ?? 0 : 0;
        const completedWorkouts = typedWorkoutData && typedWorkoutData[0] ? typedWorkoutData[0].completed_workouts ?? 0 : 0;
        const plannedWorkouts = typedWorkoutData && typedWorkoutData[0] ? typedWorkoutData[0].planned_workouts ?? 0 : 0;
        
        return {
          workoutCompletionRate: adherencePercentage,
          workoutsCompleted: completedWorkouts,
          workoutsTotal: plannedWorkouts,
          calorieAdherence: typedNutritionData?.[0]?.calorie_adherence_percentage ?? 0,
          caloriesConsumed: Math.round(typedNutritionData?.[0]?.avg_daily_calories ?? 0),
          caloriesTarget: typedNutritionData?.[0]?.target_calories ?? 0,
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
