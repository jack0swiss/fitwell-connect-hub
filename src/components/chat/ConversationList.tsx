
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPartner } from '@/hooks/use-chat';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface ConversationListProps {
  onSelectPartner: (partnerId: string) => void;
  selectedPartnerId?: string;
  userRole: 'coach' | 'client';
}

export function ConversationList({ 
  onSelectPartner, 
  selectedPartnerId,
  userRole
}: ConversationListProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        You need to be logged in to view conversations.
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No conversation partners found.
      </div>
    );
  }

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-2 p-2">
      {partners.map(partner => (
        <Card
          key={partner.id}
          className={`flex items-center p-3 cursor-pointer hover:bg-muted transition-colors ${
            selectedPartnerId === partner.id ? 'bg-muted' : ''
          }`}
          onClick={() => onSelectPartner(partner.id)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={partner.avatarUrl || ''} alt={partner.name} />
            <AvatarFallback className="bg-fitwell-purple text-white">
              {getInitials(partner.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{partner.name}</h3>
              {partner.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(partner.lastMessage.sent_at), { addSuffix: true })}
                </span>
              )}
            </div>
            
            {partner.lastMessage && (
              <p className="text-sm text-muted-foreground truncate">
                {partner.lastMessage.sender_id === partner.id ? '' : 'You: '}
                {partner.lastMessage.content}
              </p>
            )}
          </div>
          
          {partner.unreadCount > 0 && (
            <Badge variant="default" className="ml-2 bg-fitwell-purple">
              {partner.unreadCount}
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
