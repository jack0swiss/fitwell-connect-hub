
import { useEffect, useRef, useState } from 'react';
import { useChat, ChatMessage } from '@/hooks/use-chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ChatViewProps {
  partnerId: string;
}

export function ChatView({ partnerId }: ChatViewProps) {
  const { messages, isLoading, sendMessage } = useChat(partnerId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        console.log("Fetching current user...");
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error getting user:", error.message);
          toast({
            title: "Authentication Error",
            description: "Unable to retrieve your user information. Please try logging in again.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Current user data:", data.user);
        setCurrentUserId(data.user?.id || null);
      } catch (err) {
        console.error("Unexpected error getting user:", err);
      } finally {
        setAuthChecked(true);
      }
    };
    
    getCurrentUser();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  console.log("Chat view: current user:", currentUserId, "partner:", partnerId, "messages:", messages);

  if (isLoading || !authChecked) {
    return (
      <div className="flex flex-col h-full p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className={`h-20 w-4/5 rounded-md ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full mt-4" />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-muted-foreground">You need to be logged in to use chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-16">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message: ChatMessage) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isCurrentUser={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 left-0 right-0">
        <ChatInput 
          onSendMessage={sendMessage} 
          disabled={!partnerId || !currentUserId}
        />
      </div>
    </div>
  );
}
