
import { Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ClientProgressCard } from './ClientProgressCard';
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

interface ClientListProps {
  clients: Client[];
  onClientDeleted: () => void;
}

export function ClientList({ clients, onClientDeleted }: ClientListProps) {
  const navigate = useNavigate();

  const handleViewClientDetail = (clientId: string) => {
    navigate(`/coach/client/${clientId}`);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(clientId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      
      onClientDeleted();
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
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="bg-card p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="cursor-pointer" onClick={() => handleViewClientDetail(client.id)}>
              <h3 className="font-medium">{client.first_name} {client.last_name}</h3>
              <p className="text-sm text-muted-foreground">{client.email}</p>
              {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleViewClientDetail(client.id)}>
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/coach/client/${client.id}`)}>
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
          
          {/* Progress Metrics */}
          <ClientProgressCard clientId={client.id} />
        </div>
      ))}
    </div>
  );
}
