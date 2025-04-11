
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutritionPlan } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface NutritionPlanListProps {
  searchQuery: string;
  onClientSelect: (clientId: string) => void;
}

type ClientWithPlan = {
  id: string;
  name: string;
  plan?: NutritionPlan;
};

const NutritionPlanList = ({ searchQuery, onClientSelect }: NutritionPlanListProps) => {
  const [clients, setClients] = useState<ClientWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Mock data for now - would come from a profiles table
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      
      // In a real implementation, this would fetch from a profiles table
      // and join with nutrition_plans
      // For now, we'll use mock data
      const mockClients: ClientWithPlan[] = [
        { id: '1', name: 'Sarah Johnson' },
        { id: '2', name: 'Michael Chen' },
        { id: '3', name: 'Emma Rodriguez' }
      ];
      
      try {
        // Fetch nutrition plans for each client
        const { data: plans, error } = await supabase
          .from('nutrition_plans')
          .select('*');
          
        if (error) throw error;
        
        // Attach plans to clients
        if (plans) {
          for (const client of mockClients) {
            const clientPlan = plans.find(p => p.client_id === client.id);
            if (clientPlan) client.plan = clientPlan;
          }
        }
      } catch (error) {
        console.error('Error fetching nutrition plans:', error);
        toast({
          title: 'Error',
          description: 'Failed to load nutrition plans',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setClients(mockClients);
      }
    };
    
    fetchClients();
  }, []);
  
  const handleEditPlan = (clientId: string, planId?: string) => {
    if (planId) {
      navigate(`/coach/nutrition/plan/${planId}`);
    } else {
      navigate(`/coach/nutrition/plan/new?clientId=${clientId}`);
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitwell-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Clients</h2>
      
      {filteredClients.length === 0 ? (
        <Card className="fitness-card">
          <CardContent className="py-6 text-center text-muted-foreground">
            No clients found.
          </CardContent>
        </Card>
      ) : (
        filteredClients.map(client => (
          <Card key={client.id} className="fitness-card overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="h-10 w-10 rounded-full bg-fitwell-purple/30 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-fitwell-purple" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {client.plan 
                      ? `${client.plan.daily_calorie_target} kcal/day` 
                      : 'No nutrition plan'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEditPlan(client.id, client.plan?.id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onClientSelect(client.id)}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default NutritionPlanList;
