
import { useState } from 'react';
import { ChatView } from '@/components/chat/ChatView';
import { ConversationList } from '@/components/chat/ConversationList';
import TabBar from '@/components/TabBar';
import { useMobile } from '@/hooks/use-mobile';

const CoachChat = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();
  const isMobile = useMobile();
  const [showConversations, setShowConversations] = useState(true);
  
  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    if (isMobile) {
      setShowConversations(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <h1 className="text-xl font-bold">Client Messages</h1>
      </header>
      
      <main className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-11rem)]">
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
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachChat;
