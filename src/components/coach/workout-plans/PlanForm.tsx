
import { Form } from '@/components/ui/form';
import { PlanFormFields } from './PlanFormFields';
import { WorkoutList } from './WorkoutList';
import { FormActions } from './FormActions';
import { PlanFormProps } from '@/types/workout-plan-builder';

export const PlanForm = ({ 
  form, 
  workouts, 
  initialPlan, 
  isSubmitting, 
  onSubmit, 
  onCancel 
}: PlanFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PlanFormFields />

        {initialPlan && (
          <WorkoutList 
            workouts={workouts}
            setWorkouts={(newWorkouts) => form.setValue('workouts', newWorkouts)}
            onCreateWorkout={() => form.setValue('isCreatingWorkout', true)}
            onEditWorkout={(workout) => form.setValue('selectedWorkout', workout)}
          />
        )}

        <FormActions 
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditing={!!initialPlan}
        />
      </form>
    </Form>
  );
};
