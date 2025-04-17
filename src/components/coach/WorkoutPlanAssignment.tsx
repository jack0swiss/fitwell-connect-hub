
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, WorkoutAssignment } from '@/types/workout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Check, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '../coach/nutrition/LoadingSpinner';

interface WorkoutPlanAssignmentProps {
  plan: WorkoutPlan;
  onBack: () => void;
}

type Client = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAssigned?: boolean;
  assignmentId?: string;
  assignmentStartDate?: string;
  assignmentEndDate?: string;
};

export const WorkoutPlanAssignment = ({ plan, onBack }: WorkoutPlanAssignmentProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientsAndAssignments = async () => {
      try {
        setLoading(true);
        
        // Fetch actual clients from the profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        
        // Convert profiles to client format
        const clientsData: Client[] = profilesData.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email || '',
          avatarUrl: profile.avatar_url,
        }));
        
        // Fetch existing assignments for this plan
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('workout_assignments')
          .select('*')
          .eq('plan_id', plan.id);
          
        if (assignmentsError) throw assignmentsError;
        
        // Mark clients as assigned if they have an assignment for this plan
        const clientsWithAssignments = clientsData.map(client => {
          const assignment = assignmentsData?.find(a => a.client_id === client.id);
          return {
            ...client,
            isAssigned: !!assignment,
            assignmentId: assignment?.id,
            assignmentStartDate: assignment?.start_date,
            assignmentEndDate: assignment?.end_date
          };
        });
        
        setClients(clientsWithAssignments);
        console.log('Fetched clients:', clientsWithAssignments);
      } catch (error) {
        console.error('Error fetching clients and assignments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load clients and assignments',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientsAndAssignments();
  }, [plan.id]);

  const toggleAssignment = async (client: Client) => {
    try {
      if (client.isAssigned) {
        // Remove assignment
        if (client.assignmentId) {
          const { error } = await supabase
            .from('workout_assignments')
            .delete()
            .eq('id', client.assignmentId);
            
          if (error) throw error;
          
          setClients(clients.map(c => 
            c.id === client.id 
              ? { ...c, isAssigned: false, assignmentId: undefined, assignmentStartDate: undefined, assignmentEndDate: undefined } 
              : c
          ));
          
          toast({
            title: 'Success',
            description: `Plan unassigned from ${client.name}`,
          });
        }
      } else {
        // Create new assignment starting today
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        const { data, error } = await supabase
          .from('workout_assignments')
          .insert({
            plan_id: plan.id,
            client_id: client.id,
            start_date: today
          })
          .select()
          .single();
          
        if (error) {
          console.error('Assignment error details:', error);
          throw error;
        }
        
        setClients(clients.map(c => 
          c.id === client.id 
            ? { 
                ...c, 
                isAssigned: true, 
                assignmentId: data.id,
                assignmentStartDate: data.start_date,
                assignmentEndDate: data.end_date
              } 
            : c
        ));
        
        toast({
          title: 'Success',
          description: `Plan assigned to ${client.name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive',
      });
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="flex items-center text-sm h-8 mb-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to plans
      </Button>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>Assign Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            )}
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Created {format(new Date(plan.created_at), 'PPP')}</span>
            </div>
          </div>
          
          <h3 className="text-md font-medium mb-3">Clients</h3>
          
          {loading ? (
            <LoadingSpinner />
          ) : clients.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No clients available to assign this plan to.
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={client.avatarUrl} alt={client.name} />
                      <AvatarFallback className="bg-fitwell-purple-dark text-white">
                        {getAvatarInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                      {client.assignmentStartDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned since: {format(new Date(client.assignmentStartDate), 'PPP')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={client.isAssigned ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleAssignment(client)}
                  >
                    {client.isAssigned ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Unassign
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
