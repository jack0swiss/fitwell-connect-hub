
import { WorkoutPlan } from '@/types/workout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Users, Calendar, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onEdit: (plan: WorkoutPlan) => void;
  onAssign: (plan: WorkoutPlan) => void;
  onDelete: (planId: string) => void;
}

export const WorkoutPlanCard = ({ plan, onEdit, onAssign, onDelete }: WorkoutPlanCardProps) => {
  return (
    <Card key={plan.id} className="fitness-card">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="font-semibold text-lg">{plan.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign(plan)}>
                <Users className="h-4 w-4 mr-2" />
                Assign to Clients
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(plan.id)}
              >
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
        )}
        
        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(plan)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAssign(plan)}
          >
            <Users className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
