
import React, { useEffect, useState } from 'react';
import { Bell, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TabBar from '@/components/TabBar';
import DailyOverview from '@/components/client/DailyOverview';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

// Mock data - would come from Supabase in a real app
const mockClientData = {
  id: '101',
  name: 'Alex Kim',
  motivationalQuote: "Every small step counts. Keep pushing!",
  workout: {
    title: 'Full Body Strength',
    duration: '45 minutes',
    exercises: 8,
  },
  nutrition: {
    caloriesConsumed: 950,
    caloriesGoal: 2200,
    nextMeal: 'Protein-rich lunch at 1:00 PM',
  },
  progress: {
    weeklyWorkouts: 3,
    weeklyGoal: 5,
    weightChange: 'Lost 0.5kg this week',
  }
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Fetch unread message count
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('unread_message_counts')
          .select('unread_count')
          .eq('user_id', user.id);
          
        if (!error && data) {
          const totalUnread = data.reduce((sum, item) => sum + item.unread_count, 0);
          setUnreadMessages(totalUnread);
        }
      }
    };
    
    fetchUnreadCount();
    
    // Subscribe to message updates
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
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">FitWell Connect</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/client/chat')}>
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-fitwell-purple">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-fitwell-purple rounded-full"></span>
          </Button>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        <DailyOverview
          userName={mockClientData.name}
          motivationalQuote={mockClientData.motivationalQuote}
          workout={mockClientData.workout}
          nutrition={mockClientData.nutrition}
          progress={mockClientData.progress}
        />
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientDashboard;
