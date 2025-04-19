
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BodyMetricData {
  date: string;
  weight: number;
  bodyFat: number;
}

export const useClientBodyMetrics = (clientId: string | null) => {
  return useQuery({
    queryKey: ['bodyMetrics', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('body_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return data.map(metric => ({
        date: new Date(metric.date).toLocaleDateString(),
        weight: metric.weight_kg || 0,
        bodyFat: metric.body_fat_percent || 0
      })) as BodyMetricData[];
    },
    enabled: !!clientId
  });
};
