
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Workout } from '@/types/workout';

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  day_of_week: z.string().optional(),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;

export function useWorkoutForm(initialWorkout?: Workout) {
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: initialWorkout?.name || '',
      description: initialWorkout?.description || '',
      day_of_week: initialWorkout?.day_of_week !== null && initialWorkout?.day_of_week !== undefined 
        ? initialWorkout.day_of_week.toString() 
        : undefined,
    },
  });

  return form;
}
