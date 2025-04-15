import { useState } from 'react';
import { WorkoutExercise, Workout } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WorkoutFormValues } from './useWorkoutForm';

interface UseWorkoutSubmissionProps {
  planId: string | null;
  initialWorkout?: Workout;
  onBack: () => void;
}

export function useWorkoutSubmission({ 
  planId, 
  initialWorkout, 
  onBack 
}: UseWorkoutSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: WorkoutFormValues) => {
    try {
      setIsSubmitting(true);

      let workoutId = initialWorkout?.id;
      const dayOfWeek = values.day_of_week ? parseInt(values.day_of_week) : null;

      if (!workoutId) {
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            name: values.name,
            description: values.description || null,
            day_of_week: dayOfWeek,
            plan_id: planId,
          })
          .select()
          .single();

        if (error) throw error;
        workoutId = data.id;
      } else {
        const { error } = await supabase
          .from('workouts')
          .update({
            name: values.name,
            description: values.description || null,
            day_of_week: dayOfWeek,
          })
          .eq('id', workoutId);

        if (error) throw error;
      }

      if (exercises.length > 0) {
        if (initialWorkout) {
          const existingIds = exercises
            .filter(e => e.id && !e.id.startsWith('new-'))
            .map(e => e.id);
            
          if (existingIds.length > 0) {
            const { error } = await supabase
              .from('workout_exercises')
              .delete()
              .eq('workout_id', workoutId)
              .not('id', 'in', `(${existingIds.join(',')})`);
              
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('workout_exercises')
              .delete()
              .eq('workout_id', workoutId);
              
            if (error) throw error;
          }
        }

        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];
          const isNew = !exercise.id || exercise.id.startsWith('new-');
          
          if (isNew) {
            const { error } = await supabase
              .from('workout_exercises')
              .insert({
                workout_id: workoutId,
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                rest_time: exercise.rest_time,
                notes: exercise.notes,
                order_index: i,
                is_superset: exercise.is_superset,
                superset_group: exercise.superset_group,
              });
              
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('workout_exercises')
              .update({
                exercise_id: exercise.exercise_id,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                rest_time: exercise.rest_time,
                notes: exercise.notes,
                order_index: i,
                is_superset: exercise.is_superset,
                superset_group: exercise.superset_group,
              })
              .eq('id', exercise.id);
              
            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Success',
        description: initialWorkout ? 'Workout updated successfully' : 'Workout created successfully',
      });

      onBack();

    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
