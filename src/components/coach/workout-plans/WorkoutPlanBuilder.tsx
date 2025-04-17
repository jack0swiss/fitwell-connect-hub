
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WorkoutBuilder from '../workout-builder/WorkoutBuilder';
import { PlanForm } from './PlanForm';
import { usePlanBuilder } from './usePlanBuilder';
import { WorkoutPlanBuilderProps } from '@/types/workout-plan-builder';

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
          <PlanForm
            form={form}
            workouts={workouts}
            initialPlan={initialPlan}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onBack}
          />
        </CardContent>
      </Card>
    </div>
  );
};
