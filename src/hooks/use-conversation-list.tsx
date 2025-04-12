
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ChatPartner, ChatMessage } from '@/hooks/use-chat';

export function useConversationList(userRole: 'coach' | 'client') {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // First get the current user
    const getAuthUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Auth error:", error.message);
          toast({
            title: "Authentication Error",
            description: "Unable to retrieve your user information",
            variant: "destructive"
          });
          return null;
        }
        return data.user?.id || null;
      } catch (err) {
        console.error("Unexpected auth error:", err);
        return null;
      }
    };

    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const userId = await getAuthUser();
        if (!userId) {
          setIsLoading(false);
          return;
        }
        
        setCurrentUserId(userId);
        console.log("Current user:", userId, "with role:", userRole);
        
        // Fetch all messages where the current user is either sender or receiver
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('sent_at', { ascending: false });
          
        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          throw messagesError;
        }

        console.log("Messages data:", messagesData);
        
        // Extract unique user IDs that are not the current user
        const uniquePartnersMap = new Map<string, {
          lastMessage: any,
          unreadCount: number
        }>();
        
        messagesData?.forEach(msg => {
          const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          
          // Skip if it's somehow the same user
          if (partnerId === userId) return;
          
          const existing = uniquePartnersMap.get(partnerId);
          const isUnread = !msg.is_read && msg.receiver_id === userId;
          
          if (!existing) {
            uniquePartnersMap.set(partnerId, {
              lastMessage: msg,
              unreadCount: isUnread ? 1 : 0
            });
          } else {
            // Only update last message if this one is newer
            if (new Date(msg.sent_at) > new Date(existing.lastMessage.sent_at)) {
              existing.lastMessage = msg;
            }
            
            if (isUnread) {
              existing.unreadCount += 1;
            }
          }
        });
        
        console.log("Unique partners map:", uniquePartnersMap);
        
        // Convert to array for the component
        const partnersList = Array.from(uniquePartnersMap.entries()).map(([id, data]) => {
          // In a real app with profiles table, you'd fetch actual names
          // For mock purposes, create a fallback name based on the role
          const partnerName = userRole === 'coach' ? `Client ${id.slice(0, 4)}` : `Coach ${id.slice(0, 4)}`;
          
          return {
            id,
            name: partnerName,
            avatarUrl: null,
            unreadCount: data.unreadCount,
            lastMessage: data.lastMessage
          };
        });
        
        console.log("Mapped partners:", partnersList);
        setPartners(partnersList);
      } catch (err) {
        console.error('Error fetching conversation partners:', err);
        toast({
          title: "Error",
          description: "Failed to load your conversations",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPartners();
    
    // Set up realtime subscription for new messages
    const setupRealtimeSubscription = async () => {
      const userId = await getAuthUser();
      if (!userId) return;
      
      const channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
          },
          (payload) => {
            console.log("New message received:", payload);
            // Refresh the partner list when a new message arrives
            fetchPartners();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup.then(fn => fn());
    };
  }, [userRole]);

  return { partners, isLoading, currentUserId };
}
