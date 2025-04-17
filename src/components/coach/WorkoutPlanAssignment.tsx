
import { ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutAssignmentProps } from '@/types/assignment';
import { useClientAssignments } from '@/hooks/useClientAssignments';
import { ClientAssignmentList } from './workouts/ClientAssignmentList';
import { PlanAssignmentHeader } from './workouts/PlanAssignmentHeader';

export const WorkoutPlanAssignment = ({ plan, onBack }: WorkoutAssignmentProps) => {
  const { clients, loading, toggleAssignment } = useClientAssignments(plan.id);

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
          <CardTitle>Assign Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanAssignmentHeader plan={plan} />
          
          <h3 className="text-md font-medium mb-3">Clients</h3>
          
          <ClientAssignmentList 
            clients={clients} 
            loading={loading} 
            onToggleAssignment={toggleAssignment} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
