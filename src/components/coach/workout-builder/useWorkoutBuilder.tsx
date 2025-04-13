
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, Workout, WorkoutExercise } from '@/types/workout';
import { toast } from '@/components/ui/use-toast';

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  day_of_week: z.string().optional(),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;

interface UseWorkoutBuilderProps {
  planId: string | null;
  onBack: () => void;
  initialWorkout?: Workout;
}

export function useWorkoutBuilder({ planId, onBack, initialWorkout }: UseWorkoutBuilderProps) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: initialWorkout?.name || '',
      description: initialWorkout?.description || '',
      day_of_week: initialWorkout?.day_of_week !== null ? initialWorkout.day_of_week.toString() : undefined,
    },
  });

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
        setExercises(data);
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

  const onSubmit = async (values: WorkoutFormValues) => {
    try {
      setIsSubmitting(true);

      let workoutId = initialWorkout?.id;
      const dayOfWeek = values.day_of_week ? parseInt(values.day_of_week) : null;

      // Create or update the workout
      if (!workoutId) {
        // Create new workout
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
        // Update existing workout
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

      // Save workout exercises
      if (exercises.length > 0) {
        // First, delete any existing exercises not in our list (if updating)
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
            // If we have no existing IDs, delete all exercises for this workout
            const { error } = await supabase
              .from('workout_exercises')
              .delete()
              .eq('workout_id', workoutId);
              
            if (error) throw error;
          }
        }

        // Now insert or update exercises
        for (let i = 0; i < exercises.length; i++) {
          const exercise = exercises[i];
          const isNew = !exercise.id || exercise.id.startsWith('new-');
          
          if (isNew) {
            // Insert new exercise
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
            // Update existing exercise
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

      // Go back to the workout plan
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

  const handleSelectExercise = (exercise: Exercise) => {
    if (editingExerciseId) {
      // Update existing exercise
      setExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === editingExerciseId 
            ? { ...ex, exercise_id: exercise.id, exercise } 
            : ex
        )
      );
      setEditingExerciseId(null);
    } else {
      // Add new exercise
      const newExercise: WorkoutExercise = {
        id: `new-${Date.now()}`,
        workout_id: initialWorkout?.id || null,
        exercise_id: exercise.id,
        sets: 3,
        reps: 10,
        weight: null,
        rest_time: 60,
        notes: null,
        order_index: exercises.length,
        is_superset: false,
        superset_group: null,
        exercise
      };
      
      setExercises([...exercises, newExercise]);
    }
    
    setShowExerciseLibrary(false);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (id: string, updates: Partial<WorkoutExercise>) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  };

  return {
    form,
    exercises,
    isSubmitting,
    showExerciseLibrary,
    editingExerciseId,
    setExercises,
    setShowExerciseLibrary,
    setEditingExerciseId,
    onSubmit: form.handleSubmit(onSubmit),
    handleSelectExercise,
    handleDeleteExercise,
    handleUpdateExercise,
    handleDragEnd
  };
}
