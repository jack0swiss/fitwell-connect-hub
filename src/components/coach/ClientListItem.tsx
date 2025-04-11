
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CalendarClock, Clock } from 'lucide-react';

interface ClientProps {
  id: string;
  name: string;
  avatarUrl?: string;
  nextWorkout?: string;
  lastLogin?: string;
  onSelect: (id: string) => void;
}

const ClientListItem = ({ id, name, avatarUrl, nextWorkout, lastLogin, onSelect }: ClientProps) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return (
    <Card 
      className="fitness-card hover:bg-card/90 transition-colors cursor-pointer"
      onClick={() => onSelect(id)}
    >
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 border-2 border-fitwell-purple">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-fitwell-purple-dark text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">{name}</h3>
          <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-muted-foreground">
            {nextWorkout && (
              <div className="flex items-center">
                <CalendarClock className="h-3 w-3 mr-1 text-fitwell-purple" />
                <span>Next: {nextWorkout}</span>
              </div>
            )}
            {lastLogin && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-fitwell-purple" />
                <span>Last seen: {lastLogin}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClientListItem;
