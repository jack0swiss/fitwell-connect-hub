
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientSelectionSidebarProps {
  clients: Client[] | undefined;
  selectedClient: string | null;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (query: string) => void;
  onClientSelect: (clientId: string) => void;
}

const ClientSelectionSidebar = ({
  clients,
  selectedClient,
  searchQuery,
  isLoading,
  onSearchChange,
  onClientSelect
}: ClientSelectionSidebarProps) => {
  const filteredClients = clients?.filter(client => 
    (client.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="md:col-span-1 bg-card p-4 rounded-lg">
      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="pl-8 bg-background"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-muted" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          No clients found
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {filteredClients.map(client => (
            <Button
              key={client.id}
              variant={selectedClient === client.id ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => onClientSelect(client.id)}
            >
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-xs text-muted-foreground">{client.email}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSelectionSidebar;
