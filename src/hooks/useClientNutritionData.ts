
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClientNutritionData } from '@/types/nutrition';

export const useClientNutritionData = (clientId: string | null) => {
  return useQuery({
    queryKey: ['nutritionData', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data: totals, error } = await supabase.rpc(
        'get_daily_nutrition_totals',
        {
          user_id: clientId,
          log_date: new Date().toISOString().split('T')[0]
        }
      );

      if (error) throw error;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      
      const { data: logs, error: logsError } = await supabase
        .from('nutrition_logs')
        .select('date, calories')
        .eq('client_id', clientId)
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
      } as ClientNutritionData;
    },
    enabled: !!clientId
  });
};
