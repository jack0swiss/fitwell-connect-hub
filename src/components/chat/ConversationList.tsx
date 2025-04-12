
import { ConversationItem } from './ConversationItem';
import { ConversationListSkeleton } from './ConversationListSkeleton';
import { ConversationListEmpty } from './ConversationListEmpty';
import { useConversationList } from '@/hooks/use-conversation-list';

interface ConversationListProps {
  onSelectPartner: (partnerId: string) => void;
  selectedPartnerId?: string;
  userRole: 'coach' | 'client';
}

export function ConversationList({ 
  onSelectPartner, 
  selectedPartnerId,
  userRole
}: ConversationListProps) {
  const { partners, isLoading, currentUserId } = useConversationList(userRole);

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (!currentUserId) {
    return <ConversationListEmpty message="You need to be logged in to view conversations." />;
  }

  if (partners.length === 0) {
    return <ConversationListEmpty message="No conversation partners found." />;
  }

  return (
    <div className="space-y-2 p-2">
      {partners.map(partner => (
        <ConversationItem
          key={partner.id}
          partner={partner}
          isSelected={selectedPartnerId === partner.id}
          onClick={() => onSelectPartner(partner.id)}
        />
      ))}
    </div>
  );
}
