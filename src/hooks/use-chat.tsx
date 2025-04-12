
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  sent_at: string;
  is_read: boolean;
}

export interface ChatPartner {
  id: string;
  name: string;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessage?: ChatMessage;
}

export const useChat = (partnerId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch messages
  useEffect(() => {
    let isMounted = true;
    
    const fetchMessages = async () => {
      if (!partnerId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get current user first
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting user:", userError.message);
          return;
        }
        
        const userId = userData.user?.id;
        if (!userId) {
          console.error("No user ID found");
          return;
        }
        
        setCurrentUserId(userId);
        
        console.log(`Fetching messages between user ${userId} and partner ${partnerId}`);
        
        // Fetch messages where current user is either sender or receiver and partner is the other party
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
          .order('sent_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} messages`);
        
        if (isMounted) {
          setMessages(data || []);
          
          // Mark messages as read
          await supabase.rpc('mark_messages_as_read', {
            p_conversation_partner_id: partnerId
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Only add to messages if it's relevant to this conversation
          if (
            (newMessage.sender_id === partnerId || newMessage.receiver_id === partnerId) &&
            (newMessage.sender_id === currentUserId || newMessage.receiver_id === currentUserId)
          ) {
            console.log("New message in conversation:", newMessage);
            
            setMessages(prev => [...prev, newMessage]);
            
            // Mark as read if the current user is the receiver
            if (newMessage.receiver_id === currentUserId) {
              supabase.rpc('mark_messages_as_read', {
                p_conversation_partner_id: partnerId
              });
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [partnerId]);
  
  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !partnerId || !currentUserId) {
      return;
    }
    
    try {
      console.log(`Sending message from ${currentUserId} to ${partnerId}`);
      
      const newMessage = {
        content,
        sender_id: currentUserId,
        receiver_id: partnerId,
        is_read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      
      // We don't need to update the messages state here since it will be handled by the realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [partnerId, currentUserId]);
  
  return { messages, isLoading, sendMessage };
};
