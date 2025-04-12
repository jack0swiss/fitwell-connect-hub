
import { useState, useEffect } from 'react';
import { WorkoutPlan } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useWorkoutPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching workout plans...");
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log("Session found:", session.user.id);
      
      // Fetch workout plans
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error details:', error);
        setError(`Failed to load workout plans: ${error.message}`);
        throw error;
      }
      
      console.log('Workout plans fetched successfully:', data);
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      setError("Failed to load workout plans. Please try again.");
      toast({
        title: 'Error',
        description: 'Failed to load workout plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      setPlans(plans.filter(p => p.id !== planId));
      toast({
        title: 'Success',
        description: 'Workout plan deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workout plan',
        variant: 'destructive',
      });
    }
  };

  return { 
    plans, 
    loading, 
    error, 
    refreshPlans: fetchPlans, 
    deletePlan 
  };
};
