
import { Client } from '@/types/client';
import { WorkoutPlan } from '@/types/workout';

export interface WorkoutAssignmentProps {
  plan: WorkoutPlan;
  onBack: () => void;
}

export interface ClientAssignmentCardProps {
  client: Client;
  onToggleAssignment: (client: Client) => void;
}
