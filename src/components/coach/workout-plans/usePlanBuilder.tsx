
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Workout, WorkoutPlan } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const workoutPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
});

export type PlanFormValues = z.infer<typeof workoutPlanSchema>;

interface UsePlanBuilderProps {
  initialPlan?: WorkoutPlan;
  onBack: () => void;
}

export function usePlanBuilder({ initialPlan, onBack }: UsePlanBuilderProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: initialPlan?.name || '',
      description: initialPlan?.description || '',
    },
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!initialPlan) return;
      
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('plan_id', initialPlan.id)
          .order('day_of_week');
          
        if (error) throw error;
        setWorkouts(data || []);
      } catch (error) {
        console.error('Error loading workouts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workouts',
          variant: 'destructive',
        });
      }
    };
    
    if (initialPlan) {
      fetchWorkouts();
    }
  }, [initialPlan]);

  const handleSubmit = async (values: PlanFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Saving plan with values:', values);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Current user:', user);
      
      let planId = initialPlan?.id;
      
      if (!planId) {
        // Create new plan
        console.log('Creating new plan with coach_id:', user.id);
        const { data, error } = await supabase
          .from('workout_plans')
          .insert({
            name: values.name,
            description: values.description || null,
            coach_id: user.id,
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating plan:', error);
          throw error;
        }
        
        if (!data) {
          throw new Error('No data returned from insert operation');
        }
        
        console.log('Plan created successfully:', data);
        planId = data.id;
      } else {
        // Update existing plan
        console.log('Updating plan with ID:', planId);
        const { error } = await supabase
          .from('workout_plans')
          .update({
            name: values.name,
            description: values.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', planId);
          
        if (error) {
          console.error('Error updating plan:', error);
          throw error;
        }
        
        console.log('Plan updated successfully');
      }
      
      toast({
        title: 'Success',
        description: initialPlan ? 'Plan updated successfully' : 'Plan created successfully',
      });
      
      // Return to plans list
      onBack();
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout plan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkoutSaved = () => {
    // Refresh workouts after editing
    if (initialPlan) {
      supabase
        .from('workouts')
        .select('*')
        .eq('plan_id', initialPlan.id)
        .order('day_of_week')
        .then(({ data, error }) => {
          if (error) {
            console.error('Error refreshing workouts:', error);
          } else {
            setWorkouts(data || []);
          }
        });
    }
    
    setSelectedWorkout(null);
    setIsCreatingWorkout(false);
  };

  return {
    form,
    workouts,
    setWorkouts,
    isSubmitting,
    selectedWorkout,
    setSelectedWorkout,
    isCreatingWorkout,
    setIsCreatingWorkout,
    onSubmit: handleSubmit,
    handleWorkoutSaved
  };
}
