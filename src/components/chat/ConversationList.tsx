
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPartner } from '@/hooks/use-chat';
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Find conversation partners based on user role
        let query;
        if (userRole === 'coach') {
          // Coaches see all clients
          query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client');
        } else {
          // Clients see their coach
          query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'coach');
        }
        
        const { data: profiles, error } = await query;
        if (error) throw error;
        
        // Get unread message counts
        const { data: unreadCounts, error: unreadError } = await supabase
          .from('unread_message_counts')
          .select('*')
          .eq('user_id', user.id);
        
        if (unreadError) throw unreadError;
        
        // Get last messages
        const { data: lastMessages, error: lastMsgError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('sent_at', { ascending: false });
        
        if (lastMsgError) throw lastMsgError;
        
        // Map profiles to chat partners
        const mappedPartners = profiles.map(profile => {
          const unreadCount = unreadCounts?.find(count => count.from_user_id === profile.id)?.unread_count || 0;
          
          // Find the last message between the current user and this partner
          const lastMsg = lastMessages?.find(msg => 
            (msg.sender_id === user.id && msg.receiver_id === profile.id) || 
            (msg.sender_id === profile.id && msg.receiver_id === user.id)
          );
          
          return {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            avatarUrl: profile.avatar_url,
            unreadCount,
            lastMessage: lastMsg
          };
        });
        
        setPartners(mappedPartners);
      } catch (err) {
        console.error('Error fetching conversation partners:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPartners();
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh the partner list when new messages arrive
          fetchPartners();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
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
            <AvatarImage src={partner.avatarUrl} alt={partner.name} />
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
