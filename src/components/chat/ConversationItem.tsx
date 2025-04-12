
import { ChatPartner } from '@/hooks/use-chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  partner: ChatPartner;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ partner, isSelected, onClick }: ConversationItemProps) {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card
      className={`flex items-center p-3 cursor-pointer hover:bg-muted transition-colors ${
        isSelected ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={partner.avatarUrl || ''} alt={partner.name} />
        <AvatarFallback className="bg-fitwell-purple text-white">
          {getInitials(partner.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{partner.name}</h3>
          {partner.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(partner.lastMessage.sent_at), { addSuffix: true })}
            </span>
          )}
        </div>
        
        {partner.lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {partner.lastMessage.sender_id === partner.id ? '' : 'You: '}
            {partner.lastMessage.content}
          </p>
        )}
      </div>
      
      {partner.unreadCount > 0 && (
        <Badge variant="default" className="ml-2 bg-fitwell-purple">
          {partner.unreadCount}
        </Badge>
      )}
    </Card>
  );
}
