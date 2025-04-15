
import React, { useState, useEffect } from 'react';
import DailyOverview from '@/components/client/DailyOverview';
import TabBar from '@/components/TabBar';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/client/dashboard/DashboardHeader';
import { useDashboardData } from '@/hooks/useDashboardData';

const ClientDashboard = () => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { dashboardData, loading } = useDashboardData();

  useEffect(() => {
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
          // Update unread message count here
          const fetchUnreadCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
              .from('unread_message_counts')
              .select('unread_count')
              .eq('user_id', user.id);

            if (data) {
              const totalUnread = data.reduce((sum, item) => sum + (item.unread_count || 0), 0);
              setUnreadMessages(totalUnread);
            }
          };
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fitwell-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <DashboardHeader unreadMessages={unreadMessages} />
      
      <main className="p-4 max-w-2xl mx-auto">
        {dashboardData && (
          <DailyOverview
            userName={dashboardData.name}
            motivationalQuote={dashboardData.motivationalQuote}
            workout={dashboardData.workout}
            nutrition={dashboardData.nutrition}
            progress={dashboardData.progress}
          />
        )}
      </main>
      
      <TabBar baseRoute="/client" />
    </div>
  );
};

export default ClientDashboard;
