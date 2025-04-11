
import { useState } from 'react';
import TabBar from '@/components/TabBar';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatView } from '@/components/chat/ChatView';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-mobile';

const ClientChat = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
  };
  
  const handleBack = () => {
    setSelectedPartnerId(undefined);
  };
  
  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          {isMobile && selectedPartnerId ? (
            <Button variant="ghost" size="sm" className="mr-2 p-0" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
          Messages
        </h1>
      </header>
      
      <main className="h-[calc(100vh-136px)]">
        <div className="h-full max-w-6xl mx-auto">
          {isMobile ? (
            selectedPartnerId ? (
              <ChatView partnerId={selectedPartnerId} />
            ) : (
              <ConversationList 
                onSelectPartner={handleSelectPartner}
                userRole="client"
              />
            )
          ) : (
            <div className="grid grid-cols-12 h-full">
              <div className="col-span-4 border-r overflow-y-auto">
                <ConversationList 
                  onSelectPartner={handleSelectPartner}
                  selectedPartnerId={selectedPartnerId}
                  userRole="client"
                />
              </div>
              <div className="col-span-8">
                {selectedPartnerId ? (
                  <ChatView partnerId={selectedPartnerId} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Select a conversation to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientChat;
