
import React, { useState } from 'react';
import { Bell, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import TabBar from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { ClientManagementDialog } from '@/components/coach/ClientManagementDialog';
import { useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const CoachDashboard = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  
  const { data: clients = [], refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    }
  });

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(clientId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-fitwell-dark text-white pb-20">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Coach Dashboard</h1>
        <div className="flex items-center space-x-4">
          <ClientManagementDialog />
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="relative" onClick={() => navigate('/coach/chat')}>
              <MessageCircle className="h-5 w-5" />
              {unreadMessages > 0 && (
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-fitwell-purple">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-4 max-w-2xl mx-auto">
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-card p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-medium">{client.first_name} {client.last_name}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/coach/clients/${client.id}`)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the client's account
                        and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <TabBar baseRoute="/coach" />
    </div>
  );
};

export default CoachDashboard;
