
import { Client } from '@/types/client';
import { ClientAssignmentCard } from './ClientAssignmentCard';
import LoadingSpinner from '../nutrition/LoadingSpinner';

interface ClientAssignmentListProps {
  clients: Client[];
  loading: boolean;
  onToggleAssignment: (client: Client) => void;
}

export const ClientAssignmentList = ({ clients, loading, onToggleAssignment }: ClientAssignmentListProps) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No clients available to assign this plan to.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map(client => (
        <ClientAssignmentCard 
          key={client.id} 
          client={client} 
          onToggleAssignment={onToggleAssignment} 
        />
      ))}
    </div>
  );
};
