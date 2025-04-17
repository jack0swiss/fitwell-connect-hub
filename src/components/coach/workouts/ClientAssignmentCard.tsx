
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';
import { ClientAssignmentCardProps } from '@/types/assignment';

export const ClientAssignmentCard = ({ client, onToggleAssignment }: ClientAssignmentCardProps) => {
  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={client.avatarUrl} alt={client.name} />
          <AvatarFallback className="bg-fitwell-purple-dark text-white">
            {getAvatarInitials(client.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{client.name}</h4>
          <p className="text-xs text-muted-foreground">{client.email}</p>
          {client.assignmentStartDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Assigned since: {format(new Date(client.assignmentStartDate), 'PPP')}
            </p>
          )}
        </div>
      </div>
      <Button
        variant={client.isAssigned ? "destructive" : "default"}
        size="sm"
        onClick={() => onToggleAssignment(client)}
      >
        {client.isAssigned ? (
          <>
            <X className="h-4 w-4 mr-1" />
            Unassign
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-1" />
            Assign
          </>
        )}
      </Button>
    </div>
  );
};
