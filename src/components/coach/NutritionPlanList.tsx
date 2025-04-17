
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Edit, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  email: string;
  plan?: NutritionPlan;
};

const NutritionPlanList = ({ searchQuery, onClientSelect }: NutritionPlanListProps) => {
  const navigate = useNavigate();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clientsWithNutritionPlans'],
    queryFn: async () => {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      console.log('Fetching clients and their nutrition plans');

      // Get all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Fetched profiles:', profiles?.length || 0);
      
      // If no profiles are found, return empty array
      if (!profiles || profiles.length === 0) return [];

      // Get nutrition plans
      const { data: plans, error: plansError } = await supabase
        .from('nutrition_plans')
        .select('*');

      if (plansError) {
        console.error('Error fetching plans:', plansError);
        throw plansError;
      }
      
      console.log('Fetched plans:', plans?.length || 0);

      // Map profiles to clients with their plans
      const clientsWithPlans = profiles.map(profile => {
        const clientPlan = plans?.find(p => p.client_id === profile.id);
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || `Client ${profile.id.substring(0, 6)}`,
          email: profile.email || "No email",
          plan: clientPlan
        };
      }) as ClientWithPlan[];
      
      console.log('Mapped clients with plans:', clientsWithPlans.length);
      
      return clientsWithPlans;
    }
  });
  
  const handleEditPlan = (clientId: string, planId?: string) => {
    if (planId) {
      navigate(`/coach/nutrition/plan/${planId}`);
    } else {
      navigate(`/coach/nutrition/plan/new?clientId=${clientId}`);
    }
  };
  
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  console.log('Filtered clients:', filteredClients.length);

  if (isLoading) {
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
