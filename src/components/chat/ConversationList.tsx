
import { ConversationItem } from './ConversationItem';
import { ConversationListSkeleton } from './ConversationListSkeleton';
import { ConversationListEmpty } from './ConversationListEmpty';
import { useConversationList } from '@/hooks/use-conversation-list';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
  const { partners, isLoading, currentUserId, refreshPartners } = useConversationList(userRole);
  const [showMockClients, setShowMockClients] = useState(false);

  useEffect(() => {
    // If there are no real partners, show mock ones
    if (!isLoading && partners.length === 0) {
      setShowMockClients(true);
    } else {
      setShowMockClients(false);
    }
  }, [partners, isLoading]);

  // Mock clients for demonstration
  const mockClients = [
    {
      id: 'mock-client-1',
      name: 'Sarah Johnson',
      avatarUrl: null,
      unreadCount: 2,
      lastMessage: {
        id: 'msg-1',
        content: 'When should I do my next workout?',
        sender_id: 'mock-client-1',
        receiver_id: currentUserId || '',
        sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        is_read: false
      }
    },
    {
      id: 'mock-client-2',
      name: 'Mike Peters',
      avatarUrl: null,
      unreadCount: 0,
      lastMessage: {
        id: 'msg-2',
        content: 'Thanks for updating my nutrition plan!',
        sender_id: 'mock-client-2',
        receiver_id: currentUserId || '',
        sent_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        is_read: true
      }
    },
    {
      id: 'mock-client-3',
      name: 'Emily White',
      avatarUrl: null,
      unreadCount: 0,
      lastMessage: {
        id: 'msg-3',
        content: 'I completed all my workouts this week!',
        sender_id: 'mock-client-3',
        receiver_id: currentUserId || '',
        sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        is_read: true
      }
    }
  ];

  const displayPartners = showMockClients ? mockClients : partners;

  if (isLoading) {
    return <ConversationListSkeleton />;
  }

  if (!currentUserId) {
    return <ConversationListEmpty message="You need to be logged in to view conversations." />;
  }

  if (displayPartners.length === 0) {
    return <ConversationListEmpty message="No conversation partners found." />;
  }

  return (
    <div className="space-y-2 p-2">
      <div className="flex justify-end pb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshPartners} 
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      {displayPartners.map(partner => (
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
