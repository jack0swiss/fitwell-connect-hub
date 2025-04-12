
import { useState } from 'react';
import { ChatView } from '@/components/chat/ChatView';
import { ConversationList } from '@/components/chat/ConversationList';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientLayout } from '@/components/layouts/ClientLayout';

const ClientChat = () => {
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
    <ClientLayout title="Coach Messages">
      <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-11rem)]">
        {(!isMobile || showConversations) && (
          <div className="border-r border-border/50 overflow-y-auto">
            <ConversationList 
              onSelectPartner={handleSelectPartner} 
              selectedPartnerId={selectedPartnerId}
              userRole="client"
            />
          </div>
        )}
        
        {(!isMobile || !showConversations) && (
          <div className="h-full">
            {selectedPartnerId ? (
              <ChatView partnerId={selectedPartnerId} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a coach to start chatting</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientChat;
