
import { useState, useEffect } from 'react';
import { ChatView } from '@/components/chat/ChatView';
import { ConversationList } from '@/components/chat/ConversationList';
import { useIsMobile } from '@/hooks/use-mobile';
import { CoachLayout } from '@/components/layouts/CoachLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const handleBackToList = () => {
    setShowConversations(true);
  };
  
  return (
    <CoachLayout title="Client Messages">
      <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-11rem)]">
        {(!isMobile || showConversations) && (
          <div className="border-r border-border/50 overflow-hidden flex flex-col">
            <h2 className="px-4 py-3 text-lg font-semibold border-b">Clients</h2>
            <ScrollArea className="flex-1">
              <ConversationList 
                onSelectPartner={handleSelectPartner} 
                selectedPartnerId={selectedPartnerId}
                userRole="coach"
              />
            </ScrollArea>
          </div>
        )}
        
        {(!isMobile || !showConversations) && (
          <div className="h-full flex flex-col">
            {isMobile && !showConversations && (
              <div className="p-2 border-b">
                <Button variant="ghost" size="sm" onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to clients
                </Button>
              </div>
            )}
            
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
