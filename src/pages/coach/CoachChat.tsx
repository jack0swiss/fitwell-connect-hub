
import { useState } from 'react';
import { ChatView } from '@/components/chat/ChatView';
import { ConversationList } from '@/components/chat/ConversationList';
import { useIsMobile } from '@/hooks/use-mobile';
import { CoachLayout } from '@/components/layouts/CoachLayout';

const CoachChat = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();
  const isMobile = useIsMobile();
  const [showConversations, setShowConversations] = useState(true);
  
  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    if (isMobile) {
      setShowConversations(false);
    }
  };
  
  return (
    <CoachLayout title="Client Messages">
      <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-11rem)]">
        {(!isMobile || showConversations) && (
          <div className="border-r border-border/50 overflow-y-auto">
            <ConversationList 
              onSelectPartner={handleSelectPartner} 
              selectedPartnerId={selectedPartnerId}
              userRole="coach"
            />
          </div>
        )}
        
        {(!isMobile || !showConversations) && (
          <div className="h-full">
            {selectedPartnerId ? (
              <ChatView partnerId={selectedPartnerId} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a client to start chatting</p>
              </div>
            )}
          </div>
        )}
      </div>
    </CoachLayout>
  );
};

export default CoachChat;
