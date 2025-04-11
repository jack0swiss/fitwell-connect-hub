
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import TabBar from '@/components/TabBar';
import ClientListItem from '@/components/coach/ClientListItem';
import ClientDetailCard from '@/components/coach/ClientDetailCard';
import { Button } from '@/components/ui/button';

// Define the activity type to match the one expected by ClientDetailCard
type ActivityType = 'workout' | 'nutrition' | 'message';

// Mock data - would come from Supabase in a real app
const mockClients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    nextWorkout: 'Strength Training, Today',
    lastLogin: '2 hours ago',
    recentActivities: [
      { type: 'workout' as ActivityType, title: 'Completed Upper Body', date: 'Today' },
      { type: 'nutrition' as ActivityType, title: 'Logged Breakfast', date: 'Today' },
      { type: 'message' as ActivityType, title: 'Sent a question', date: 'Yesterday' },
    ],
    nextSessions: [
      { title: 'Strength Training', date: 'Today, 5:00 PM' },
      { title: 'Nutrition Assessment', date: 'Friday, 11:00 AM' },
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    nextWorkout: 'Cardio, Tomorrow',
    lastLogin: 'Yesterday',
    recentActivities: [
      { type: 'workout' as ActivityType, title: 'Missed Cardio Session', date: 'Yesterday' },
      { type: 'nutrition' as ActivityType, title: 'Updated Meal Plan', date: '2 days ago' },
    ],
    nextSessions: [
      { title: 'Cardio Training', date: 'Tomorrow, 3:30 PM' },
    ]
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    nextWorkout: 'Yoga, Wednesday',
    lastLogin: '3 days ago',
    recentActivities: [
      { type: 'message' as ActivityType, title: 'Asked about diet', date: '3 days ago' },
      { type: 'workout' as ActivityType, title: 'Completed Full Body', date: '4 days ago' },
    ],
    nextSessions: [
      { title: 'Yoga Session', date: 'Wednesday, 9:00 AM' },
      { title: 'Progress Review', date: 'Friday, 2:00 PM' },
    ]
  },
];

const CoachDashboard = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  const selectedClient = mockClients.find(client => client.id === selectedClientId);
  
  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
  };
  
  const handleBack = () => {
    setSelectedClientId(null);
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Coach Dashboard</h1>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-fitwell-purple rounded-full"></span>
        </Button>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        {selectedClient ? (
          <ClientDetailCard client={selectedClient} onBack={handleBack} />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-medium mb-4">Your Clients</h2>
            {mockClients.map(client => (
              <ClientListItem
                key={client.id}
                id={client.id}
                name={client.name}
                nextWorkout={client.nextWorkout}
                lastLogin={client.lastLogin}
                onSelect={handleClientSelect}
              />
            ))}
          </div>
        )}
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachDashboard;
