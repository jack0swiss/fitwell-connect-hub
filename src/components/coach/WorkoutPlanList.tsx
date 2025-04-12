
import { useState } from 'react';
import { WorkoutPlan } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WorkoutPlanBuilder } from './WorkoutPlanBuilder';
import { WorkoutPlanAssignment } from './WorkoutPlanAssignment';
import { WorkoutPlanCard } from './workout-plans/WorkoutPlanCard';
import { EmptyPlansList } from './workout-plans/EmptyPlansList';
import { LoadingSpinner } from './workout-plans/LoadingSpinner';
import { ErrorDisplay } from './workout-plans/ErrorDisplay';
import { useWorkoutPlans } from './workout-plans/useWorkoutPlans';

export const WorkoutPlanList = () => {
  const { plans, loading, error, refreshPlans, deletePlan } = useWorkoutPlans();
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);

  const handleEditPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setIsCreatingPlan(false);
  };

  const handleAssignPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setIsAssigningPlan(true);
  };

  const handleDeletePlan = (planId: string) => {
    deletePlan(planId);
  };

  if (selectedPlan || isCreatingPlan) {
    return (
      <WorkoutPlanBuilder
        initialPlan={selectedPlan || undefined}
        onBack={() => {
          setSelectedPlan(null);
          setIsCreatingPlan(false);
          refreshPlans();
        }}
      />
    );
  }

  if (isAssigningPlan && selectedPlan) {
    return (
      <WorkoutPlanAssignment
        plan={selectedPlan}
        onBack={() => {
          setSelectedPlan(null);
          setIsAssigningPlan(false);
        }}
      />
    );
  }

  if (error) {
    return <ErrorDisplay errorMessage={error} onRetry={refreshPlans} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workout Plans</h2>
        <Button onClick={() => setIsCreatingPlan(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : plans.length === 0 ? (
        <EmptyPlansList onCreatePlan={() => setIsCreatingPlan(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEditPlan}
              onAssign={handleAssignPlan}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}
    </div>
  );
};
