
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyPlansListProps {
  onCreatePlan: () => void;
}

export const EmptyPlansList = ({ onCreatePlan }: EmptyPlansListProps) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-md">
      <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
      <h3 className="mt-4 text-lg font-medium">No Workout Plans Yet</h3>
      <p className="text-muted-foreground mt-1">Create your first workout plan to assign to clients.</p>
      <Button className="mt-4" onClick={onCreatePlan}>
        <Plus className="h-4 w-4 mr-2" />
        Create Workout Plan
      </Button>
    </div>
  );
};
