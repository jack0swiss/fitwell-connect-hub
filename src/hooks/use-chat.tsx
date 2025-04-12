
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
};

export type ChatPartner = {
  id: string;
  name: string;
  avatarUrl?: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
};

export function useChat(partnerId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<ChatPartner | null>(null);

  // Fetch chat messages
  const fetchMessages = async () => {
    if (!partnerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      console.log("Fetching messages between", user.id, "and", partnerId);
      
      // Fetch messages between current user and partner
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('sent_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Fetched messages:", data);
      setMessages(data as ChatMessage[]);
      
      // Mark messages as read
      if (data.some(msg => msg.receiver_id === user.id && !msg.is_read)) {
        await supabase.rpc('mark_messages_as_read', { p_conversation_partner_id: partnerId });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string, relatedEntityType?: string, relatedEntityId?: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !partnerId) {
        throw new Error('Cannot send message: Missing user or partner ID');
      }
      
      console.log("Sending message from", user.id, "to", partnerId);
      
      const newMessage = {
        sender_id: user.id,
        receiver_id: partnerId,
        content,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId
      };
      
      const { error, data } = await supabase
        .from('messages')
        .insert([newMessage])
        .select();
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      
      // No need to manually update the messages array as real-time will handle this
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
      return false;
    }
    
    return true;
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!partnerId) return;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Setting up realtime subscription for", user.id);

      // Subscribe to new messages
      const channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log("Received new message:", payload);
            // Only add messages from the current chat partner
            if (payload.new.sender_id === partnerId) {
              setMessages(prev => [...prev, payload.new as ChatMessage]);
              
              // Mark as read immediately if we're viewing this chat
              supabase.rpc('mark_messages_as_read', { p_conversation_partner_id: partnerId });
            }
          }
        )
        .subscribe();

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [partnerId]);

  // Fetch messages initially and when partner changes
  useEffect(() => {
    if (partnerId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [partnerId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages,
    partnerInfo
  };
}
