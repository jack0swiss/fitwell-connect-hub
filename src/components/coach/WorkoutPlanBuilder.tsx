
import { useState } from 'react';
import WorkoutBuilder from './WorkoutBuilder';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { WorkoutPlan, Workout } from '@/types/workout';
import { PlanFormFields } from './workout-plans/PlanFormFields';
import { WorkoutList } from './workout-plans/WorkoutList';
import { FormActions } from './workout-plans/FormActions';
import { usePlanBuilder } from './workout-plans/usePlanBuilder';

interface WorkoutPlanBuilderProps {
  initialPlan?: WorkoutPlan;
  onBack: () => void;
}

export const WorkoutPlanBuilder = ({ initialPlan, onBack }: WorkoutPlanBuilderProps) => {
  const {
    form,
    workouts,
    setWorkouts,
    isSubmitting,
    selectedWorkout,
    setSelectedWorkout,
    isCreatingWorkout,
    setIsCreatingWorkout,
    onSubmit,
    handleWorkoutSaved
  } = usePlanBuilder({ initialPlan, onBack });

  if (selectedWorkout || isCreatingWorkout) {
    return (
      <WorkoutBuilder 
        planId={initialPlan?.id || null}
        initialWorkout={selectedWorkout || undefined}
        onBack={handleWorkoutSaved}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="flex items-center text-sm h-8 mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to plans
      </Button>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>{initialPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <PlanFormFields />

              {initialPlan && (
                <WorkoutList 
                  workouts={workouts}
                  setWorkouts={setWorkouts}
                  onCreateWorkout={() => setIsCreatingWorkout(true)}
                  onEditWorkout={setSelectedWorkout}
                />
              )}

              <FormActions 
                onCancel={onBack}
                isSubmitting={isSubmitting}
                isEditing={!!initialPlan}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
