
import React, { useState } from 'react';
import TabBar from '@/components/TabBar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/coach/dashboard/DashboardHeader';
import { ClientList } from '@/components/coach/dashboard/ClientList';

const CoachDashboard = () => {
  const [unreadMessages] = useState(0);
  
  const { data: clients = [], refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <DashboardHeader unreadMessages={unreadMessages} />
      <main className="p-4 max-w-2xl mx-auto">
        <ClientList clients={clients} onClientDeleted={refetch} />
      </main>
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachDashboard;
