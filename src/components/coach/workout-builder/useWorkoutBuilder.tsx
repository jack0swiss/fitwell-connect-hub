
import { useEffect } from 'react';
import { Workout, WorkoutExercise } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useWorkoutForm } from './hooks/useWorkoutForm';
import { useExerciseList } from './hooks/useExerciseList';
import { useWorkoutSubmission } from './hooks/useWorkoutSubmission';

interface UseWorkoutBuilderProps {
  planId: string | null;
  onBack: () => void;
  initialWorkout?: Workout;
}

export function useWorkoutBuilder({ 
  planId, 
  onBack, 
  initialWorkout 
}: UseWorkoutBuilderProps) {
  const form = useWorkoutForm(initialWorkout);
  const exerciseList = useExerciseList();
  const submission = useWorkoutSubmission({ planId, initialWorkout, onBack });

  useEffect(() => {
    const fetchWorkoutExercises = async () => {
      if (!initialWorkout) return;

      try {
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            *,
            exercise:exercises(*)
          `)
          .eq('workout_id', initialWorkout.id)
          .order('order_index');

        if (error) throw error;
        exerciseList.setExercises(data);
      } catch (error) {
        console.error('Error fetching workout exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout exercises',
          variant: 'destructive',
        });
      }
    };

    if (initialWorkout) {
      fetchWorkoutExercises();
    }
  }, [initialWorkout]);

  const onSubmit = form.handleSubmit((values) => 
    submission.handleSubmit(values, exerciseList.exercises)
  );

  return {
    form,
    exercises: exerciseList.exercises,
    isSubmitting: submission.isSubmitting,
    showExerciseLibrary: exerciseList.showExerciseLibrary,
    editingExerciseId: exerciseList.editingExerciseId,
    setShowExerciseLibrary: exerciseList.setShowExerciseLibrary,
    setEditingExerciseId: exerciseList.setEditingExerciseId,
    onSubmit,
    handleSelectExercise: exerciseList.handleSelectExercise,
    handleDeleteExercise: exerciseList.handleDeleteExercise,
    handleUpdateExercise: exerciseList.handleUpdateExercise,
    handleDragEnd: exerciseList.handleDragEnd
  };
}
