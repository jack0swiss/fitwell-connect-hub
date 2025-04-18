import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface DashboardData {
  name: string;
  motivationalQuote: string;
  workout: {
    title: string;
    duration: string;
    exercises: number;
  };
  nutrition: {
    caloriesConsumed: number;
    caloriesGoal: number;
    nextMeal: string;
  };
  progress: {
    weeklyWorkouts: number;
    weeklyGoal: number;
    weightChange: string;
  };
}

export const useDashboardData = () => {
  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch user's first name from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        // Get nutrition data for today
        const { data: nutritionData } = await supabase.rpc('get_daily_nutrition_totals', {
          user_id: user.id,
          log_date: new Date().toISOString().split('T')[0]
        });

        // Get assigned workout plan and today's workout
        const { data: assignments } = await supabase
          .from('workout_assignments')
          .select(`
            *,
            plan:workout_plans(
              *,
              workouts(*)
            )
          `)
          .is('end_date', null)
          .single();

        const today = new Date().getDay();
        const todayWorkout = assignments?.plan?.workouts?.find(w => w.day_of_week === today);

        // Get workout logs for this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const { data: workoutLogs } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('client_id', user.id)
          .gte('date', startOfWeek.toISOString())
          .eq('completed', true);

        // Get recent body metrics for weight change
        const { data: bodyMetrics } = await supabase
          .from('body_metrics')
          .select('*')
          .eq('client_id', user.id)
          .order('date', { ascending: false })
          .limit(2);

        const weightChange = bodyMetrics && bodyMetrics.length > 1
          ? bodyMetrics[0].weight_kg - bodyMetrics[1].weight_kg
          : 0;

        // Get count of exercises for the workout
        let exerciseCount = 0;
        if (todayWorkout) {
          const { data: exerciseData } = await supabase
            .from('workout_exercises')
            .select('*')
            .eq('workout_id', todayWorkout.id);
          
          exerciseCount = exerciseData?.length || 0;
        }

        // Get calorie target from nutrition plan
        let calorieTarget = 2000; // Default
        const { data: nutritionPlan } = await supabase
          .from('nutrition_plans')
          .select('*')
          .eq('client_id', user.id)
          .is('end_date', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (nutritionPlan) {
          calorieTarget = nutritionPlan.daily_calorie_target || 2000;
        }

        return {
          name: profileData?.first_name || user.user_metadata?.first_name || 'Client',
          motivationalQuote: "Keep pushing forward! Every step counts.",
          workout: {
            title: todayWorkout?.name || 'Rest Day',
            duration: '45 minutes',
            exercises: exerciseCount,
          },
          nutrition: {
            caloriesConsumed: nutritionData?.[0]?.total_calories || 0,
            caloriesGoal: calorieTarget,
            nextMeal: 'Based on your schedule',
          },
          progress: {
            weeklyWorkouts: workoutLogs?.length || 0,
            weeklyGoal: 5,
            weightChange: `${weightChange > 0 ? 'Gained' : 'Lost'} ${Math.abs(weightChange)}kg this week`,
          }
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
        return null;
      }
    }
  });

  return { dashboardData, loading };
};
