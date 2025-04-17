
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { WorkoutPlan } from '@/types/workout';

interface PlanAssignmentHeaderProps {
  plan: WorkoutPlan;
}

export const PlanAssignmentHeader = ({ plan }: PlanAssignmentHeaderProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium">{plan.name}</h3>
      {plan.description && (
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      )}
      <div className="text-xs text-muted-foreground mt-2 flex items-center">
        <Calendar className="h-3 w-3 mr-1" />
        <span>Created {format(new Date(plan.created_at), 'PPP')}</span>
      </div>
    </div>
  );
};
