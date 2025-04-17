
import { WorkoutPlan, Workout } from '@/types/workout';
import { UseFormReturn } from 'react-hook-form';
import { PlanFormValues } from '@/components/coach/workout-plans/usePlanBuilder';

export interface WorkoutPlanBuilderProps {
  initialPlan?: WorkoutPlan;
  onBack: () => void;
}

export interface PlanFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export interface WorkoutListProps {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  onCreateWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
}

export interface PlanFormProps {
  form: UseFormReturn<PlanFormValues>;
  workouts: Workout[];
  initialPlan?: WorkoutPlan;
  isSubmitting: boolean;
  onSubmit: (values: PlanFormValues) => void;
  onCancel: () => void;
}
