
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
  related_entity_type?: string;
  related_entity_id?: string;
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
        
        // Check if this is a mock partner ID (starts with 'mock-')
        if (partnerId.startsWith('mock-')) {
          console.log("Using mock messages for mock partner");
          const mockMessages = getMockMessages(partnerId, userId);
          setMessages(mockMessages);
          setIsLoading(false);
          return;
        }
        
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
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !partnerId || !currentUserId) {
      return false;
    }
    
    try {
      console.log(`Sending message from ${currentUserId} to ${partnerId}`);
      
      // If this is a mock partner, just update the local state
      if (partnerId.startsWith('mock-')) {
        console.log("Adding mock message to state");
        const newMockMessage: ChatMessage = {
          id: `mock-msg-${Date.now()}`,
          content,
          sender_id: currentUserId,
          receiver_id: partnerId,
          sent_at: new Date().toISOString(),
          is_read: false
        };
        
        setMessages(prev => [...prev, newMockMessage]);
        
        // Also add "reply" from mock client after delay
        setTimeout(() => {
          const mockReply = getMockReply(partnerId);
          if (mockReply) {
            const replyMessage: ChatMessage = {
              id: `mock-reply-${Date.now()}`,
              content: mockReply,
              sender_id: partnerId,
              receiver_id: currentUserId || '',
              sent_at: new Date().toISOString(),
              is_read: true
            };
            setMessages(prev => [...prev, replyMessage]);
          }
        }, 2000);
        
        return true;
      }
      
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
      return true;
      
      // We don't need to update the messages state here since it will be handled by the realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  }, [partnerId, currentUserId]);
  
  // Helper functions for mock data
  const getMockMessages = (mockPartnerId: string, currentUserId: string): ChatMessage[] => {
    // Different mock conversation history based on which mock client is selected
    switch (mockPartnerId) {
      case 'mock-client-1': // Sarah Johnson
        return [
          {
            id: 'mock-hist-1',
            content: "Hi Coach! I wanted to check about my workout schedule for next week.",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            is_read: true
          },
          {
            id: 'mock-hist-2',
            content: "Hello Sarah! Let me check your plan. What specific concerns do you have?",
            sender_id: currentUserId,
            receiver_id: mockPartnerId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(), // 1.9 hours ago
            is_read: true
          },
          {
            id: 'mock-hist-3',
            content: "I'm worried the leg workouts might be too intense given my knee issues.",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 1.7).toISOString(), // 1.7 hours ago
            is_read: true
          },
          {
            id: 'mock-hist-4',
            content: "When should I do my next workout?",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            is_read: false
          }
        ];
      case 'mock-client-2': // Mike Peters
        return [
          {
            id: 'mock-hist-5',
            content: "Coach, I'm having trouble hitting my protein goals.",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            is_read: true
          },
          {
            id: 'mock-hist-6',
            content: "How about adding protein shakes after workouts? I'll update your nutrition plan.",
            sender_id: currentUserId,
            receiver_id: mockPartnerId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(), // 1.5 days ago
            is_read: true
          },
          {
            id: 'mock-hist-7',
            content: "That sounds great, I'll try that!",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            is_read: true
          },
          {
            id: 'mock-hist-8',
            content: "Thanks for updating my nutrition plan!",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            is_read: true
          }
        ];
      case 'mock-client-3': // Emily White
        return [
          {
            id: 'mock-hist-9',
            content: "Hi Coach, I've been sticking to the workout plan for the past week!",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
            is_read: true
          },
          {
            id: 'mock-hist-10',
            content: "That's fantastic Emily! How are you feeling?",
            sender_id: currentUserId,
            receiver_id: mockPartnerId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.8).toISOString(), // 2.8 days ago
            is_read: true
          },
          {
            id: 'mock-hist-11',
            content: "Much stronger! But I'm a bit sore after the HIIT sessions.",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            is_read: true
          },
          {
            id: 'mock-hist-12',
            content: "I completed all my workouts this week!",
            sender_id: mockPartnerId,
            receiver_id: currentUserId,
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            is_read: true
          }
        ];
      default:
        return [];
    }
  };
  
  const getMockReply = (mockPartnerId: string): string | null => {
    // Different mock replies based on which mock client is selected
    switch (mockPartnerId) {
      case 'mock-client-1': // Sarah Johnson
        return "Thanks for the information! I'll adjust my schedule accordingly.";
      case 'mock-client-2': // Mike Peters
        return "The protein shakes are working well! I'm at 90% of my target now.";
      case 'mock-client-3': // Emily White
        return "Looking forward to next week's plan. I'm feeling great!";
      default:
        return null;
    }
  };
  
  return { messages, isLoading, sendMessage };
};
